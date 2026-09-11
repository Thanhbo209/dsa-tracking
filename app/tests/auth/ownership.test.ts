import { describe, expect, it, vi } from "vitest";
import {
  getApproach,
  updateApproach,
  deleteApproach,
} from "@/lib/approaches/service";
import {
  getSolution,
  updateSolution,
  deleteSolution,
} from "@/lib/solutions/service";
import {
  getCode,
  updateCode,
  deleteCode,
} from "@/lib/codes/service";
import {
  analyzeSubmission,
  getSubmissionAnalysis,
} from "@/lib/analysis/service";
import {
  promoteDraftToKnowledge,
  rejectDraft,
} from "@/lib/analysis/promotion";

const {
  approachFindFirstMock,
  approachUpdateMock,
  approachDeleteMock,
  solutionFindFirstMock,
  solutionUpdateMock,
  solutionDeleteMock,
  codeFindFirstMock,
  codeUpdateMock,
  codeDeleteMock,
  submissionFindFirstMock,
  analysisFindFirstMock,
  transactionMock,
} = vi.hoisted(() => ({
  approachFindFirstMock: vi.fn(),
  approachUpdateMock: vi.fn(),
  approachDeleteMock: vi.fn(),
  solutionFindFirstMock: vi.fn(),
  solutionUpdateMock: vi.fn(),
  solutionDeleteMock: vi.fn(),
  codeFindFirstMock: vi.fn(),
  codeUpdateMock: vi.fn(),
  codeDeleteMock: vi.fn(),
  submissionFindFirstMock: vi.fn(),
  analysisFindFirstMock: vi.fn(),
  transactionMock: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    approach: {
      findFirst: approachFindFirstMock,
      update: approachUpdateMock,
      delete: approachDeleteMock,
    },
    solution: {
      findFirst: solutionFindFirstMock,
      update: solutionUpdateMock,
      delete: solutionDeleteMock,
    },
    code: {
      findFirst: codeFindFirstMock,
      update: codeUpdateMock,
      delete: codeDeleteMock,
    },
    submission: {
      findFirst: submissionFindFirstMock,
    },
    submissionAnalysis: {
      findFirst: analysisFindFirstMock,
    },
    $transaction: transactionMock,
  },
}));

