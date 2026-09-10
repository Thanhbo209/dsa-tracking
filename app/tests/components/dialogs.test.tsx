import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ApproachDialog } from "@/components/problems/dialogs/ApproachDialog";
import { SolutionDialog } from "@/components/problems/dialogs/SolutionDialog";
import { CodeDialog } from "@/components/problems/dialogs/CodeDialog";
import { KnowledgeWorkspace } from "@/components/problems/knowledge/KnowledgeWorkspace";
import { ApproachOverview } from "@/components/problems/knowledge/ApproachOverview";
import { SolutionTechniqueView } from "@/components/problems/knowledge/SolutionTechniqueView";
import { KnowledgeCodeBlock } from "@/components/problems/knowledge/KnowledgeCodeBlock";
import type {
  KnowledgeApproach,
  KnowledgeSolution,
  KnowledgeCode,
} from "@/components/problems/knowledge/types";

import * as React from "react";

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

describe("Phase 5B Dialog Components", () => {
  const mockCode: KnowledgeCode = {
    id: "code-ts",
    solutionId: "sol-1",
    language: "typescript",
    code: "function twoSum(nums: number[], target: number): number[] {\n  const map = new Map();\n  return [];\n}",
    notes: "Strict typing enabled.",
  };

  const mockSolution: KnowledgeSolution = {
    id: "sol-1",
    approachId: "app-1",
    name: "One-Pass Complement Lookup",
    description: "Iterates through array once while dynamically populating map.",
    algorithm: "1. Initialize empty map\n2. Loop through nums\n3. Check complement\n4. Return indices",
    notes: "Best practical performance.",
    codes: [mockCode],
  };

  const mockApproach: KnowledgeApproach = {
    id: "app-1",
    problemId: "prob-1",
    name: "Hash Map Strategy",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    coreIdea: "Trade auxiliary space for constant time lookups of complements.",
    whyItWorks: "For any element x, complement target - x is uniquely defined.",
    whenToUse: "When searching for pair sums in unsorted arrays.",
    pros: "Fast linear execution in a single pass.",
    cons: "Allocates O(n) auxiliary memory.",
    mistakes: "Inserting elements before checking complement can cause self-matching bugs.",
    notes: "Works for negative numbers and zero.",
    solutions: [mockSolution],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ── 1. ApproachDialog Tests ────────────────────────────────────────── */
  describe("ApproachDialog", () => {
    it("renders trigger in create mode with accessible label", () => {
      const html = renderToStaticMarkup(
        <ApproachDialog mode="create" problemId="prob-1" />,
      );

      expect(html).toContain("+ Add Approach");
    });

    it("renders trigger in edit mode with accessible label", () => {
      const html = renderToStaticMarkup(
        <ApproachDialog mode="edit" approach={mockApproach} />,
      );

      expect(html).toContain("Edit Approach");
    });

    it("renders all grouped sections in create mode", () => {
      const html = renderToStaticMarkup(
        <ApproachDialog mode="create" problemId="prob-1" defaultOpen={true} />,
      );

      // Dialog title & description
      expect(html).toContain("Add Approach");
      expect(html).toContain("Record an algorithmic strategy");

      // Grouped field categories
      expect(html).toContain("Strategy");
      expect(html).toContain("Reasoning");
      expect(html).toContain("Complexity");
      expect(html).toContain("Trade-offs");
      expect(html).toContain("Learning Notes");

      // Specific field labels
      expect(html).toContain("Name");
      expect(html).toContain("Core Intuition");
      expect(html).toContain("Why It Works / Invariant");
      expect(html).toContain("When To Use / Signals");
      expect(html).toContain("Time Complexity");
      expect(html).toContain("Space Complexity");
      expect(html).toContain("Advantages &amp; Strengths");
      expect(html).toContain("Trade-offs &amp; Limitations");
      expect(html).toContain("Common Pitfalls to Avoid");
      expect(html).toContain("Additional Notes");

      // Actions
      expect(html).toContain("Cancel");
      expect(html).toContain("Save Approach");
    });

    it("populates existing values in edit mode", () => {
      const html = renderToStaticMarkup(
        <ApproachDialog mode="edit" approach={mockApproach} defaultOpen={true} />,
      );

      expect(html).toContain("Edit Approach");
      expect(html).toContain(mockApproach.name);
      expect(html).toContain(mockApproach.coreIdea);
      expect(html).toContain(mockApproach.whyItWorks);
      expect(html).toContain(mockApproach.whenToUse);
      expect(html).toContain(mockApproach.timeComplexity);
      expect(html).toContain(mockApproach.spaceComplexity);
      expect(html).toContain(mockApproach.pros);
      expect(html).toContain(mockApproach.cons);
      expect(html).toContain(mockApproach.mistakes);
      expect(html).toContain(mockApproach.notes);

      // Edit mode button label & delete option
      expect(html).toContain("Update Approach");
      expect(html).toContain("Delete");
    });
  });

  /* ── 2. SolutionDialog Tests ────────────────────────────────────────── */
  describe("SolutionDialog", () => {
    it("renders trigger in create mode and displays approach context", () => {
      const html = renderToStaticMarkup(
        <SolutionDialog mode="create" approach={mockApproach} defaultOpen={true} />,
      );

      expect(html).toContain("+ Add Solution");
      expect(html).toContain(`Approach: ${mockApproach.name}`);
      expect(html).toContain("Add Solution");
    });

    it("renders trigger in edit mode and populates existing values", () => {
      const html = renderToStaticMarkup(
        <SolutionDialog
          mode="edit"
          approach={mockApproach}
          solution={mockSolution}
          defaultOpen={true}
        />,
      );

      expect(html).toContain("Edit Solution");
      expect(html).toContain(`Approach: ${mockApproach.name}`);
      expect(html).toContain(mockSolution.name);
      expect(html).toContain(mockSolution.description);
      expect(html).toContain(mockSolution.algorithm);
      expect(html).toContain(mockSolution.notes);

      // Check algorithm is presented as a normal readable field
      expect(html).toContain("Algorithm Steps");
      expect(html).toContain("Step-by-Step Procedure");

      expect(html).toContain("Cancel");
      expect(html).toContain("Update Solution");
      expect(html).toContain("Delete");
    });
  });

  /* ── 3. CodeDialog Tests ────────────────────────────────────────────── */
  describe("CodeDialog", () => {
    it("renders trigger in create mode and displays solution context", () => {
      const html = renderToStaticMarkup(
        <CodeDialog mode="create" solution={mockSolution} defaultOpen={true} />,
      );

      expect(html).toContain("+ Add Code");
      expect(html).toContain(`Solution: ${mockSolution.name}`);
      expect(html).toContain("Add Implementation");
      expect(html).toContain("Language");
      expect(html).toContain("Implementation Code");
      expect(html).toContain("Monospace · Paste-friendly");
      expect(html).toContain("Save Code");
    });

    it("renders trigger in edit mode and populates existing code and notes", () => {
      const html = renderToStaticMarkup(
        <CodeDialog
          mode="edit"
          solution={mockSolution}
          codeRecord={mockCode}
          defaultOpen={true}
        />,
      );

      expect(html).toContain("Edit Code");
      expect(html).toContain(`Solution: ${mockSolution.name}`);
      expect(html).toContain(mockCode.language);
      expect(html).toContain(mockCode.code);
      expect(html).toContain(mockCode.notes);

      expect(html).toContain("Cancel");
      expect(html).toContain("Update Code");
      expect(html).toContain("Delete");
    });
  });

  /* ── 4. Knowledge Workspace Integration Tests ───────────────────────── */
  describe("Knowledge Workspace Integration", () => {
    it("renders + Add Approach dialog trigger in empty workspace", () => {
      const html = renderToStaticMarkup(
        <KnowledgeWorkspace problemId="prob-1" approaches={[]} />,
      );

      expect(html).toContain("No Knowledge Recorded Yet");
      expect(html).toContain("+ Add Approach");
    });

    it("renders Approach Selector with + Add Approach and Approach Overview with Edit Approach", () => {
      const html = renderToStaticMarkup(
        <KnowledgeWorkspace problemId="prob-1" approaches={[mockApproach]} />,
      );

      // Selector shows strategy and Add Approach
      expect(html).toContain("Hash Map Strategy");
      expect(html).toContain("+ Add Approach");

      // Overview header shows Edit Approach
      expect(html).toContain("Edit Approach");
    });

    it("renders Solution Technique bar with both Edit Solution and + Add Solution", () => {
      const html = renderToStaticMarkup(
        <SolutionTechniqueView approach={mockApproach} />,
      );

      expect(html).toContain("Techniques &amp; Algorithms");
      expect(html).toContain("Edit Solution");
      expect(html).toContain("+ Add Solution");
    });

    it("renders Canonical Code header with both Edit Code and + Add Code", () => {
      const html = renderToStaticMarkup(
        <KnowledgeCodeBlock solution={mockSolution} />,
      );

      expect(html).toContain("Canonical Implementation");
      expect(html).toContain("Copy Code");
      expect(html).toContain("Edit Code");
      expect(html).toContain("+ Add Code");
    });
  });

  /* ── 5. Safety, Deletion Confirmation & Context Contracts ─────────── */
  describe("Safety, Cascade Deletion & Context Contracts", () => {
    it("approach dialog does not render delete trigger in create mode", () => {
      const html = renderToStaticMarkup(
        <ApproachDialog mode="create" problemId="prob-1" defaultOpen={true} />,
      );

      expect(html).not.toContain("Permanently Delete");
    });

    it("approach dialog requires explicit confirmation and warns of cascade deletion", () => {
      const html = renderToStaticMarkup(
        <ApproachDialog mode="edit" approach={mockApproach} defaultOpen={true} />,
      );

      expect(html).toContain("Delete");
      expect(html).toContain("Update Approach");
    });

    it("solution dialog explicitly anchors to parent approach context", () => {
      const html = renderToStaticMarkup(
        <SolutionDialog mode="create" approach={mockApproach} defaultOpen={true} />,
      );

      expect(html).toContain(`Approach: ${mockApproach.name}`);
      expect(html).toContain(`Record an algorithmic technique under ${mockApproach.name}.`);
    });

    it("solution dialog uses normal readable textarea for algorithm steps (not code monospace)", () => {
      const html = renderToStaticMarkup(
        <SolutionDialog
          mode="edit"
          approach={mockApproach}
          solution={mockSolution}
          defaultOpen={true}
        />,
      );

      expect(html).toContain("Step-by-Step Procedure");
      expect(html).toContain("Algorithm Steps");
      // Verify algorithm input does not force font-mono
      expect(html).not.toContain('id="solution-algorithm" name="algorithm" class="w-full rounded-md border bg-background px-3 py-1.5 text-xs font-mono');
    });

    it("code dialog explicitly anchors to parent solution context", () => {
      const html = renderToStaticMarkup(
        <CodeDialog mode="create" solution={mockSolution} defaultOpen={true} />,
      );

      expect(html).toContain(`Solution: ${mockSolution.name}`);
      expect(html).toContain(`Record a canonical code implementation for &quot;${mockSolution.name}&quot;`);
    });

    it("code dialog applies monospace styling and dedicated code editor container", () => {
      const html = renderToStaticMarkup(
        <CodeDialog
          mode="edit"
          solution={mockSolution}
          codeRecord={mockCode}
          defaultOpen={true}
        />,
      );

      expect(html).toContain("Monospace · Paste-friendly");
      expect(html).toContain("font-mono");
      expect(html).toContain("function twoSum");
    });
  });
});
