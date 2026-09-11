import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const {
  submissionFindFirstMock,
  analysisCreateMock,
  analysisUpdateMock,
  analysisFindManyMock,
  callGeminiMock,
} = vi.hoisted(() => ({
  submissionFindFirstMock: vi.fn(),
  analysisCreateMock: vi.fn(),
  analysisUpdateMock: vi.fn(),
  analysisFindManyMock: vi.fn(),
  callGeminiMock: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    submission: {
      findUnique: submissionFindFirstMock,
      findFirst: submissionFindFirstMock,
    },
    submissionAnalysis: {
      create: analysisCreateMock,
      update: analysisUpdateMock,
      findMany: analysisFindManyMock,
    },
  },
}));

vi.mock("@/lib/analysis/gemini", () => ({
  callGeminiForAnalysis: callGeminiMock,
}));

import {
  analyzeSubmission,
  getSubmissionAnalyses,
} from "@/lib/analysis/service";

describe("analyzeSubmission", () => {
  const mockProblem = {
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "EASY" as const,
    description: "Given an array of integers nums...",
    topics: [{ topic: { name: "Array" } }, { topic: { name: "Hash Table" } }],
    approaches: [
      {
        name: "Hash Map",
        solutions: [{ name: "One-pass hash map" }],
      },
    ],
  };

  const validOutputJson = JSON.stringify({
    review: {
      summary: "Efficient single-pass hash map solution.",
      isCorrect: true,
      timeComplexity: {
        value: "O(n)",
        explanation: "Single linear scan over the array.",
        reasoning: [
          "Iterates through the n elements once.",
          "Map lookup and insertion are O(1) average time.",
          "Total time is proportional to n.",
        ],
      },
      spaceComplexity: {
        value: "O(n)",
        explanation: "Allocates hash map proportional to unique elements.",
        reasoning: [
          "Stores up to n seen values in the dictionary.",
          "Worst case all elements stored before match is found.",
        ],
      },
      strengths: ["Clean single-pass implementation", "Optimal time complexity"],
      mistakes: [],
      conceptGaps: [],
      missedEdgeCases: ["Duplicate numbers handled correctly"],
      improvementSuggestions: ["Add type annotations"],
      learningTakeaways: ["Hash map enables instant complement lookup"],
    },
    draft: {
      approach: {
        name: "Hash Map",
        coreIdea: "Store complements in a dictionary.",
        whyItWorks: "Enables instant lookup of previously seen values.",
        whenToUse: "When searching for pairs that sum to a target.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        pros: "O(n) time.",
        cons: "O(n) extra memory.",
      },
      solution: {
        name: "One-pass Hash Map",
        description: "Check for complement in map during single pass.",
        algorithm: "1. Init map\n2. For each num: check target-num in map\n3. Return pair",
      },
      code: {
        language: "python3",
        code: "def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i",
      },
    },
  });

  const originalGeminiModel = process.env.GEMINI_MODEL;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.GEMINI_MODEL;
  });

  afterAll(() => {
    if (originalGeminiModel !== undefined) {
      process.env.GEMINI_MODEL = originalGeminiModel;
    } else {
      delete process.env.GEMINI_MODEL;
    }
  });

  it("analyzes an ACCEPTED submission and persists DRAFT_READY", async () => {
    const mockSubmission = {
      id: "sub-accepted-1",
      status: "ACCEPTED",
      language: "python3",
      code: "def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in seen:\n            return [seen[diff], i]\n        seen[n] = i",
      runtimeMs: 42,
      memoryBytes: BigInt(15000000),
      submittedAt: new Date("2026-09-10T10:00:00Z"),
      problem: mockProblem,
    };

    submissionFindFirstMock.mockResolvedValue(mockSubmission);

    const initialAnalysis = {
      id: "analysis-1",
      submissionId: mockSubmission.id,
      status: "GENERATING",
      modelName: "gemini-2.5-flash",
    };
    analysisCreateMock.mockResolvedValue(initialAnalysis);

    callGeminiMock.mockResolvedValue({
      rawText: validOutputJson,
      modelName: "gemini-2.5-flash",
    });

    const readyAnalysis = {
      ...initialAnalysis,
      status: "DRAFT_READY",
      review: JSON.parse(validOutputJson).review,
      draft: JSON.parse(validOutputJson).draft,
      errorMessage: null,
    };
    analysisUpdateMock.mockResolvedValue(readyAnalysis);

    const result = await analyzeSubmission("user-1", "sub-accepted-1");

    expect(submissionFindFirstMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "sub-accepted-1", userId: "user-1" } }),
    );

    expect(analysisCreateMock).toHaveBeenCalledWith({
      data: {
        submissionId: "sub-accepted-1",
        status: "GENERATING",
        modelName: "gemini-2.5-flash",
      },
    });

    expect(callGeminiMock).toHaveBeenCalled();
    const promptArg = callGeminiMock.mock.calls[0][0];

    // Verify exact Submission.code is included in AI input
    expect(promptArg).toContain(mockSubmission.code);
    expect(promptArg).toContain("ACCEPTED");

    // Verify complexity reasoning instructions are present
    expect(promptArg).toContain("COMPLEXITY REASONING");
    expect(promptArg).toContain("reasoning");
    expect(promptArg).toContain("Why is THIS user's code this complexity?");

    expect(analysisUpdateMock).toHaveBeenCalledWith({
      where: { id: "analysis-1" },
      data: expect.objectContaining({
        status: "DRAFT_READY",
        modelName: "gemini-2.5-flash",
        errorMessage: null,
      }),
    });

    expect(result.status).toBe("DRAFT_READY");
  });

  it("analyzes a failed (WRONG_ANSWER) submission and passes status to prompt", async () => {
    const mockFailedSubmission = {
      id: "sub-failed-1",
      status: "WRONG_ANSWER",
      language: "python3",
      code: "def twoSum(nums, target):\n    return [0, 1]",
      runtimeMs: 60,
      memoryBytes: BigInt(14000000),
      submittedAt: new Date("2026-09-10T11:00:00Z"),
      problem: mockProblem,
    };

    submissionFindFirstMock.mockResolvedValue(mockFailedSubmission);

    analysisCreateMock.mockResolvedValue({
      id: "analysis-failed-1",
      submissionId: mockFailedSubmission.id,
      status: "GENERATING",
      modelName: "gemini-2.5-flash",
    });

    callGeminiMock.mockResolvedValue({
      rawText: validOutputJson,
      modelName: "gemini-2.5-flash",
    });

    analysisUpdateMock.mockResolvedValue({
      id: "analysis-failed-1",
      status: "DRAFT_READY",
    });

    const result = await analyzeSubmission("user-1", "sub-failed-1");

    expect(callGeminiMock).toHaveBeenCalled();
    const promptArg = callGeminiMock.mock.calls[0][0];

    expect(promptArg).toContain("WRONG_ANSWER");
    expect(promptArg).toContain("FAILED submission (WRONG_ANSWER)");
    expect(promptArg).toContain(mockFailedSubmission.code);
    expect(result.status).toBe("DRAFT_READY");
  });

  it("handles missing submission code without calling Gemini and marks FAILED", async () => {
    const mockNoCodeSubmission = {
      id: "sub-no-code",
      status: "COMPILE_ERROR",
      language: "cpp",
      code: null,
      runtimeMs: null,
      memoryBytes: null,
      submittedAt: null,
      problem: mockProblem,
    };

    submissionFindFirstMock.mockResolvedValue(mockNoCodeSubmission);

    const failedAnalysis = {
      id: "analysis-no-code",
      submissionId: "sub-no-code",
      status: "FAILED",
      errorMessage: "Submission has no code to analyze",
    };
    analysisCreateMock.mockResolvedValue(failedAnalysis);

    const result = await analyzeSubmission("user-1", "sub-no-code");

    expect(callGeminiMock).not.toHaveBeenCalled();
    expect(analysisCreateMock).toHaveBeenCalledWith({
      data: {
        submissionId: "sub-no-code",
        status: "FAILED",
        errorMessage: "Submission has no code to analyze",
      },
    });
    expect(result.status).toBe("FAILED");
    expect(result.errorMessage).toBe("Submission has no code to analyze");
  });

  it("handles malformed Gemini output and updates status to FAILED", async () => {
    const mockSubmission = {
      id: "sub-malformed",
      status: "ACCEPTED",
      language: "python3",
      code: "print('hello')",
      runtimeMs: 10,
      memoryBytes: null,
      submittedAt: null,
      problem: mockProblem,
    };

    submissionFindFirstMock.mockResolvedValue(mockSubmission);
    analysisCreateMock.mockResolvedValue({
      id: "analysis-malformed",
      submissionId: "sub-malformed",
      status: "GENERATING",
    });

    callGeminiMock.mockResolvedValue({
      rawText: "This is not valid JSON at all",
      modelName: "gemini-2.5-flash",
    });

    analysisUpdateMock.mockResolvedValue({
      id: "analysis-malformed",
      status: "FAILED",
      errorMessage: "Malformed Gemini response: failed to parse JSON",
    });

    const result = await analyzeSubmission("user-1", "sub-malformed");

    expect(analysisUpdateMock).toHaveBeenCalledWith({
      where: { id: "analysis-malformed" },
      data: expect.objectContaining({
        status: "FAILED",
        errorMessage: expect.stringContaining("Malformed Gemini response"),
      }),
    });
    expect(result.status).toBe("FAILED");
  });

  it("handles schema validation failure on Gemini output and marks FAILED", async () => {
    const mockSubmission = {
      id: "sub-invalid-schema",
      status: "ACCEPTED",
      language: "python3",
      code: "print('hello')",
      runtimeMs: 10,
      memoryBytes: null,
      submittedAt: null,
      problem: mockProblem,
    };

    submissionFindFirstMock.mockResolvedValue(mockSubmission);
    analysisCreateMock.mockResolvedValue({
      id: "analysis-invalid-schema",
      submissionId: "sub-invalid-schema",
      status: "GENERATING",
    });

    // Missing required timeComplexity.reasoning
    const invalidOutput = JSON.stringify({
      review: {
        summary: "Incomplete review",
        isCorrect: true,
        timeComplexity: {
          value: "O(n)",
          explanation: "Linear",
          // missing reasoning!
        },
        spaceComplexity: {
          value: "O(1)",
          explanation: "Constant",
          reasoning: ["No extra space"],
        },
        strengths: [],
        mistakes: [],
        conceptGaps: [],
        missedEdgeCases: [],
        improvementSuggestions: [],
        learningTakeaways: [],
      },
      draft: {
        approach: {
          name: "Test",
          coreIdea: "Idea",
          whyItWorks: "Works",
          whenToUse: "Now",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          pros: "Fast",
          cons: "None",
        },
        solution: {
          name: "Sol",
          description: "Desc",
          algorithm: "Algo",
        },
        code: {
          language: "python3",
          code: "test",
        },
      },
    });

    callGeminiMock.mockResolvedValue({
      rawText: invalidOutput,
      modelName: "gemini-2.5-flash",
    });

    analysisUpdateMock.mockResolvedValue({
      id: "analysis-invalid-schema",
      status: "FAILED",
      errorMessage: "Validation failed on Gemini output: review.timeComplexity.reasoning: Required",
    });

    const result = await analyzeSubmission("user-1", "sub-invalid-schema");

    expect(analysisUpdateMock).toHaveBeenCalledWith({
      where: { id: "analysis-invalid-schema" },
      data: expect.objectContaining({
        status: "FAILED",
        errorMessage: expect.stringContaining("Validation failed on Gemini output"),
      }),
    });
    expect(result.status).toBe("FAILED");
  });

  it("handles Gemini API failure and marks FAILED", async () => {
    const mockSubmission = {
      id: "sub-api-error",
      status: "ACCEPTED",
      language: "python3",
      code: "print('hello')",
      runtimeMs: 10,
      memoryBytes: null,
      submittedAt: null,
      problem: mockProblem,
    };

    submissionFindFirstMock.mockResolvedValue(mockSubmission);
    analysisCreateMock.mockResolvedValue({
      id: "analysis-api-error",
      submissionId: "sub-api-error",
      status: "GENERATING",
    });

    callGeminiMock.mockRejectedValue(
      new Error("Gemini API error: Rate limit exceeded"),
    );

    analysisUpdateMock.mockResolvedValue({
      id: "analysis-api-error",
      status: "FAILED",
      errorMessage: "Gemini API error: Rate limit exceeded",
    });

    const result = await analyzeSubmission("user-1", "sub-api-error");

    expect(analysisUpdateMock).toHaveBeenCalledWith({
      where: { id: "analysis-api-error" },
      data: expect.objectContaining({
        status: "FAILED",
        errorMessage: "Gemini API error: Rate limit exceeded",
      }),
    });
    expect(result.status).toBe("FAILED");
  });

  it("throws when submission is not found", async () => {
    submissionFindFirstMock.mockResolvedValue(null);

    await expect(analyzeSubmission("user-1", "non-existent-sub")).rejects.toThrow(
      "Submission not found",
    );

    expect(analysisCreateMock).not.toHaveBeenCalled();
    expect(callGeminiMock).not.toHaveBeenCalled();
  });

  it("preserves analysis history by creating separate records on repeated analysis", async () => {
    const mockSubmission = {
      id: "sub-repeat-1",
      status: "ACCEPTED",
      language: "python3",
      code: "def solve(): pass",
      runtimeMs: 20,
      memoryBytes: null,
      submittedAt: null,
      problem: mockProblem,
    };

    submissionFindFirstMock.mockResolvedValue(mockSubmission);

    callGeminiMock.mockResolvedValue({
      rawText: validOutputJson,
      modelName: "gemini-2.5-flash",
    });

    // First call returns analysis #1
    analysisCreateMock.mockResolvedValueOnce({
      id: "analysis-1",
      submissionId: "sub-repeat-1",
      status: "GENERATING",
    });
    analysisUpdateMock.mockResolvedValueOnce({
      id: "analysis-1",
      status: "DRAFT_READY",
    });

    const firstResult = await analyzeSubmission("user-1", "sub-repeat-1");

    // Second call returns analysis #2
    analysisCreateMock.mockResolvedValueOnce({
      id: "analysis-2",
      submissionId: "sub-repeat-1",
      status: "GENERATING",
    });
    analysisUpdateMock.mockResolvedValueOnce({
      id: "analysis-2",
      status: "DRAFT_READY",
    });

    const secondResult = await analyzeSubmission("user-1", "sub-repeat-1");

    expect(analysisCreateMock).toHaveBeenCalledTimes(2);
    expect(analysisCreateMock).toHaveBeenNthCalledWith(1, {
      data: expect.objectContaining({ submissionId: "sub-repeat-1" }),
    });
    expect(analysisCreateMock).toHaveBeenNthCalledWith(2, {
      data: expect.objectContaining({ submissionId: "sub-repeat-1" }),
    });

    // The two analyses are distinct records
    expect(firstResult.id).toBe("analysis-1");
    expect(secondResult.id).toBe("analysis-2");
  });

  it("retrieves submission analysis history via getSubmissionAnalyses", async () => {
    submissionFindFirstMock.mockResolvedValue({ id: "sub-repeat-1", userId: "user-1" });
    analysisFindManyMock.mockResolvedValue([
      { id: "analysis-2", createdAt: new Date("2026-09-10T12:00:00Z") },
      { id: "analysis-1", createdAt: new Date("2026-09-10T10:00:00Z") },
    ]);

    const history = await getSubmissionAnalyses("user-1", "sub-repeat-1");

    expect(analysisFindManyMock).toHaveBeenCalledWith({
      where: { submissionId: "sub-repeat-1" },
      orderBy: { createdAt: "desc" },
    });
    expect(history.length).toBe(2);
  });

  it("respects GEMINI_MODEL environment variable override", async () => {
    process.env.GEMINI_MODEL = "gemini-custom-env";

    const mockSubmission = {
      id: "sub-env-model",
      status: "ACCEPTED",
      language: "python3",
      code: "x = 1",
      runtimeMs: 10,
      memoryBytes: null,
      submittedAt: null,
      problem: mockProblem,
    };
    submissionFindFirstMock.mockResolvedValue(mockSubmission);
    callGeminiMock.mockResolvedValue({
      rawText: validOutputJson,
      modelName: "gemini-custom-env",
    });
    analysisCreateMock.mockResolvedValue({
      id: "analysis-env",
      submissionId: "sub-env-model",
      status: "GENERATING",
    });
    analysisUpdateMock.mockResolvedValue({
      id: "analysis-env",
      status: "DRAFT_READY",
    });

    await analyzeSubmission("user-1", "sub-env-model");

    expect(analysisCreateMock).toHaveBeenCalledWith({
      data: {
        submissionId: "sub-env-model",
        status: "GENERATING",
        modelName: "gemini-custom-env",
      },
    });
    expect(callGeminiMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ modelName: "gemini-custom-env" }),
    );
  });

  it("prioritizes options.modelName over GEMINI_MODEL env var", async () => {
    process.env.GEMINI_MODEL = "gemini-env-override";

    const mockSubmission = {
      id: "sub-opt-model",
      status: "ACCEPTED",
      language: "python3",
      code: "x = 1",
      runtimeMs: 10,
      memoryBytes: null,
      submittedAt: null,
      problem: mockProblem,
    };
    submissionFindFirstMock.mockResolvedValue(mockSubmission);
    callGeminiMock.mockResolvedValue({
      rawText: validOutputJson,
      modelName: "gemini-options-explicit",
    });
    analysisCreateMock.mockResolvedValue({
      id: "analysis-opt",
      submissionId: "sub-opt-model",
      status: "GENERATING",
    });
    analysisUpdateMock.mockResolvedValue({
      id: "analysis-opt",
      status: "DRAFT_READY",
    });

    await analyzeSubmission("user-1", "sub-opt-model", {
      modelName: "gemini-options-explicit",
    });

    expect(analysisCreateMock).toHaveBeenCalledWith({
      data: {
        submissionId: "sub-opt-model",
        status: "GENERATING",
        modelName: "gemini-options-explicit",
      },
    });
    expect(callGeminiMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ modelName: "gemini-options-explicit" }),
    );
  });
});