describe("Ownership Security Boundaries", () => {
  const userA = "user-a";
  const userB = "user-b";

  describe("Approach Ownership", () => {
    it("prevents User A from reading User B's approach", async () => {
      // DB has approach belonging to User B
      approachFindFirstMock.mockImplementation(({ where }) => {
        if (where.userId === userB && where.id === "approach-b") {
          return Promise.resolve({ id: "approach-b", userId: userB });
        }
        return Promise.resolve(null);
      });

      const result = await getApproach(userA, "approach-b");
      expect(result).toBeNull();
    });

    it("prevents User A from updating User B's approach", async () => {
      // Approach belongs to userB, so querying with userA returns null
      approachFindFirstMock.mockImplementation(({ where }) => {
        if (where.userId === userB && where.id === "approach-b") {
          return Promise.resolve({ id: "approach-b", userId: userB });
        }
        return Promise.resolve(null);
      });

      await expect(
        updateApproach(userA, "approach-b", { name: "Malicious Edit" }),
      ).rejects.toThrow("Approach not found or unauthorized");

      expect(approachUpdateMock).not.toHaveBeenCalled();
    });

    it("prevents User A from deleting User B's approach", async () => {
      approachFindFirstMock.mockImplementation(({ where }) => {
        if (where.userId === userB && where.id === "approach-b") {
          return Promise.resolve({ id: "approach-b", userId: userB });
        }
        return Promise.resolve(null);
      });

      await expect(deleteApproach(userA, "approach-b")).rejects.toThrow(
        "Approach not found or unauthorized",
      );

      expect(approachDeleteMock).not.toHaveBeenCalled();
    });
  });

  describe("Solution Derived Ownership", () => {
    it("prevents User A from reading User B's solution", async () => {
      solutionFindFirstMock.mockImplementation(({ where }) => {
        if (where.id === "sol-b" && where.approach?.userId === userB) {
          return Promise.resolve({ id: "sol-b" });
        }
        return Promise.resolve(null);
      });

      const result = await getSolution(userA, "sol-b");
      expect(result).toBeNull();
    });

    it("prevents User A from modifying User B's solution", async () => {
      solutionFindFirstMock.mockImplementation(({ where }) => {
        if (where.id === "sol-b" && where.approach?.userId === userB) {
          return Promise.resolve({ id: "sol-b" });
        }
        return Promise.resolve(null);
      });

      await expect(
        updateSolution(userA, "sol-b", { name: "Malicious Solution" }),
      ).rejects.toThrow("Solution not found or unauthorized");

      expect(solutionUpdateMock).not.toHaveBeenCalled();
    });

    it("prevents User A from deleting User B's solution", async () => {
      solutionFindFirstMock.mockImplementation(({ where }) => {
        if (where.id === "sol-b" && where.approach?.userId === userB) {
          return Promise.resolve({ id: "sol-b" });
        }
        return Promise.resolve(null);
      });

      await expect(deleteSolution(userA, "sol-b")).rejects.toThrow(
        "Solution not found or unauthorized",
      );

      expect(solutionDeleteMock).not.toHaveBeenCalled();
    });
  });

  describe("Code Derived Ownership", () => {
    it("prevents User A from reading User B's code", async () => {
      codeFindFirstMock.mockImplementation(({ where }) => {
        if (
          where.id === "code-b" &&
          where.solution?.approach?.userId === userB
        ) {
          return Promise.resolve({ id: "code-b" });
        }
        return Promise.resolve(null);
      });

      const result = await getCode(userA, "code-b");
      expect(result).toBeNull();
    });

    it("prevents User A from modifying User B's code", async () => {
      codeFindFirstMock.mockImplementation(({ where }) => {
        if (
          where.id === "code-b" &&
          where.solution?.approach?.userId === userB
        ) {
          return Promise.resolve({ id: "code-b" });
        }
        return Promise.resolve(null);
      });

      await expect(
        updateCode(userA, "code-b", { code: "console.log('pwned')" }),
      ).rejects.toThrow("Code not found or unauthorized");

      expect(codeUpdateMock).not.toHaveBeenCalled();
    });

    it("prevents User A from deleting User B's code", async () => {
      codeFindFirstMock.mockImplementation(({ where }) => {
        if (
          where.id === "code-b" &&
          where.solution?.approach?.userId === userB
        ) {
          return Promise.resolve({ id: "code-b" });
        }
        return Promise.resolve(null);
      });

      await expect(deleteCode(userA, "code-b")).rejects.toThrow(
        "Code not found or unauthorized",
      );

      expect(codeDeleteMock).not.toHaveBeenCalled();
    });
  });

  describe("Submission & Analysis Ownership", () => {
    it("prevents User A from analyzing User B's submission", async () => {
      submissionFindFirstMock.mockImplementation(({ where }) => {
        if (where.id === "sub-b" && where.userId === userB) {
          return Promise.resolve({ id: "sub-b" });
        }
        return Promise.resolve(null);
      });

      await expect(analyzeSubmission(userA, "sub-b")).rejects.toThrow(
        "Submission not found or unauthorized",
      );
    });

    it("prevents User A from reading User B's submission analysis", async () => {
      analysisFindFirstMock.mockImplementation(({ where }) => {
        if (where.id === "analysis-b" && where.submission?.userId === userB) {
          return Promise.resolve({ id: "analysis-b" });
        }
        return Promise.resolve(null);
      });

      const result = await getSubmissionAnalysis(userA, "analysis-b");
      expect(result).toBeNull();
    });

    it("prevents User A from accepting User B's analysis", async () => {
      transactionMock.mockImplementation(async (callback) => {
        const tx = {
          submissionAnalysis: {
            findUnique: vi.fn().mockResolvedValue({
              id: "analysis-b",
              submissionId: "sub-b",
              submission: {
                id: "sub-b",
                problemId: "prob-1",
                userId: userB, // belongs to User B
              },
            }),
          },
        };
        return callback(tx);
      });

      await expect(
        promoteDraftToKnowledge(userA, "sub-b", "analysis-b"),
      ).rejects.toThrow("Analysis not found or unauthorized");
    });

    it("prevents User A from rejecting User B's analysis", async () => {
      transactionMock.mockImplementation(async (callback) => {
        const tx = {
          submissionAnalysis: {
            findUnique: vi.fn().mockResolvedValue({
              id: "analysis-b",
              submissionId: "sub-b",
              submission: {
                id: "sub-b",
                userId: userB, // belongs to User B
              },
            }),
          },
        };
        return callback(tx);
      });

      await expect(
        rejectDraft(userA, "sub-b", "analysis-b"),
      ).rejects.toThrow("Analysis not found or unauthorized");
    });
  });
});
