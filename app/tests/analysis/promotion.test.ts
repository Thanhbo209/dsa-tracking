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
  TRANSACTION_OPTIONS,
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
      userId: "user-1",
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

      const result = await promoteDraftToKnowledge("user-1", "sub-1", "analysis-1");

      // Verifies atomic update transition
      expect(submissionAnalysisUpdateManyMock).toHaveBeenCalledWith({
        where: {
          id: "analysis-1",
          status: { in: ["DRAFT_READY", "ACCEPTED"] },
        },
        data: {
          status: "ACCEPTED",
        },
      });

      // Verifies Approach created under derived problemId
      expect(approachCreateMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          problemId: "problem-100",
          userId: "user-1",
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
          code: validDraft.code.code,
        }),
      });

      // Verifies result object
      expect(result.analysis.status).toBe("ACCEPTED");
      expect(result.approach.id).toBe("app-1");
      expect(result.solution.id).toBe("sol-1");
      expect(result.code.id).toBe("code-1");

      // Verifies transaction options were applied
      expect(transactionMock).toHaveBeenCalledWith(
        expect.any(Function),
        TRANSACTION_OPTIONS,
      );
    });

    it("allows user to supply edited draft overrides on promotion", async () => {
      submissionAnalysisFindUniqueMock.mockResolvedValue(mockAnalysisRecord);
      submissionAnalysisUpdateManyMock.mockResolvedValue({ count: 1 });

      approachCreateMock.mockResolvedValue({ id: "app-1", problemId: "problem-100" });
      solutionCreateMock.mockResolvedValue({ id: "sol-1", approachId: "app-1" });
      codeCreateMock.mockResolvedValue({ id: "code-1", solutionId: "sol-1" });

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

      await promoteDraftToKnowledge("user-1", "sub-1", "analysis-1", editedDraft);

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
        promoteDraftToKnowledge("user-1", "sub-1", "analysis-1", invalidEditedDraft),
      ).rejects.toThrow();

      expect(approachCreateMock).not.toHaveBeenCalled();
    });

    it("throws error if analysis is not in DRAFT_READY or ACCEPTED status", async () => {
      submissionAnalysisFindUniqueMock.mockResolvedValue({
        ...mockAnalysisRecord,
        status: "FAILED",
      });

      await expect(
        promoteDraftToKnowledge("user-1", "sub-1", "analysis-1"),
      ).rejects.toThrow("Cannot accept analysis with status FAILED. Only DRAFT_READY or ACCEPTED analyses can be promoted to knowledge.");

      expect(approachCreateMock).not.toHaveBeenCalled();
    });

    it("throws error if analysis belongs to another submission", async () => {
      submissionAnalysisFindUniqueMock.mockResolvedValue({
        ...mockAnalysisRecord,
        submissionId: "other-sub-999",
      });

      await expect(
        promoteDraftToKnowledge("user-1", "sub-1", "analysis-1"),
      ).rejects.toThrow("Analysis does not belong to this submission");

      expect(approachCreateMock).not.toHaveBeenCalled();
    });

    it("handles concurrency: aborts if concurrent request already accepted the draft", async () => {
      submissionAnalysisFindUniqueMock.mockResolvedValue(mockAnalysisRecord);
      // updateMany returns 0 because another concurrent request just updated the status
      submissionAnalysisUpdateManyMock.mockResolvedValue({ count: 0 });

      await expect(
        promoteDraftToKnowledge("user-1", "sub-1", "analysis-1"),
      ).rejects.toThrow("Cannot accept analysis: analysis is no longer in DRAFT_READY or ACCEPTED status");

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
        promoteDraftToKnowledge("user-1", "sub-1", "analysis-1"),
      ).rejects.toThrow("Database connection lost");
    });

    it("promotes draft when analysis.draft is an AiRecommendation with available: true", async () => {
      submissionAnalysisFindUniqueMock.mockResolvedValue({
        ...mockAnalysisRecord,
        draft: {
          available: true,
          reason: "Asymptotically optimal alternative.",
          approach: validDraft.approach,
          solution: validDraft.solution,
          code: validDraft.code,
        },
      });
      submissionAnalysisUpdateManyMock.mockResolvedValue({ count: 1 });
      approachCreateMock.mockResolvedValue({ id: "app-rec-1", problemId: "problem-100" });
      solutionCreateMock.mockResolvedValue({ id: "sol-rec-1", approachId: "app-rec-1" });
      codeCreateMock.mockResolvedValue({ id: "code-rec-1", solutionId: "sol-rec-1" });

      const result = await promoteDraftToKnowledge("user-1", "sub-1", "analysis-1");

      expect(approachCreateMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "Hash Map Lookup",
          userId: "user-1",
          problemId: "problem-100",
        }),
      });
      expect(result.approach.id).toBe("app-rec-1");
    });

    it("throws error if analysis.draft is an AiRecommendation with available: false", async () => {
      submissionAnalysisFindUniqueMock.mockResolvedValue({
        ...mockAnalysisRecord,
        draft: {
          available: false,
          reason: "User solution is already optimal.",
        },
      });

      await expect(
        promoteDraftToKnowledge("user-1", "sub-1", "analysis-1"),
      ).rejects.toThrow("No AI recommendation is available to promote for this submission");
    });

    it("accepts edited draft with empty strings for optional fields like whenToUse and whyItWorks", async () => {
      const draftWithEmptyFields = {
        approach: {
          name: "Linear Scan",
          coreIdea: "Scan elements sequentially.",
          whyItWorks: "",
          whenToUse: "",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          pros: "",
          cons: "",
        },
        solution: {
          name: "Simple Scan",
          description: "",
          algorithm: "",
        },
        code: {
          language: "python",
          code: "def scan(): pass",
        },
      };

      submissionAnalysisFindUniqueMock.mockResolvedValue(mockAnalysisRecord);
      submissionAnalysisUpdateManyMock.mockResolvedValue({ count: 1 });
      approachCreateMock.mockResolvedValue({ id: "app-2", problemId: "problem-100" });
      solutionCreateMock.mockResolvedValue({ id: "sol-2", approachId: "app-2" });
      codeCreateMock.mockResolvedValue({ id: "code-2", solutionId: "sol-2" });

      const result = await promoteDraftToKnowledge("user-1", "sub-1", "analysis-1", draftWithEmptyFields);

      expect(approachCreateMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "Linear Scan",
          whenToUse: "",
        }),
      });
      expect(result.approach.id).toBe("app-2");
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

      const result = await rejectDraft("user-1", "sub-1", "analysis-1");

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
      expect(transactionMock).toHaveBeenCalledWith(
        expect.any(Function),
        TRANSACTION_OPTIONS,
      );
    });

    it("prevents rejecting an analysis that is not in DRAFT_READY status", async () => {
      submissionAnalysisFindUniqueMock.mockResolvedValue({
        ...mockAnalysisRecord,
        status: "REJECTED",
      });

      await expect(rejectDraft("user-1", "sub-1", "analysis-1")).rejects.toThrow(
        "Cannot reject analysis with status REJECTED",
      );

      expect(submissionAnalysisUpdateManyMock).not.toHaveBeenCalled();
    });
  });
});
