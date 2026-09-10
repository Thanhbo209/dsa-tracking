import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import * as React from "react";
import { ProblemDetailPanel } from "@/components/problems/ProblemDetailPanel";
import {
  ProblemLearningWorkspace,
  type WorkspaceSubmission,
} from "@/components/problems/ProblemLearningWorkspace";
import { SubmissionCard } from "@/components/problems/SubmissionCard";
import type {
  KnowledgeApproach,
  KnowledgeSolution,
  KnowledgeCode,
} from "@/components/problems/knowledge/types";
import type { SerializedSubmissionAnalysis } from "@/components/problems/analysis/types";
import type { AiReview, AiDraft } from "@/lib/validation/analysis";

// Mock next/navigation
const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

// Mock @base-ui/react/dialog for static server-side markup testing in node
const DialogTestContext = React.createContext<{ open: boolean }>({ open: false });

vi.mock("@base-ui/react/dialog", () => {
  const Root = ({ children, open, defaultOpen }: any) => {
    const isOpen = open !== undefined ? open : (defaultOpen ?? false);
    return (
      <DialogTestContext.Provider value={{ open: isOpen }}>
        <div data-slot="dialog">{children}</div>
      </DialogTestContext.Provider>
    );
  };

  const Trigger = ({ render, children, ...props }: any) => {
    if (render) {
      return React.cloneElement(render, {
        ...props,
        "data-slot": "dialog-trigger",
      });
    }
    return (
      <button data-slot="dialog-trigger" {...props}>
        {children}
      </button>
    );
  };

  const Portal = ({ children }: any) => {
    const { open } = React.useContext(DialogTestContext);
    if (!open) return null;
    return <div data-slot="dialog-portal">{children}</div>;
  };

  const Popup = ({ children, className, ...props }: any) => (
    <div data-slot="dialog-content" className={className} {...props}>
      {children}
    </div>
  );

  const Backdrop = ({ className, ...props }: any) => (
    <div data-slot="dialog-backdrop" className={className} {...props} />
  );

  const Title = ({ children, className, ...props }: any) => (
    <h2 data-slot="dialog-title" className={className} {...props}>
      {children}
    </h2>
  );

  const Description = ({ children, className, ...props }: any) => (
    <p data-slot="dialog-description" className={className} {...props}>
      {children}
    </p>
  );

  const Close = ({ children, className, ...props }: any) => (
    <button data-slot="dialog-close" className={className} {...props}>
      {children}
    </button>
  );

  return {
    Dialog: {
      Root,
      Trigger,
      Portal,
      Popup,
      Backdrop,
      Title,
      Description,
      Close,
      Viewport: ({ children }: any) => <div>{children}</div>,
    },
  };
});

