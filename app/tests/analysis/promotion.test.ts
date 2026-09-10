import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  submissionAnalysisFindUniqueMock,
  submissionAnalysisUpdateManyMock,
  submissionAnalysisFindUniqueOrThrowMock,
  approachCreateMock,
  solutionCreateMock,
  codeCreateMock,
  transactionMock,
} = vi.hoisted(() => ({
  submissionAnalysisFindUniqueMock: vi.fn(),
  submissionAnalysisUpdateManyMock: vi.fn(),
  submissionAnalysisFindUniqueOrThrowMock: vi.fn(),
  approachCreateMock: vi.fn(),
  solutionCreateMock: vi.fn(),
  codeCreateMock: vi.fn(),
  transactionMock: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: transactionMock,
    submissionAnalysis: {
      findUnique: submissionAnalysisFindUniqueMock,
      updateMany: submissionAnalysisUpdateManyMock,
      findUniqueOrThrow: submissionAnalysisFindUniqueOrThrowMock,
    },
    approach: {
      create: approachCreateMock,
    },
    solution: {
      create: solutionCreateMock,
    },
    code: {
      create: codeCreateMock,
    },
  },
}));

import {
  promoteDraftToKnowledge,
  rejectDraft,
} from "@/lib/analysis/promotion";

describe("Knowledge Draft Promotion Service", () => {
  const validDraft = {
    approach: {
      name: "Hash Map Lookup",
      coreIdea: "Store visited numbers to find complement in O(1) time.",
      whyItWorks: "Complement target - x uniquely identifies matching element.",
      whenToUse: "Finding pairs or target sums in unsorted arrays.",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      pros: "Linear single-pass performance.",
      cons: "Requires auxiliary O(n) space.",
      notes: "Handles negative numbers properly.",
      mistakes: "Inserting before checking can cause self-match.",
    },
    solution: {
      name: "One-Pass Complement Search",
      description: "Iterates through array once while maintaining map.",
      algorithm: "1. Create Map\n2. Loop through nums\n3. Check complement\n4. Return indices",
      notes: "Safe access pattern.",
    },
    code: {
      language: "typescript",
      code: "function twoSum(nums: number[], target: number) { return []; }",
      notes: "Strict TypeScript implementation.",
    },
  };

  const mockAnalysisRecord = {
    id: "analysis-1",
    submissionId: "sub-1",
    status: "DRAFT_READY",
    modelName: "gemini-2.5-flash",
    review: { summary: "Good job" },
    draft: validDraft,
    errorMessage: null,
    createdAt: new Date("2026-09-10T10:00:00Z"),
    updatedAt: new Date("2026-09-10T10:00:00Z"),
    submission: {
      id: "sub-1",
      problemId: "problem-100",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default transaction executes callback with tx mock
    transactionMock.mockImplementation(async (callback: any) => {
      const tx = {
        submissionAnalysis: {
          findUnique: submissionAnalysisFindUniqueMock,
          updateMany: submissionAnalysisUpdateManyMock,
          findUniqueOrThrow: submissionAnalysisFindUniqueOrThrowMock,
        },
        approach: {
          create: approachCreateMock,
        },
        solution: {
          create: solutionCreateMock,
        },
        code: {
          create: codeCreateMock,
        },
      };
      return callback(tx);
    });
  });

  describe("promoteDraftToKnowledge", () => {
    it("promotes DRAFT_READY draft to Approach -> Solution -> Code in a transaction", async () => {
      submissionAnalysisFindUniqueMock.mockResolvedValue(mockAnalysisRecord);
      submissionAnalysisUpdateManyMock.mockResolvedValue({ count: 1 });

      const createdApproach = {
        id: "app-1",
        problemId: "problem-100",
        name: validDraft.approach.name,
      };
      approachCreateMock.mockResolvedValue(createdApproach);

      const createdSolution = {
        id: "sol-1",
        approachId: "app-1",
        name: validDraft.solution.name,
      };
      solutionCreateMock.mockResolvedValue(createdSolution);

      const createdCode = {
        id: "code-1",
        solutionId: "sol-1",
        language: "typescript",
        code: validDraft.code.code,
      };
      codeCreateMock.mockResolvedValue(createdCode);

      submissionAnalysisFindUniqueOrThrowMock.mockResolvedValue({
        ...mockAnalysisRecord,
        status: "ACCEPTED",
      });

      const result = await promoteDraftToKnowledge("sub-1", "analysis-1");

      // Verifies atomic update transition
      expect(submissionAnalysisUpdateManyMock).toHaveBeenCalledWith({
        where: {
          id: "analysis-1",
          status: "DRAFT_READY",
        },
        data: {
          status: "ACCEPTED",
        },
      });

      // Verifies Approach created under derived problemId
      expect(approachCreateMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          problemId: "problem-100",
          name: "Hash Map Lookup",
          timeComplexity: "O(n)",
        }),
      });

      // Verifies Solution created under approach.id
      expect(solutionCreateMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          approachId: "app-1",
          name: "One-Pass Complement Search",
          algorithm: validDraft.solution.algorithm,
        }),
      });

      // Verifies Code created under solution.id
      expect(codeCreateMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          solutionId: "sol-1",
          language: "typescript",
        }),
      });

      expect(result.analysis.status).toBe("ACCEPTED");
      expect(result.approach.id).toBe("app-1");
      expect(result.solution.id).toBe("sol-1");
      expect(result.code.id).toBe("code-1");
    });

    it("supports promoting a user-edited draft", async () => {
      submissionAnalysisFindUniqueMock.mockResolvedValue(mockAnalysisRecord);
      submissionAnalysisUpdateManyMock.mockResolvedValue({ count: 1 });

      approachCreateMock.mockResolvedValue({ id: "app-custom", problemId: "problem-100" });
      solutionCreateMock.mockResolvedValue({ id: "sol-custom", approachId: "app-custom" });
      codeCreateMock.mockResolvedValue({ id: "code-custom", solutionId: "sol-custom" });

      submissionAnalysisFindUniqueOrThrowMock.mockResolvedValue({
        ...mockAnalysisRecord,
        status: "ACCEPTED",
      });

      const editedDraft = {
        approach: {
          ...validDraft.approach,
          name: "Custom User Edited Approach",
        },
        solution: {
          ...validDraft.solution,
          name: "Custom User Solution",
        },
        code: {
          ...validDraft.code,
          code: "console.log('edited');",
        },
      };

      await promoteDraftToKnowledge("sub-1", "analysis-1", editedDraft);

      expect(approachCreateMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "Custom User Edited Approach",
        }),
      });
      expect(codeCreateMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          code: "console.log('edited');",
        }),
      });
    });

    it("rejects promotion if edited draft is missing required fields", async () => {
      const invalidEditedDraft = {
        approach: {
          // missing required name
          coreIdea: "idea",
        },
        solution: {},
        code: {},
      };

      await expect(
        promoteDraftToKnowledge("sub-1", "analysis-1", invalidEditedDraft),
      ).rejects.toThrow();

      expect(approachCreateMock).not.toHaveBeenCalled();
    });

    it("throws error if analysis is not in DRAFT_READY status", async () => {
      submissionAnalysisFindUniqueMock.mockResolvedValue({
        ...mockAnalysisRecord,
        status: "ACCEPTED", // already accepted
      });

      await expect(
        promoteDraftToKnowledge("sub-1", "analysis-1"),
      ).rejects.toThrow("Cannot accept analysis with status ACCEPTED");

      expect(approachCreateMock).not.toHaveBeenCalled();
    });

    it("throws error if analysis belongs to another submission", async () => {
      submissionAnalysisFindUniqueMock.mockResolvedValue({
        ...mockAnalysisRecord,
        submissionId: "other-sub-999",
      });

      await expect(
        promoteDraftToKnowledge("sub-1", "analysis-1"),
      ).rejects.toThrow("Analysis does not belong to this submission");

      expect(approachCreateMock).not.toHaveBeenCalled();
    });

    it("handles concurrency: aborts if concurrent request already accepted the draft", async () => {
      submissionAnalysisFindUniqueMock.mockResolvedValue(mockAnalysisRecord);
      // updateMany returns 0 because another concurrent request just updated the status
      submissionAnalysisUpdateManyMock.mockResolvedValue({ count: 0 });

      await expect(
        promoteDraftToKnowledge("sub-1", "analysis-1"),
      ).rejects.toThrow("Cannot accept analysis: analysis is no longer in DRAFT_READY status");

      // No Approach, Solution, or Code was created
      expect(approachCreateMock).not.toHaveBeenCalled();
      expect(solutionCreateMock).not.toHaveBeenCalled();
      expect(codeCreateMock).not.toHaveBeenCalled();
    });

    it("rolls back all changes if an error occurs during hierarchy creation", async () => {
      submissionAnalysisFindUniqueMock.mockResolvedValue(mockAnalysisRecord);
      submissionAnalysisUpdateManyMock.mockResolvedValue({ count: 1 });
      approachCreateMock.mockResolvedValue({ id: "app-1", problemId: "problem-100" });
      solutionCreateMock.mockResolvedValue({ id: "sol-1", approachId: "app-1" });
      // Simulate database crash during Code creation
      codeCreateMock.mockRejectedValue(new Error("Database connection lost"));

      await expect(
        promoteDraftToKnowledge("sub-1", "analysis-1"),
      ).rejects.toThrow("Database connection lost");
    });
  });

  describe("rejectDraft", () => {
    it("transitions DRAFT_READY analysis to REJECTED without creating knowledge records", async () => {
      submissionAnalysisFindUniqueMock.mockResolvedValue(mockAnalysisRecord);
      submissionAnalysisUpdateManyMock.mockResolvedValue({ count: 1 });
      submissionAnalysisFindUniqueOrThrowMock.mockResolvedValue({
        ...mockAnalysisRecord,
        status: "REJECTED",
      });

      const result = await rejectDraft("sub-1", "analysis-1");

      expect(submissionAnalysisUpdateManyMock).toHaveBeenCalledWith({
        where: {
          id: "analysis-1",
          status: "DRAFT_READY",
        },
        data: {
          status: "REJECTED",
        },
      });

      expect(approachCreateMock).not.toHaveBeenCalled();
      expect(solutionCreateMock).not.toHaveBeenCalled();
      expect(codeCreateMock).not.toHaveBeenCalled();
      expect(result.status).toBe("REJECTED");
    });

    it("prevents rejecting an analysis that is not in DRAFT_READY status", async () => {
      submissionAnalysisFindUniqueMock.mockResolvedValue({
        ...mockAnalysisRecord,
        status: "REJECTED",
      });

      await expect(rejectDraft("sub-1", "analysis-1")).rejects.toThrow(
        "Cannot reject analysis with status REJECTED",
      );

      expect(submissionAnalysisUpdateManyMock).not.toHaveBeenCalled();
    });
  });
});
