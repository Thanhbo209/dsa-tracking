import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AiReviewSection } from "@/components/problems/analysis/AiReviewSection";
import { KnowledgeDraftSection } from "@/components/problems/analysis/KnowledgeDraftSection";
import { AnalysisEmptyState } from "@/components/problems/analysis/AnalysisEmptyState";
import { AnalysisGeneratingState } from "@/components/problems/analysis/AnalysisGeneratingState";
import { AnalysisFailedState } from "@/components/problems/analysis/AnalysisFailedState";
import { SubmissionAnalysisContainer } from "@/components/problems/analysis/SubmissionAnalysisContainer";
import { SubmissionCard } from "@/components/problems/SubmissionCard";
import type { AiReview, AiDraft } from "@/lib/validation/analysis";
import type { SerializedSubmissionAnalysis } from "@/components/problems/analysis/types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe("Submission Analysis UI Components", () => {
  const mockReview: AiReview = {
    summary: "High performance one-pass hash map solution.",
    isCorrect: true,
    timeComplexity: {
      value: "O(n)",
      explanation: "Single pass over the input array of size n.",
      reasoning: [
        "The single for-loop iterates up to n times.",
        "Map.has and Map.get operations take O(1) average time.",
        "Overall total time is strictly linear O(n).",
      ],
    },
    spaceComplexity: {
      value: "O(n)",
      explanation: "Auxiliary space scales with array length.",
      reasoning: [
        "A Map stores seen values and indices.",
        "In worst case, up to n-1 elements are stored.",
      ],
    },
    strengths: [
      "Optimal linear time complexity.",
      "Checks complement before insertion to avoid self-match.",
    ],
    mistakes: ["Uses non-null assertion operator."],
    conceptGaps: ["Could use explicit undefined checks instead of !."],
    missedEdgeCases: ["None; handles duplicates and negative numbers."],
    improvementSuggestions: [
      "Store map.get result in local variable to avoid redundant lookups.",
    ],
    learningTakeaways: [
      "Trading O(n) memory for hash table lookups eliminates quadratic search costs.",
    ],
  };

  const mockDraft: AiDraft = {
    approach: {
      name: "Hash Map Lookup",
      coreIdea: "Store visited numbers to find complement in O(1) time.",
      whyItWorks: "Complement target - x uniquely identifies matching element.",
      whenToUse: "Finding pairs or target sums in unsorted arrays.",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      pros: "Fast linear execution in a single pass.",
      cons: "Requires O(n) auxiliary memory.",
      mistakes: "Inserting before checking can reuse same index.",
      notes: "Works for all integer inputs.",
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

  describe("AnalysisEmptyState", () => {
    it("renders empty state information and the Analyze Submission button", () => {
      const html = renderToStaticMarkup(
        <AnalysisEmptyState onAnalyze={() => {}} isAnalyzing={false} />,
      );

      expect(html).toContain("No AI Analysis Yet");
      expect(html).toContain("Analyze this submission to evaluate your code");
      expect(html).toContain("Analyze Submission");
    });
  });

  describe("AnalysisGeneratingState", () => {
    it("renders generating state with descriptive message and loading indicator", () => {
      const html = renderToStaticMarkup(<AnalysisGeneratingState />);

      expect(html).toContain("Analyzing your submission...");
      expect(html).toContain(
        "The AI is reviewing your code, complexity, mistakes, and learning opportunities",
      );
    });
  });

  describe("AnalysisFailedState", () => {
    it("renders sanitized failure message and retry button", () => {
      const html = renderToStaticMarkup(
        <AnalysisFailedState
          errorMessage="Model request timed out"
          onRetry={() => {}}
          isRetrying={false}
        />,
      );

      expect(html).toContain("Analysis Failed");
      expect(html).toContain("Model request timed out");
      expect(html).toContain("Retry Analysis");
    });

    it("sanitizes messages containing sensitive keys or stack traces", () => {
      const html = renderToStaticMarkup(
        <AnalysisFailedState
          errorMessage="Error with key secret-12345 at file.ts:10"
          onRetry={() => {}}
          isRetrying={false}
        />,
      );

      expect(html).not.toContain("secret-12345");
      expect(html).toContain(
        "The AI analysis could not be completed. Please verify your connection or try again.",
      );
    });
  });

  describe("AiReviewSection", () => {
    it("renders full review with in-depth complexity reasoning", () => {
      const html = renderToStaticMarkup(<AiReviewSection review={mockReview} />);

      // Summary & correctness
      expect(html).toContain("AI Diagnostic Review");
      expect(html).toContain("Correct Logic");
      expect(html).toContain(mockReview.summary);

      // Complexity values and explanations
      expect(html).toContain("O(n)");
      expect(html).toContain(mockReview.timeComplexity.explanation);
      expect(html).toContain(mockReview.spaceComplexity.explanation);

      // In-depth complexity reasoning points
      expect(html).toContain("The single for-loop iterates up to n times.");
      expect(html).toContain("Map.has and Map.get operations take O(1) average time.");
      expect(html).toContain("A Map stores seen values and indices.");

      // Strengths, mistakes, edge cases, takeaways
      expect(html).toContain("Optimal linear time complexity.");
      expect(html).toContain("Uses non-null assertion operator.");
      expect(html).toContain("None; handles duplicates and negative numbers.");
      expect(html).toContain("Trading O(n) memory for hash table lookups eliminates quadratic search costs.");
    });
  });

  describe("KnowledgeDraftSection", () => {
    it("renders candidate knowledge draft clearly labeled as not saved", () => {
      const html = renderToStaticMarkup(
        <KnowledgeDraftSection draft={mockDraft} />,
      );

      // Draft disclaimer banner
      expect(html).toContain("AI-generated draft — not saved to your knowledge base");

      // Approach details
      expect(html).toContain("Candidate Approach");
      expect(html).toContain("Hash Map Lookup");
      expect(html).toContain("Store visited numbers to find complement in O(1) time.");
      expect(html).toContain("Fast linear execution in a single pass.");

      // Solution details
      expect(html).toContain("Candidate Solution");
      expect(html).toContain("One-Pass Complement Search");
      expect(html).toContain("1. Create Map");

      // Code details
      expect(html).toContain("Candidate Canonical Code");
      expect(html).toContain("Generated knowledge draft — not saved");
      expect(html).toContain("function twoSum(nums: number[], target: number)");
    });
  });

  describe("SubmissionCard", () => {
    it("renders historical submission code separately from any draft", () => {
      const html = renderToStaticMarkup(
        <SubmissionCard
          id="sub-1"
          status="ACCEPTED"
          language="typescript"
          runtimeMs={55}
          memoryBytes={BigInt(45000000)}
          submittedAt={new Date("2026-09-10")}
          code="const historicalAttempt = true;"
          analyses={[]}
        />,
      );

      // Header is rendered
      expect(html).toContain("ACCEPTED");
      expect(html).toContain("typescript");
      expect(html).toContain("55 ms");

      // When not expanded, code is collapsed
      expect(html).not.toContain("historicalAttempt");
    });

    it("displays analysis indicator badge on header when analysis exists", () => {
      const readyAnalysis: SerializedSubmissionAnalysis = {
        id: "analysis-ready-1",
        submissionId: "sub-1",
        status: "DRAFT_READY",
        modelName: "gemini-2.5-flash",
        review: mockReview,
        draft: mockDraft,
        errorMessage: null,
        createdAt: "2026-09-10T12:00:00Z",
        updatedAt: "2026-09-10T12:00:00Z",
      };

      const html = renderToStaticMarkup(
        <SubmissionCard
          id="sub-1"
          status="ACCEPTED"
          language="typescript"
          runtimeMs={55}
          memoryBytes={null}
          submittedAt={null}
          code="code here"
          analyses={[readyAnalysis]}
        />,
      );

      expect(html).toContain("AI Review Ready");
    });
  });

  describe("SubmissionAnalysisContainer", () => {
    it("renders empty state when no analysis exists without auto-triggering analysis", () => {
      const html = renderToStaticMarkup(
        <SubmissionAnalysisContainer submissionId="sub-empty" initialAnalyses={[]} />,
      );

      expect(html).toContain("No AI Analysis Yet");
      expect(html).toContain("Analyze Submission");
      // Does not render review or draft
      expect(html).not.toContain("AI Diagnostic Review");
    });

    it("renders DRAFT_READY analysis with review and draft when provided", () => {
      const analysis: SerializedSubmissionAnalysis = {
        id: "analysis-1",
        submissionId: "sub-1",
        status: "DRAFT_READY",
        modelName: "gemini-2.5-flash",
        review: mockReview,
        draft: mockDraft,
        errorMessage: null,
        createdAt: "2026-09-10T12:00:00Z",
        updatedAt: "2026-09-10T12:00:00Z",
      };

      const html = renderToStaticMarkup(
        <SubmissionAnalysisContainer
          submissionId="sub-1"
          initialAnalyses={[analysis]}
        />,
      );

      expect(html).toContain("Latest Analysis");
      expect(html).toContain("gemini-2.5-flash");
      expect(html).toContain("AI Diagnostic Review");
      expect(html).toContain("AI-generated draft — not saved to your knowledge base");
      expect(html).toContain("Re-analyze");
    });

    it("renders history selector when multiple analyses exist without overwriting", () => {
      const analysis1: SerializedSubmissionAnalysis = {
        id: "analysis-1",
        submissionId: "sub-multi",
        status: "DRAFT_READY",
        modelName: "gemini-2.5-flash",
        review: mockReview,
        draft: mockDraft,
        errorMessage: null,
        createdAt: "2026-09-10T14:00:00Z",
        updatedAt: "2026-09-10T14:00:00Z",
      };

      const analysis2: SerializedSubmissionAnalysis = {
        id: "analysis-2",
        submissionId: "sub-multi",
        status: "FAILED",
        modelName: "gemini-2.5-flash",
        review: null,
        draft: null,
        errorMessage: "Quota exceeded",
        createdAt: "2026-09-10T10:00:00Z",
        updatedAt: "2026-09-10T10:00:00Z",
      };

      const html = renderToStaticMarkup(
        <SubmissionAnalysisContainer
          submissionId="sub-multi"
          initialAnalyses={[analysis1, analysis2]}
        />,
      );

      expect(html).toContain("Select analysis history run");
      expect(html).toContain("Latest: ");
      expect(html).toContain("Run #1: ");
      expect(html).toContain("(Failed)");
    });
  });
});
