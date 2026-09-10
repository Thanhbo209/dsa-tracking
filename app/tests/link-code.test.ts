import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockSubmission, mockCode } = vi.hoisted(() => ({
  mockSubmission: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  mockCode: {
    findUnique: vi.fn(),
  },
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    submission: mockSubmission,
    code: mockCode,
  },
}));

import { linkSubmissionToCode } from "@/lib/submissions/link-code";

describe("linkSubmissionToCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("links a submission to a valid code", async () => {
    mockCode.findUnique.mockResolvedValue({
      id: "code-1",
      solution: {
        approach: {
          problemId: "problem-1",
        },
      },
    });

    mockSubmission.findUnique.mockResolvedValue({
      problemId: "problem-1",
    });

    const updatedSubmission = {
      id: "submission-1",
      problemId: "problem-1",
      codeId: "code-1",
    };

    mockSubmission.update.mockResolvedValue(updatedSubmission);

    const result = await linkSubmissionToCode("submission-1", "code-1");

    expect(mockCode.findUnique).toHaveBeenCalledWith({
      where: {
        id: "code-1",
      },
      select: {
        id: true,
        solution: {
          select: {
            approach: {
              select: {
                problemId: true,
              },
            },
          },
        },
      },
    });

    expect(mockSubmission.findUnique).toHaveBeenCalledWith({
      where: {
        id: "submission-1",
      },
      select: {
        problemId: true,
      },
    });

    expect(mockSubmission.update).toHaveBeenCalledWith({
      where: {
        id: "submission-1",
      },
      data: {
        codeId: "code-1",
      },
    });

    expect(result).toEqual(updatedSubmission);
  });

  it("rejects a nonexistent code", async () => {
    mockCode.findUnique.mockResolvedValue(null);

    await expect(
      linkSubmissionToCode("submission-1", "code-1"),
    ).rejects.toThrow("Code not found");

    expect(mockSubmission.findUnique).not.toHaveBeenCalled();
    expect(mockSubmission.update).not.toHaveBeenCalled();
  });

  it("rejects a nonexistent submission", async () => {
    mockCode.findUnique.mockResolvedValue({
      id: "code-1",
      solution: {
        approach: {
          problemId: "problem-1",
        },
      },
    });

    mockSubmission.findUnique.mockResolvedValue(null);

    await expect(
      linkSubmissionToCode("submission-1", "code-1"),
    ).rejects.toThrow("Submission not found");

    expect(mockSubmission.update).not.toHaveBeenCalled();
  });

  it("rejects a code belonging to another problem", async () => {
    mockCode.findUnique.mockResolvedValue({
      id: "code-1",
      solution: {
        approach: {
          problemId: "problem-2",
        },
      },
    });

    mockSubmission.findUnique.mockResolvedValue({
      problemId: "problem-1",
    });

    await expect(
      linkSubmissionToCode("submission-1", "code-1"),
    ).rejects.toThrow("Code does not belong to the submission's problem");

    expect(mockSubmission.update).not.toHaveBeenCalled();
  });

  it("allows unlinking a submission from a code", async () => {
    const updatedSubmission = {
      id: "submission-1",
      problemId: "problem-1",
      codeId: null,
    };

    mockSubmission.update.mockResolvedValue(updatedSubmission);

    const result = await linkSubmissionToCode("submission-1", null);

    expect(mockCode.findUnique).not.toHaveBeenCalled();
    expect(mockSubmission.findUnique).not.toHaveBeenCalled();

    expect(mockSubmission.update).toHaveBeenCalledWith({
      where: {
        id: "submission-1",
      },
      data: {
        codeId: null,
      },
    });

    expect(result).toEqual(updatedSubmission);
  });
});
