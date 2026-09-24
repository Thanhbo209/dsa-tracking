import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import {
  aiAnalysisInputSchema,
  aiAnalysisOutputSchema,
  type AiAnalysisInput,
} from "@/lib/validation/analysis";
import { buildAnalysisPrompt } from "./prompt";
import {
  callGeminiForAnalysis,
  type GeminiAnalysisOptions,
  type GeminiAnalysisResult,
} from "./gemini";
import { getActiveModel, switchModelOnQuotaError } from "./model-state";
import { isQuotaError, analyzeQuotaError } from "./quota";

export type AnalyzeSubmissionOptions = GeminiAnalysisOptions & {
  disableAutoFallback?: boolean;
};

export async function analyzeSubmission(
  userId: string,
  submissionId: string,
  options?: AnalyzeSubmissionOptions,
) {
  const submission = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      userId,
    },
    include: {
      problem: {
        include: {
          topics: {
            include: {
              topic: true,
            },
          },
          approaches: {
            where: {
              userId,
            },
            include: {
              solutions: true,
            },
          },
        },
      },
    },
  });

  if (!submission) {
    throw new Error("Submission not found or unauthorized");
  }

  // If the submission has no code to analyze, do not call Gemini
  if (!submission.code || submission.code.trim() === "") {
    return prisma.submissionAnalysis.create({
      data: {
        submissionId: submission.id,
        status: "FAILED",
        errorMessage: "Submission has no code to analyze",
      },
    });
  }

  const initialModel =
    options?.modelName || (await getActiveModel());

  // Create initial SubmissionAnalysis record in GENERATING state
  const analysis = await prisma.submissionAnalysis.create({
    data: {
      submissionId: submission.id,
      status: "GENERATING",
      modelName: initialModel,
    },
  });

  // Convert BigInt memoryBytes safely to number or null
  const safeMemoryBytes =
    submission.memoryBytes != null ? Number(submission.memoryBytes) : null;

  let input: AiAnalysisInput;
  try {
    input = aiAnalysisInputSchema.parse({
      problem: {
        title: submission.problem.title,
        slug: submission.problem.slug,
        difficulty: submission.problem.difficulty,
        description: submission.problem.description,
        topics: submission.problem.topics.map((pt) => pt.topic.name),
      },
      submission: {
        id: submission.id,
        status: submission.status,
        language: submission.language,
        code: submission.code,
        runtimeMs: submission.runtimeMs,
        memoryBytes: safeMemoryBytes,
        submittedAt: submission.submittedAt,
      },
      existingKnowledgeSummary: submission.problem.approaches.length
        ? {
            approaches: submission.problem.approaches.map((a) => ({
              name: a.name,
              solutions: a.solutions.map((s) => s.name),
            })),
          }
        : undefined,
    });
  } catch (validationError) {
    const message =
      validationError instanceof Error
        ? validationError.message
        : "Failed to construct valid AI input";
    return prisma.submissionAnalysis.update({
      where: { id: analysis.id },
      data: {
        status: "FAILED",
        errorMessage: message,
      },
    });
  }

  try {
    const prompt = buildAnalysisPrompt(input);

    let callResult: GeminiAnalysisResult;

    try {
      callResult = await callGeminiForAnalysis(prompt, {
        ...options,
        modelName: initialModel,
      });
    } catch (firstError) {
      if (options?.disableAutoFallback) {
        // User requested explicit model without automatic fallback
        if (isQuotaError(firstError)) {
          await switchModelOnQuotaError(initialModel, firstError);
        }

        const firstMessage =
          firstError instanceof Error
            ? firstError.message
            : "Failed during Gemini analysis";

        return await prisma.submissionAnalysis.update({
          where: { id: analysis.id },
          data: {
            status: "FAILED",
            modelName: initialModel,
            errorMessage: firstMessage,
          },
        });
      }

      if (isQuotaError(firstError)) {
        // Quota error on initial model -> switch and retry once with opposite model
        const switchResult = await switchModelOnQuotaError(initialModel, firstError);
        const fallbackModel = switchResult.newModel;

        try {
          callResult = await callGeminiForAnalysis(prompt, {
            ...options,
            modelName: fallbackModel,
          });
        } catch (retryError) {
          if (isQuotaError(retryError)) {
            // Both models are now in cooldown / quota-limited!
            // Strictly do NOT attempt a third switch/retry.
            const secondQuota = analyzeQuotaError(retryError, fallbackModel);
            const earliestCooldown =
              switchResult.quotaAnalysis.cooldownExpiresAt > secondQuota.cooldownExpiresAt
                ? switchResult.quotaAnalysis.cooldownExpiresAt
                : secondQuota.cooldownExpiresAt;

            return await prisma.submissionAnalysis.update({
              where: { id: analysis.id },
              data: {
                status: "FAILED",
                modelName: fallbackModel,
                errorMessage: `Both Gemini models (${initialModel}, ${fallbackModel}) are currently rate-limited; earliest retry at ${earliestCooldown.toISOString()}`,
              },
            });
          }

          // Non-quota error on retry
          const retryMessage =
            retryError instanceof Error
              ? retryError.message
              : "Failed during fallback Gemini model execution";
          return await prisma.submissionAnalysis.update({
            where: { id: analysis.id },
            data: {
              status: "FAILED",
              modelName: fallbackModel,
              errorMessage: retryMessage,
            },
          });
        }
      } else {
        // Non-quota error on initial model: fail without switching
        const firstMessage =
          firstError instanceof Error
            ? firstError.message
            : "Failed during Gemini analysis";
        return await prisma.submissionAnalysis.update({
          where: { id: analysis.id },
          data: {
            status: "FAILED",
            modelName: initialModel,
            errorMessage: firstMessage,
          },
        });
      }
    }

    const { rawText, modelName } = callResult;

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawText);
    } catch {
      return await prisma.submissionAnalysis.update({
        where: { id: analysis.id },
        data: {
          status: "FAILED",
          modelName,
          errorMessage: "Malformed Gemini response: failed to parse JSON",
        },
      });
    }

    const outputValidation = aiAnalysisOutputSchema.safeParse(parsedJson);
    if (!outputValidation.success) {
      const issuesSummary = outputValidation.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      return await prisma.submissionAnalysis.update({
        where: { id: analysis.id },
        data: {
          status: "FAILED",
          modelName,
          errorMessage: `Validation failed on Gemini output: ${issuesSummary}`,
        },
      });
    }

    // Successfully analyzed and validated
    const reviewJson =
      outputValidation.data.review as unknown as Prisma.InputJsonValue;
    const rawDraft =
      outputValidation.data.recommendation ??
      outputValidation.data.draft ??
      null;
    const draftJson =
      rawDraft === null
        ? undefined
        : (rawDraft as unknown as Prisma.InputJsonValue);

    return await prisma.submissionAnalysis.update({
      where: { id: analysis.id },
      data: {
        status: "DRAFT_READY",
        modelName,
        review: reviewJson,
        draft: draftJson,
        errorMessage: null,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gemini analysis failed";
    return await prisma.submissionAnalysis.update({
      where: { id: analysis.id },
      data: {
        status: "FAILED",
        errorMessage: message,
      },
    });
  }
}

export async function getSubmissionAnalyses(
  userId: string,
  submissionId: string,
) {
  const submission = await prisma.submission.findFirst({
    where: { id: submissionId, userId },
  });

  if (!submission) {
    return [];
  }

  return prisma.submissionAnalysis.findMany({
    where: { submissionId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSubmissionAnalysis(userId: string, id: string) {
  return prisma.submissionAnalysis.findFirst({
    where: {
      id,
      submission: {
        userId,
      },
    },
  });
}

