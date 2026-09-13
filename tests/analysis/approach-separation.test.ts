import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  aiAnalysisOutputSchema,
  type AiAnalysisOutput,
} from "@/lib/validation/analysis";
import { buildAnalysisPrompt } from "@/lib/analysis/prompt";
import { promoteDraftToKnowledge } from "@/lib/analysis/promotion";

const {
  submissionAnalysisFindUniqueMock,
  submissionAnalysisUpdateManyMock,
  submissionAnalysisFindUniqueOrThrowMock,
  approachCreateMock,
  solutionCreateMock,
  codeCreateMock,
  prismaTransactionMock,
} = vi.hoisted(() => ({
  submissionAnalysisFindUniqueMock: vi.fn(),
  submissionAnalysisUpdateManyMock: vi.fn(),
  submissionAnalysisFindUniqueOrThrowMock: vi.fn(),
  approachCreateMock: vi.fn(),
  solutionCreateMock: vi.fn(),
  codeCreateMock: vi.fn(),
  prismaTransactionMock: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: prismaTransactionMock,
  },
}));

describe("Actual Approach vs. AI Recommendation Separation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaTransactionMock.mockImplementation(async (callback) => {
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
      return await callback(tx);
    });
  });

  // ── Test 1: Optimal Hash Map ────────────────────────────────────────────────
  it("Test 1: Validates that an optimal Hash Map submission preserves actualApproach as 'Hash Map'", () => {
    const output: AiAnalysisOutput = {
      review: {
        actualApproach: {
          name: "Hash Map",
          coreIdea: "Store complements in a dictionary for O(1) average lookup.",
          explanation: "Single pass through nums looking up complement in hash map.",
        },
        actualSolution: {
          name: "One-Pass Complement Lookup",
          description: "Check for complement in map during single pass.",
          algorithm: "1. Iterate nums\n2. Lookup complement in map\n3. Return indices",
        },
        summary: "Optimal single-pass hash map solution.",
        isCorrect: true,
        timeComplexity: {
          value: "O(n)",
          explanation: "Single pass through nums array.",
          reasoning: ["Loop runs n times", "Map lookup is O(1)"],
        },
        spaceComplexity: {
          value: "O(n)",
          explanation: "Hash table stores up to n elements.",
          reasoning: ["Dictionary allocations"],
        },
        strengths: ["Optimal time and space"],
        mistakes: [],
        conceptGaps: [],
        missedEdgeCases: [],
        improvementSuggestions: [],
        learningTakeaways: ["Hash map complement pattern"],
      },
      recommendation: {
        available: false,
        reason: "The submitted Hash Map approach is already optimal O(n).",
      },
    };

    const parsed = aiAnalysisOutputSchema.parse(output);
    expect(parsed.review.actualApproach.name).toBe("Hash Map");
    expect(parsed.review.actualApproach.name).not.toBe("Two Pointers");
    expect(parsed.recommendation.available).toBe(false);
  });

  // ── Test 2: Brute Force Two Sum ─────────────────────────────────────────────
  it("Test 2: Validates that Brute Force Two Sum is identified as Brute Force while recommendation is Hash Map", () => {
    const output: AiAnalysisOutput = {
      review: {
        actualApproach: {
          name: "Brute Force",
          coreIdea: "Check every pair of elements using nested loops.",
          explanation: "Nested loop over all i and j pairs.",
        },
        actualSolution: {
          name: "Pairwise Nested Comparison",
          description: "Two nested loops comparing every pair.",
          algorithm: "1. For i from 0 to n\n2. For j from i+1 to n\n3. If sum equals target return",
        },
        summary: "Correct but quadratic time complexity.",
        isCorrect: true,
        timeComplexity: {
          value: "O(n^2)",
          explanation: "Nested loops over array.",
          reasoning: ["Outer loop n steps", "Inner loop n-i steps"],
        },
        spaceComplexity: {
          value: "O(1)",
          explanation: "No extra memory allocated.",
          reasoning: ["Constant auxiliary pointers"],
        },
        strengths: ["Simple logic, O(1) space"],
        mistakes: ["Quadratic time complexity"],
        conceptGaps: ["Hash Table for complement search"],
        missedEdgeCases: [],
        improvementSuggestions: ["Use hash map to reduce time to O(n)"],
        learningTakeaways: ["Trade space for time with a hash map"],
      },
      recommendation: {
        available: true,
        reason: "Reduces time complexity from O(n^2) to O(n) using a hash map.",
        approach: {
          name: "Hash Map",
          coreIdea: "Store complements in dictionary.",
          whyItWorks: "O(1) average lookup.",
          whenToUse: "Pair finding.",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          pros: "Linear time",
          cons: "Linear space",
        },
        solution: {
          name: "One-Pass Complement Lookup",
          description: "Hash map lookup in one pass.",
          algorithm: "1. Check map for diff\n2. Store num in map",
        },
        code: {
          language: "python3",
          code: "def twoSum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        if target - x in seen: return [seen[target - x], i]\n        seen[x] = i",
        },
      },
    };

    const parsed = aiAnalysisOutputSchema.parse(output);
    expect(parsed.review.actualApproach.name).toBe("Brute Force");
    expect(parsed.recommendation.available).toBe(true);
    expect(parsed.recommendation.approach?.name).toBe("Hash Map");
    // Ensure the two names remain completely distinct
    expect(parsed.review.actualApproach.name).not.toBe(parsed.recommendation.approach?.name);
  });

  // ── Test 3: Longest Common Prefix Vertical Scanning ─────────────────────────
  it("Test 3: Validates that Vertical Scanning is preserved as actualApproach and not renamed to Horizontal Scanning", () => {
    const prompt = buildAnalysisPrompt({
      problem: {
        title: "Longest Common Prefix",
        slug: "longest-common-prefix",
        difficulty: "EASY",
        description: "Write a function to find the longest common prefix...",
        topics: ["String"],
      },
      submission: {
        id: "sub-lcp-vert",
        status: "ACCEPTED",
        language: "python3",
        code: `def longestCommonPrefix(strs):
    for i in range(len(strs[0])):
        for j in range(1, len(strs)):
            if i >= len(strs[j]) or strs[j][i] != strs[0][i]:
                return strs[0][:i]
    return strs[0]`,
        runtimeMs: 32,
        memoryBytes: 14000000,
        submittedAt: new Date(),
      },
    });

    // The prompt directives must explicitly mention Vertical Scanning vs Horizontal Scanning
    expect(prompt).toContain("Vertical Scanning");
    expect(prompt).toContain("NOT \"Horizontal Scanning\"");
  });

  // ── Test 4: Incorrect Submission ────────────────────────────────────────────
  it("Test 4: Validates that an incorrect submission retains the attempted approach and is not renamed to the fix", () => {
    const output: AiAnalysisOutput = {
      review: {
        actualApproach: {
          name: "Two Pointers",
          coreIdea: "Attempted two pointers from opposite ends on unsorted array.",
          explanation: "Moved left and right pointers based on sum without sorting first.",
        },
        actualSolution: {
          name: "Opposite-Ends Convergence",
          description: "Two-pointer convergence attempt.",
          algorithm: "1. left = 0, right = n-1\n2. while left < right\n3. check sum",
        },
        summary: "Incorrect approach because two pointers requires sorted array.",
        isCorrect: false,
        timeComplexity: {
          value: "O(n)",
          explanation: "Linear scan.",
          reasoning: ["Single while loop converging pointers"],
        },
        spaceComplexity: {
          value: "O(1)",
          explanation: "Constant space.",
          reasoning: ["Two integer pointers"],
        },
        strengths: ["Clean syntax"],
        mistakes: ["Applied two pointers without sorting"],
        conceptGaps: ["Monotonicity requirement for two-pointer search"],
        missedEdgeCases: ["[3, 2, 4], target = 6"],
        improvementSuggestions: ["Sort array first or use a Hash Map"],
        learningTakeaways: ["Two pointers requires monotonic / sorted data"],
      },
      recommendation: {
        available: true,
        reason: "Two Pointers requires sorting. Alternatively, a Hash Map solves it without sorting in O(n).",
        approach: {
          name: "Hash Map",
          coreIdea: "Use dictionary to find complements.",
          whyItWorks: "Does not require sorted array.",
          whenToUse: "Unsorted two sum problems.",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          pros: "Works on unsorted arrays",
          cons: "Requires auxiliary space",
        },
        solution: {
          name: "One-Pass Complement Lookup",
          description: "Hash map check",
          algorithm: "1. For each num: lookup diff in map",
        },
        code: {
          language: "python3",
          code: "def twoSum(nums, target):\n    d = {}\n    for i, n in enumerate(nums):\n        if target - n in d: return [d[target - n], i]\n        d[n] = i",
        },
      },
    };

    const parsed = aiAnalysisOutputSchema.parse(output);
    expect(parsed.review.isCorrect).toBe(false);
    expect(parsed.review.actualApproach.name).toBe("Two Pointers");
    expect(parsed.recommendation.approach?.name).toBe("Hash Map");
  });

  // ── Test 5: Optimal Submission With No Recommendation ───────────────────────
  it("Test 5: Validates that recommendation.available can be false without requiring approach/solution/code", () => {
    const output: AiAnalysisOutput = {
      review: {
        actualApproach: {
          name: "Binary Search",
          coreIdea: "Divide search space in half each iteration.",
          explanation: "Maintains low and high pointers, checking midpoint.",
        },
        actualSolution: {
          name: "Iterative Bisection",
          description: "Standard iterative binary search.",
          algorithm: "1. low = 0, high = n-1\n2. mid = (low + high) // 2\n3. adjust bounds",
        },
        summary: "Optimal O(log n) binary search implementation.",
        isCorrect: true,
        timeComplexity: {
          value: "O(log n)",
          explanation: "Search space halves each step.",
          reasoning: ["Loop halves interval until low > high"],
        },
        spaceComplexity: {
          value: "O(1)",
          explanation: "Constant auxiliary variables.",
          reasoning: ["low, high, mid integers"],
        },
        strengths: ["Optimal logarithmic time", "No extra space"],
        mistakes: [],
        conceptGaps: [],
        missedEdgeCases: [],
        improvementSuggestions: [],
        learningTakeaways: ["Binary search is optimal for sorted arrays"],
      },
      recommendation: {
        available: false,
        reason: "Binary Search is already optimal for this problem.",
      },
    };

    const parsed = aiAnalysisOutputSchema.parse(output);
    expect(parsed.recommendation.available).toBe(false);
    expect(parsed.recommendation.approach).toBeUndefined();
    expect(parsed.recommendation.code).toBeUndefined();
  });

  // ── Test 6: Save My Approach ────────────────────────────────────────────────
  it("Test 6: Validates that promoting user approach creates Approach with actual name and user code", async () => {
    const mockAnalysis = {
      id: "analysis-user-app",
      submissionId: "sub-1",
      status: "DRAFT_READY",
      submission: {
        id: "sub-1",
        problemId: "prob-1",
        userId: "user-1",
      },
    };

    submissionAnalysisFindUniqueMock.mockResolvedValue(mockAnalysis);
    submissionAnalysisUpdateManyMock.mockResolvedValue({ count: 1 });
    submissionAnalysisFindUniqueOrThrowMock.mockResolvedValue({
      ...mockAnalysis,
      status: "ACCEPTED",
    });

    const userDraft = {
      approach: {
        name: "Brute Force",
        coreIdea: "Pairwise iteration",
        whyItWorks: "Compares all combinations",
        whenToUse: "Small input constraints",
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(1)",
        pros: "Easy to implement",
        cons: "Slow on large inputs",
      },
      solution: {
        name: "Pairwise Scan",
        description: "Nested loop scan",
        algorithm: "1. Loop i\n2. Loop j\n3. Compare",
      },
      code: {
        language: "python3",
        code: "def solve(nums): pass # user code",
      },
    };

    approachCreateMock.mockResolvedValue({ id: "app-created-1", name: "Brute Force" });
    solutionCreateMock.mockResolvedValue({ id: "sol-created-1", name: "Pairwise Scan" });
    codeCreateMock.mockResolvedValue({ id: "code-created-1" });

    await promoteDraftToKnowledge("user-1", "sub-1", "analysis-user-app", userDraft);

    expect(approachCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        problemId: "prob-1",
        userId: "user-1",
        name: "Brute Force",
        timeComplexity: "O(n^2)",
      }),
    });

    expect(codeCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        code: "def solve(nums): pass # user code",
      }),
    });
  });

  // ── Test 7: Save AI Recommendation ──────────────────────────────────────────
  it("Test 7: Validates that promoting AI recommendation creates Approach with recommended name and AI code", async () => {
    const mockAnalysis = {
      id: "analysis-ai-rec",
      submissionId: "sub-1",
      status: "ACCEPTED", // Already accepted user approach earlier
      submission: {
        id: "sub-1",
        problemId: "prob-1",
        userId: "user-1",
      },
    };

    submissionAnalysisFindUniqueMock.mockResolvedValue(mockAnalysis);
    submissionAnalysisUpdateManyMock.mockResolvedValue({ count: 1 });
    submissionAnalysisFindUniqueOrThrowMock.mockResolvedValue(mockAnalysis);

    const aiRecommendationDraft = {
      approach: {
        name: "Hash Map",
        coreIdea: "Complement lookup in O(1)",
        whyItWorks: "Hash table maps seen values",
        whenToUse: "Finding pairs with target sum",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        pros: "Linear time",
        cons: "Linear space",
      },
      solution: {
        name: "One-Pass Complement Lookup",
        description: "Checks complement while iterating",
        algorithm: "1. For num in nums: check diff in map",
      },
      code: {
        language: "python3",
        code: "def solve(nums): # AI recommended code\n    seen = {}",
      },
    };

    approachCreateMock.mockResolvedValue({ id: "app-ai-1", name: "Hash Map" });
    solutionCreateMock.mockResolvedValue({ id: "sol-ai-1" });
    codeCreateMock.mockResolvedValue({ id: "code-ai-1" });

    await promoteDraftToKnowledge("user-1", "sub-1", "analysis-ai-rec", aiRecommendationDraft);

    expect(approachCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        problemId: "prob-1",
        userId: "user-1",
        name: "Hash Map",
        timeComplexity: "O(n)",
      }),
    });

    expect(codeCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        code: "def solve(nums): # AI recommended code\n    seen = {}",
      }),
    });
  });

  // ── Test 8: Coexistence Test ────────────────────────────────────────────────
  it("Test 8: Validates that user approach and AI recommendation can coexist under the same problem and user", async () => {
    const createdApproaches: string[] = [];
    approachCreateMock.mockImplementation(({ data }) => {
      createdApproaches.push(data.name);
      return { id: `app-${data.name}`, ...data };
    });

    const mockAnalysis = {
      id: "analysis-coexist",
      submissionId: "sub-1",
      status: "DRAFT_READY",
      submission: { id: "sub-1", problemId: "prob-two-sum", userId: "user-1" },
    };
    submissionAnalysisFindUniqueMock.mockResolvedValue(mockAnalysis);
    submissionAnalysisUpdateManyMock.mockResolvedValue({ count: 1 });
    submissionAnalysisFindUniqueOrThrowMock.mockResolvedValue(mockAnalysis);
    solutionCreateMock.mockResolvedValue({ id: "sol-1" });
    codeCreateMock.mockResolvedValue({ id: "code-1" });

    // 1. User saves Brute Force
    await promoteDraftToKnowledge("user-1", "sub-1", "analysis-coexist", {
      approach: {
        name: "Brute Force",
        coreIdea: "Nested loops",
        whyItWorks: "Exhaustive search",
        whenToUse: "Small n",
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(1)",
        pros: "Simple",
        cons: "Slow",
      },
      solution: { name: "Pairwise Scan", description: "Scan", algorithm: "Algorithm" },
      code: { language: "python3", code: "user_brute_force()" },
    });

    // 2. User saves Hash Map recommendation
    await promoteDraftToKnowledge("user-1", "sub-1", "analysis-coexist", {
      approach: {
        name: "Hash Map",
        coreIdea: "Complement lookup",
        whyItWorks: "O(1) dictionary",
        whenToUse: "Optimal pair search",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        pros: "Fast",
        cons: "Memory",
      },
      solution: { name: "One-Pass Lookup", description: "Lookup", algorithm: "Algorithm" },
      code: { language: "python3", code: "ai_hash_map()" },
    });

    expect(createdApproaches).toHaveLength(2);
    expect(createdApproaches).toContain("Brute Force");
    expect(createdApproaches).toContain("Hash Map");
  });

  // ── Test 9: Re-analysis Independence ────────────────────────────────────────
  it("Test 9: Validates that promotion never mutates the original analysis.draft", async () => {
    const originalDraft = {
      available: true,
      reason: "Optimal alternative",
      approach: { name: "Hash Map" },
    };

    const mockAnalysis = {
      id: "analysis-reanalysis",
      submissionId: "sub-1",
      status: "DRAFT_READY",
      draft: originalDraft,
      submission: { id: "sub-1", problemId: "prob-1", userId: "user-1" },
    };

    submissionAnalysisFindUniqueMock.mockResolvedValue(mockAnalysis);
    submissionAnalysisUpdateManyMock.mockResolvedValue({ count: 1 });
    submissionAnalysisFindUniqueOrThrowMock.mockResolvedValue(mockAnalysis);
    approachCreateMock.mockResolvedValue({ id: "app-1" });
    solutionCreateMock.mockResolvedValue({ id: "sol-1" });
    codeCreateMock.mockResolvedValue({ id: "code-1" });

    await promoteDraftToKnowledge("user-1", "sub-1", "analysis-reanalysis", {
      approach: {
        name: "Brute Force",
        coreIdea: "Idea",
        whyItWorks: "Works",
        whenToUse: "Use",
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(1)",
        pros: "Pros",
        cons: "Cons",
      },
      solution: { name: "Sol", description: "Desc", algorithm: "Algo" },
      code: { language: "python3", code: "user_code()" },
    });

    // Verifies that updateMany ONLY updated status to ACCEPTED, and did NOT overwrite draft!
    expect(submissionAnalysisUpdateManyMock).toHaveBeenCalledWith({
      where: {
        id: "analysis-reanalysis",
        status: { in: ["DRAFT_READY", "ACCEPTED"] },
      },
      data: {
        status: "ACCEPTED",
      },
    });
  });

  // ── Test 10: Historical Code Immutability ────────────────────────────────────
  it("Test 10: Validates that original Submission.code is not modified during promotion", async () => {
    const historicalSubmission = {
      id: "sub-immutable",
      problemId: "prob-1",
      userId: "user-1",
      code: "original_historical_submission_code()",
    };

    const mockAnalysis = {
      id: "analysis-immutable",
      submissionId: historicalSubmission.id,
      status: "DRAFT_READY",
      submission: historicalSubmission,
    };

    submissionAnalysisFindUniqueMock.mockResolvedValue(mockAnalysis);
    submissionAnalysisUpdateManyMock.mockResolvedValue({ count: 1 });
    submissionAnalysisFindUniqueOrThrowMock.mockResolvedValue(mockAnalysis);
    approachCreateMock.mockResolvedValue({ id: "app-1" });
    solutionCreateMock.mockResolvedValue({ id: "sol-1" });
    codeCreateMock.mockResolvedValue({ id: "code-1" });

    await promoteDraftToKnowledge("user-1", historicalSubmission.id, "analysis-immutable", {
      approach: {
        name: "Hash Map",
        coreIdea: "Idea",
        whyItWorks: "Works",
        whenToUse: "Use",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        pros: "Pros",
        cons: "Cons",
      },
      solution: { name: "Sol", description: "Desc", algorithm: "Algo" },
      code: { language: "python3", code: "canonical_code()" },
    });

    // Verify code created in Knowledge Vault has canonical code, but Submission.code is untouched
    expect(codeCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        code: "canonical_code()",
      }),
    });
    // Ensure historical submission code was never modified
    expect(historicalSubmission.code).toBe("original_historical_submission_code()");
  });
});
