import { prisma } from "@/lib/db/prisma";
import {
  aiAnalysisInputSchema,
  aiAnalysisOutputSchema,
  type AiAnalysisInput,
} from "@/lib/validation/analysis";
import { buildAnalysisPrompt } from "./prompt";
import { callGeminiForAnalysis, type GeminiAnalysisOptions } from "./gemini";

export interface AnalyzeSubmissionOptions extends GeminiAnalysisOptions {}

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

  const configuredModel =
    options?.modelName || process.env.GEMINI_MODEL || "gemini-2.5-flash";

  // Create initial SubmissionAnalysis record in GENERATING state
  const analysis = await prisma.submissionAnalysis.create({
    data: {
      submissionId: submission.id,
      status: "GENERATING",
      modelName: configuredModel,
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
    const { rawText, modelName } = await callGeminiForAnalysis(prompt, {
      ...options,
      modelName: configuredModel,
    });

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
    return await prisma.submissionAnalysis.update({
      where: { id: analysis.id },
      data: {
        status: "DRAFT_READY",
        modelName,
        review: outputValidation.data.review,
        draft: outputValidation.data.draft,
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

