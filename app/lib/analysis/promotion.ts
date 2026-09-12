import { prisma } from "@/lib/db/prisma";
import {
  aiDraftSchema,
  type AiDraft,
} from "@/lib/validation/analysis";

export interface PromoteDraftResult {
  analysis: {
    id: string;
    submissionId: string;
    status: string;
    modelName: string | null;
    review: unknown;
    draft: unknown;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  approach: {
    id: string;
    problemId: string;
    name: string;
    coreIdea: string | null;
    whyItWorks: string | null;
    whenToUse: string | null;
    timeComplexity: string | null;
    spaceComplexity: string | null;
    pros: string | null;
    cons: string | null;
    notes: string | null;
    mistakes: string | null;
  };
  solution: {
    id: string;
    approachId: string;
    name: string;
    description: string | null;
    algorithm: string | null;
    notes: string | null;
  };
  code: {
    id: string;
    solutionId: string;
    language: string;
    code: string;
    notes: string | null;
  };
}

/**
 * Interactive transaction options.
 * Over remote poolers (e.g. Supabase across regions), acquiring a client connection
 * and issuing BEGIN can exceed Prisma's default 2000ms maxWait.
 */
export const TRANSACTION_OPTIONS = {
  maxWait: 15000, // Wait up to 15 seconds to acquire a connection from the pool
  timeout: 30000, // Wait up to 30 seconds for transaction queries to complete
};

export async function promoteDraftToKnowledge(
  userId: string,
  submissionId: string,
  analysisId: string,
  editedDraftInput?: unknown,
): Promise<PromoteDraftResult> {
  if (!submissionId || !analysisId) {
    throw new Error("Submission ID and Analysis ID are required");
  }

  // If the user provided an edited draft, validate it upfront
  let validatedEditedDraft: AiDraft | undefined;
  if (editedDraftInput !== undefined && editedDraftInput !== null) {
    validatedEditedDraft = aiDraftSchema.parse(editedDraftInput);
  }

  return await prisma.$transaction(
    async (tx) => {
    // 1. Fetch analysis and derive the problemId through submission relation
    const analysis = await tx.submissionAnalysis.findUnique({
      where: { id: analysisId },
      include: {
        submission: {
          select: {
            id: true,
            problemId: true,
            userId: true,
          },
        },
      },
    });

    if (!analysis || analysis.submission.userId !== userId) {
      throw new Error("Analysis not found or unauthorized");
    }

    if (analysis.submissionId !== submissionId) {
      throw new Error("Analysis does not belong to this submission");
    }

    if (analysis.status !== "DRAFT_READY" && analysis.status !== "ACCEPTED") {
      throw new Error(
        `Cannot accept analysis with status ${analysis.status}. Only DRAFT_READY or ACCEPTED analyses can be promoted to knowledge.`,
      );
    }

    // 2. Determine draft to use: edited draft takes precedence, otherwise use stored draft
    const rawDraft = validatedEditedDraft || analysis.draft;
    if (!rawDraft) {
      throw new Error("Analysis contains no knowledge draft to promote");
    }

    const draftToUse: AiDraft = validatedEditedDraft
      ? validatedEditedDraft
      : aiDraftSchema.parse(rawDraft);

    // 3. Concurrency-safe atomic transition from DRAFT_READY / ACCEPTED -> ACCEPTED
    const updateResult = await tx.submissionAnalysis.updateMany({
      where: {
        id: analysisId,
        status: { in: ["DRAFT_READY", "ACCEPTED"] },
      },
      data: {
        status: "ACCEPTED",
      },
    });

    if (updateResult.count === 0) {
      throw new Error(
        "Cannot accept analysis: analysis is no longer in DRAFT_READY or ACCEPTED status",
      );
    }

    // 4. Create Approach under the server-derived problemId and authenticated userId
    const approach = await tx.approach.create({
      data: {
        userId,
        problemId: analysis.submission.problemId,
        // Strip any display-only status suffixes that KnowledgeDraftSection may have
        // appended to approach.name (e.g. " (My Accepted Implementation)").
        // Only the bare algorithmic name (e.g. "Horizontal Scanning") belongs in the DB.
        name: draftToUse.approach.name
          .replace(/\s*\(My Accepted Implementation\)\s*$/, "")
          .replace(/\s*\(My Attempt\)\s*$/, "")
          .trim(),
        coreIdea: draftToUse.approach.coreIdea,
        whyItWorks: draftToUse.approach.whyItWorks,
        whenToUse: draftToUse.approach.whenToUse,
        timeComplexity: draftToUse.approach.timeComplexity,
        spaceComplexity: draftToUse.approach.spaceComplexity,
        pros: draftToUse.approach.pros,
        cons: draftToUse.approach.cons,
        notes: draftToUse.approach.notes,
        mistakes: draftToUse.approach.mistakes,
      },
    });

    // 5. Create Solution under the created Approach
    const solution = await tx.solution.create({
      data: {
        approachId: approach.id,
        name: draftToUse.solution.name,
        description: draftToUse.solution.description,
        algorithm: draftToUse.solution.algorithm,
        notes: draftToUse.solution.notes,
      },
    });

    // 6. Create Code under the created Solution
    const code = await tx.code.create({
      data: {
        solutionId: solution.id,
        language: draftToUse.code.language,
        code: draftToUse.code.code,
        notes: draftToUse.code.notes,
      },
    });

    // Fetch the updated analysis record
    const updatedAnalysis = await tx.submissionAnalysis.findUniqueOrThrow({
      where: { id: analysisId },
    });

    return {
      analysis: updatedAnalysis,
      approach,
      solution,
      code,
    };
  }, TRANSACTION_OPTIONS);
}

export async function rejectDraft(
  userId: string,
  submissionId: string,
  analysisId: string,
) {
  if (!submissionId || !analysisId) {
    throw new Error("Submission ID and Analysis ID are required");
  }

  return await prisma.$transaction(async (tx) => {
    const analysis = await tx.submissionAnalysis.findUnique({
      where: { id: analysisId },
      include: {
        submission: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!analysis || analysis.submission.userId !== userId) {
      throw new Error("Analysis not found or unauthorized");
    }

    if (analysis.submissionId !== submissionId) {
      throw new Error("Analysis does not belong to this submission");
    }

    if (analysis.status !== "DRAFT_READY") {
      throw new Error(
        `Cannot reject analysis with status ${analysis.status}. Only DRAFT_READY analyses can be rejected.`,
      );
    }

    // Atomic conditional status update
    const updateResult = await tx.submissionAnalysis.updateMany({
      where: {
        id: analysisId,
        status: "DRAFT_READY",
      },
      data: {
        status: "REJECTED",
      },
    });

    if (updateResult.count === 0) {
      throw new Error(
        "Cannot reject analysis: analysis is no longer in DRAFT_READY status",
      );
    }

    return await tx.submissionAnalysis.findUniqueOrThrow({
      where: { id: analysisId },
    });
  }, TRANSACTION_OPTIONS);
}
