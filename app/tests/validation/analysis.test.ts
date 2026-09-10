import { describe, expect, it } from "vitest";
import {
  aiAnalysisInputSchema,
  aiAnalysisOutputSchema,
  complexityAnalysisSchema,
} from "@/lib/validation/analysis";

describe("aiAnalysisInputSchema", () => {
  const validProblem = {
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "EASY" as const,
    description: "Given an array of integers nums...",
    topics: ["Array", "Hash Table"],
  };

  const validSubmission = {
    id: "sub-123",
    status: "ACCEPTED" as const,
    language: "python3",
    code: "def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i",
    runtimeMs: 45,
    memoryBytes: 15728640,
    submittedAt: "2026-09-10T10:00:00.000Z",
  };

  it("accepts a valid accepted submission input with code and context", () => {
    const result = aiAnalysisInputSchema.safeParse({
      problem: validProblem,
      submission: validSubmission,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.submission.code).toBe(validSubmission.code);
      expect(result.data.submission.submittedAt).toBeInstanceOf(Date);
    }
  });

  it("accepts a valid failed submission input with code", () => {
    const result = aiAnalysisInputSchema.safeParse({
      problem: validProblem,
      submission: {
        ...validSubmission,
        status: "WRONG_ANSWER",
        code: "def twoSum(nums, target):\n    return [0, 1]",
        runtimeMs: 65,
        memoryBytes: 14000000,
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts nullable difficulty, runtime, memory, and submittedAt", () => {
    const result = aiAnalysisInputSchema.safeParse({
      problem: {
        ...validProblem,
        difficulty: null,
        description: null,
      },
      submission: {
        ...validSubmission,
        runtimeMs: null,
        memoryBytes: null,
        submittedAt: null,
      },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.problem.difficulty).toBeNull();
      expect(result.data.submission.runtimeMs).toBeNull();
      expect(result.data.submission.memoryBytes).toBeNull();
      expect(result.data.submission.submittedAt).toBeNull();
    }
  });

  it("accepts optional existing knowledge summary", () => {
    const result = aiAnalysisInputSchema.safeParse({
      problem: validProblem,
      submission: validSubmission,
      existingKnowledgeSummary: {
        approaches: [
          {
            name: "Hash Map",
            solutions: ["One-pass hash map", "Two-pass hash map"],
          },
        ],
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing submission code", () => {
    const { code: _, ...submissionWithoutCode } = validSubmission;
    const result = aiAnalysisInputSchema.safeParse({
      problem: validProblem,
      submission: submissionWithoutCode,
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty submission code", () => {
    const result = aiAnalysisInputSchema.safeParse({
      problem: validProblem,
      submission: {
        ...validSubmission,
        code: "",
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid problem difficulty", () => {
    const result = aiAnalysisInputSchema.safeParse({
      problem: {
        ...validProblem,
        difficulty: "VERY_HARD",
      },
      submission: validSubmission,
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid submission status", () => {
    const result = aiAnalysisInputSchema.safeParse({
      problem: validProblem,
      submission: {
        ...validSubmission,
        status: "NOT_A_REAL_STATUS",
      },
    });

    expect(result.success).toBe(false);
  });
});

describe("complexityAnalysisSchema", () => {
  it("accepts valid complexity with value, explanation, and reasoning array", () => {
    const result = complexityAnalysisSchema.safeParse({
      value: "O(n)",
      explanation: "The array is traversed once.",
      reasoning: [
        "The loop executes up to n times.",
        "Each iteration performs constant-time hash map lookup and insertion.",
        "No nested loops exist.",
        "Total time grows linearly with n.",
      ],
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing reasoning array", () => {
    const result = complexityAnalysisSchema.safeParse({
      value: "O(n)",
      explanation: "Traverses array once.",
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty reasoning array", () => {
    const result = complexityAnalysisSchema.safeParse({
      value: "O(n)",
      explanation: "Traverses array once.",
      reasoning: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty string in reasoning array", () => {
    const result = complexityAnalysisSchema.safeParse({
      value: "O(n)",
      explanation: "Traverses array once.",
      reasoning: ["Valid step", "   "],
    });

    expect(result.success).toBe(false);
  });
});

describe("aiAnalysisOutputSchema", () => {
  const validReview = {
    summary: "Clear one-pass hash map implementation.",
    isCorrect: true,
    timeComplexity: {
      value: "O(n)",
      explanation: "The array is scanned once with O(1) lookups.",
      reasoning: [
        "Loop runs up to n times.",
        "Hash map operations are O(1) average time.",
      ],
    },
    spaceComplexity: {
      value: "O(n)",
      explanation: "At most n elements stored in the hash map.",
      reasoning: [
        "A dictionary stores seen numbers.",
        "In the worst case where no pair is found until the end, n elements are stored.",
      ],
    },
    strengths: ["Single pass over input", "Clean early return"],
    mistakes: [],
    conceptGaps: [],
    missedEdgeCases: ["Array with duplicate complement values handled properly"],
    improvementSuggestions: ["Add type annotations"],
    learningTakeaways: ["Hash map provides O(1) complement lookup"],
  };

  const validDraft = {
    approach: {
      name: "Hash Map",
      coreIdea: "Use a hash map to store complements.",
      whyItWorks: "Enables instant lookup of previously seen numbers.",
      whenToUse: "When looking for pairs that sum to a target value.",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      pros: "Fast O(n) runtime.",
      cons: "Requires O(n) auxiliary memory.",
      notes: "Standard technique for Two Sum.",
    },
    solution: {
      name: "One-pass Hash Map",
      description: "Check for complement in map during the single pass.",
      algorithm: "1. Initialize empty hash map.\n2. For each number, check if target - num in map.\n3. If so, return indices.\n4. Otherwise store num: index.",
      notes: "Optimal balance of time and simplicity.",
    },
    code: {
      language: "python3",
      code: "def twoSum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in seen:\n            return [seen[diff], i]\n        seen[n] = i\n    return []",
      notes: "Canonical implementation.",
    },
  };

  it("accepts complete valid output with review and draft", () => {
    const result = aiAnalysisOutputSchema.safeParse({
      review: validReview,
      draft: validDraft,
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing required review fields", () => {
    const { summary: _, ...incompleteReview } = validReview;
    const result = aiAnalysisOutputSchema.safeParse({
      review: incompleteReview,
      draft: validDraft,
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid complexity structure in review", () => {
    const result = aiAnalysisOutputSchema.safeParse({
      review: {
        ...validReview,
        timeComplexity: "O(n)", // string instead of object with value, explanation, reasoning
      },
      draft: validDraft,
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing timeComplexity.reasoning in review", () => {
    const result = aiAnalysisOutputSchema.safeParse({
      review: {
        ...validReview,
        timeComplexity: {
          value: "O(n)",
          explanation: "Linear scan.",
          // reasoning omitted
        },
      },
      draft: validDraft,
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing spaceComplexity.reasoning in review", () => {
    const result = aiAnalysisOutputSchema.safeParse({
      review: {
        ...validReview,
        spaceComplexity: {
          value: "O(1)",
          explanation: "Constant space.",
          // reasoning omitted
        },
      },
      draft: validDraft,
    });

    expect(result.success).toBe(false);
  });

  it("rejects malformed draft structure", () => {
    const result = aiAnalysisOutputSchema.safeParse({
      review: validReview,
      draft: {
        approach: validDraft.approach,
        // missing solution and code
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing required draft fields", () => {
    const { algorithm: _, ...incompleteSolution } = validDraft.solution;
    const result = aiAnalysisOutputSchema.safeParse({
      review: validReview,
      draft: {
        ...validDraft,
        solution: incompleteSolution,
      },
    });

    expect(result.success).toBe(false);
  });
});