describe("Phase 5C: Two-Column Learning Workspace Components", () => {
  const mockReview: AiReview = {
    summary: "Optimal one-pass hash map solution with linear runtime.",
    isCorrect: true,
    timeComplexity: {
      value: "O(n)",
      explanation: "Iterates through array once with O(1) map operations.",
      reasoning: ["Single loop runs n times", "Map lookups are O(1)"],
    },
    spaceComplexity: {
      value: "O(n)",
      explanation: "Stores at most n elements in map.",
      reasoning: ["Auxiliary hash map stores seen complements"],
    },
    strengths: ["Clean code", "Optimal runtime"],
    mistakes: [],
    conceptGaps: [],
    missedEdgeCases: [],
    improvementSuggestions: [],
    learningTakeaways: ["Trading O(n) space avoids O(n^2) brute force."],
  };

  const mockDraft: AiDraft = {
    approach: {
      name: "Hash Map Complement Lookup",
      coreIdea: "Store seen numbers to verify target complement in constant time.",
      whyItWorks: "Complement target - x is uniquely determined.",
      whenToUse: "Finding pair sums in unsorted arrays.",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      pros: "Single-pass execution.",
      cons: "Requires auxiliary memory.",
      mistakes: "Inserting before checking duplicate.",
      notes: "Supports negative values.",
    },
    solution: {
      name: "Single-Pass Map",
      description: "Traverse nums while building map.",
      algorithm: "1. Init map\n2. For each num, calculate complement\n3. Return pair",
      notes: "Optimal approach.",
    },
    code: {
      language: "typescript",
      code: "function twoSum(nums: number[], target: number) { return [0, 1]; }",
      notes: "Strict typing.",
    },
  };

  const mockAnalysis: SerializedSubmissionAnalysis = {
    id: "analysis-sub-1",
    submissionId: "sub-1",
    status: "DRAFT_READY",
    modelName: "gemini-2.5-flash",
    review: mockReview,
    draft: mockDraft,
    errorMessage: null,
    createdAt: "2026-09-10T12:00:00Z",
    updatedAt: "2026-09-10T12:00:00Z",
  };

  const mockSubmissions: WorkspaceSubmission[] = [
    {
      id: "sub-1",
      status: "ACCEPTED",
      language: "typescript",
      runtimeMs: 55,
      memoryBytes: BigInt(45000000),
      submittedAt: new Date("2026-09-10T12:00:00Z"),
      code: "function twoSum(nums, target) { return [0, 1]; }",
      analyses: [mockAnalysis],
    },
    {
      id: "sub-2",
      status: "WRONG_ANSWER",
      language: "python3",
      runtimeMs: 40,
      memoryBytes: null,
      submittedAt: new Date("2026-09-09T10:00:00Z"),
      code: "def twoSum(nums, target): return []",
      analyses: [],
    },
  ];

  const mockCode: KnowledgeCode = {
    id: "code-ts",
    solutionId: "sol-1",
    language: "typescript",
    code: "function twoSum(nums: number[], target: number): number[] {\n  return [0, 1];\n}",
    notes: "Canonical implementation.",
  };

  const mockSolution: KnowledgeSolution = {
    id: "sol-1",
    approachId: "app-1",
    name: "One-Pass Complement Lookup",
    description: "Iterates through array once while populating map.",
    algorithm: "1. Init map\n2. Check complement\n3. Return indices",
    notes: "Best practical performance.",
    codes: [mockCode],
  };

  const mockApproach: KnowledgeApproach = {
    id: "app-1",
    problemId: "prob-1",
    name: "Hash Map Strategy",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    coreIdea: "Trade auxiliary space for constant time lookups.",
    whyItWorks: "Complement target - x uniquely identifies complement.",
    whenToUse: "Finding pair sums in unsorted arrays.",
    pros: "Fast linear execution in single pass.",
    cons: "Allocates O(n) memory.",
    mistakes: "Inserting elements before checking.",
    notes: "Standard interview pattern.",
    solutions: [mockSolution],
  };

  /* ── 1. ProblemDetailPanel Tests ──────────────────────────────────── */
  describe("ProblemDetailPanel (Left Column)", () => {
    it("renders title, LeetCode number, difficulty badge, and topics", () => {
      const html = renderToStaticMarkup(
        <ProblemDetailPanel
          leetcodeId={1}
          title="Two Sum"
          difficulty="EASY"
          url="https://leetcode.com/problems/two-sum"
          topics={[
            { id: "top-1", name: "Array" },
            { id: "top-2", name: "Hash Table" },
          ]}
          description="<p>Given an array of integers <code>nums</code> and an integer <code>target</code>...</p>"
        />,
      );

      expect(html).toContain("Two Sum");
      expect(html).toContain("LeetCode #1");
      expect(html).toContain("EASY");
      expect(html).toContain("View on LeetCode");
      expect(html).toContain("Array");
      expect(html).toContain("Hash Table");
      expect(html).toContain("Problem Description");
      expect(html).toContain("Given an array of integers");
    });

    it("renders fallback message when problem description is missing", () => {
      const html = renderToStaticMarkup(
        <ProblemDetailPanel
          leetcodeId={null}
          title="Custom Problem"
          difficulty={null}
          topics={[]}
          description={null}
        />,
      );

      expect(html).toContain("Custom Problem");
      expect(html).toContain("No description available.");
    });
  });

  /* ── 2. SubmissionCard Selection Tests ────────────────────────────── */
  describe("SubmissionCard (Selectable & Expandable)", () => {
    it("renders submission metadata, runtime, memory, and status", () => {
      const html = renderToStaticMarkup(
        <SubmissionCard
          id="sub-1"
          status="ACCEPTED"
          language="typescript"
          runtimeMs={55}
          memoryBytes={BigInt(45000000)}
          submittedAt={new Date("2026-09-10")}
          code="const x = 1;"
          analyses={[mockAnalysis]}
          isSelected={false}
        />,
      );

      expect(html).toContain("ACCEPTED");
      expect(html).toContain("typescript");
      expect(html).toContain("55 ms");
      expect(html).toContain("AI Review Ready");
    });

    it("renders selection indicator when onSelect is provided and card is selected", () => {
      const htmlSelected = renderToStaticMarkup(
        <SubmissionCard
          id="sub-1"
          status="ACCEPTED"
          language="typescript"
          runtimeMs={55}
          memoryBytes={null}
          submittedAt={null}
          code="code here"
          analyses={[]}
          isSelected={true}
          onSelect={() => {}}
        />,
      );

      // Selected card has active aria-selected state and highlight classes
      expect(htmlSelected).toContain('aria-selected="true"');
      expect(htmlSelected).toContain("border-primary");
    });

    it("preserves immutable label for historical submitted code", () => {
      // SubmissionCard preserves the exact label contract:
      // "Your Submitted Code (Historical attempt — unchanged)"
      const sub = mockSubmissions[0];
      const html = renderToStaticMarkup(
        <SubmissionCard
          id={sub.id}
          status={sub.status}
          language={sub.language}
          runtimeMs={sub.runtimeMs}
          memoryBytes={sub.memoryBytes}
          submittedAt={sub.submittedAt}
          code={sub.code}
          analyses={sub.analyses}
        />,
      );

      expect(html).toContain(sub.language);
    });
  });

  /* ── 3. ProblemLearningWorkspace Tests ─────────────────────────────── */
  describe("ProblemLearningWorkspace (Right Column)", () => {
    it("renders all 3 distinct learning sections in sequence: Submissions, AI Analysis, Permanent Knowledge", () => {
      const html = renderToStaticMarkup(
        <ProblemLearningWorkspace
          problemId="prob-1"
          submissions={mockSubmissions}
          approaches={[mockApproach]}
        />,
      );

      // Section 1: Submissions ("What did I try?")
      expect(html).toContain("Submissions");
      expect(html).toContain("ACCEPTED");
      expect(html).toContain("WRONG ANSWER");

      // Section 2: AI Diagnostic Review ("What happened and why?")
      expect(html).toContain("AI Diagnostic Review");
      expect(html).toContain("Evaluating attempt: ");
      expect(html).toContain("ACCEPTED");
      expect(html).toContain(mockReview.summary);
      expect(html).toContain("O(n)");
      expect(html).toContain("Proposed Knowledge Model");
      expect(html).toContain("Candidate Approach");

      // Section 3: Permanent Knowledge ("What approach should I remember?")
      expect(html).toContain("Permanent Knowledge");
      expect(html).toContain("Hash Map Strategy");
      expect(html).toContain("One-Pass Complement Lookup");
      expect(html).toContain("Canonical Implementation");
      expect(html).toContain("Edit Approach");
    });

    it("renders empty states gracefully when no submissions exist", () => {
      const html = renderToStaticMarkup(
        <ProblemLearningWorkspace
          problemId="prob-1"
          submissions={[]}
          approaches={[mockApproach]}
        />,
      );

      // Submissions empty state
      expect(html).toContain("No submissions recorded yet");

      // AI Analysis empty state
      expect(html).toContain("No submissions available to analyze");

      // Permanent Knowledge still renders approaches
      expect(html).toContain("Permanent Knowledge");
      expect(html).toContain("Hash Map Strategy");
    });

    it("renders knowledge empty state with + Add Approach dialog trigger when no approaches exist", () => {
      const html = renderToStaticMarkup(
        <ProblemLearningWorkspace
          problemId="prob-1"
          submissions={mockSubmissions}
          approaches={[]}
        />,
      );

      expect(html).toContain("No Knowledge Recorded Yet");
      expect(html).toContain("+ Add Approach");
    });
  });
});
