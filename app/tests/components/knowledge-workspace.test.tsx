import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { KnowledgeWorkspace } from "@/components/problems/knowledge/KnowledgeWorkspace";
import { ApproachOverview } from "@/components/problems/knowledge/ApproachOverview";
import { SolutionTechniqueView } from "@/components/problems/knowledge/SolutionTechniqueView";
import { KnowledgeCodeBlock } from "@/components/problems/knowledge/KnowledgeCodeBlock";
import type {
  KnowledgeApproach,
  KnowledgeSolution,
} from "@/components/problems/knowledge/types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe("KnowledgeWorkspace Components (Phase 5A)", () => {
  const mockApproach1: KnowledgeApproach = {
    id: "app-1",
    problemId: "prob-1",
    name: "Hash Map Strategy",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    coreIdea: "Trade auxiliary space for constant time lookups of complements.",
    whyItWorks: "For any element x, complement target - x is uniquely defined.",
    whenToUse: "When searching for pair sums in unsorted arrays.",
    pros: "Fast O(n) linear execution in a single pass.",
    cons: "Allocates O(n) memory proportional to the input array.",
    mistakes: "Inserting elements before checking complement can cause self-matching bugs.",
    notes: "Works for negative numbers and zero.",
    solutions: [
      {
        id: "sol-1",
        approachId: "app-1",
        name: "One-Pass Complement Lookup",
        description: "Iterates through array once while dynamically populating map.",
        algorithm: "1. Initialize empty map\n2. Loop through nums\n3. Check complement\n4. Return indices",
        notes: "Best practical performance.",
        codes: [
          {
            id: "code-ts",
            solutionId: "sol-1",
            language: "typescript",
            code: "function twoSum(nums: number[], target: number): number[] {\n  const map = new Map();\n  return [];\n}",
            notes: "Strict typing enabled.",
          },
          {
            id: "code-py",
            solutionId: "sol-1",
            language: "python3",
            code: "def twoSum(nums, target):\n    seen = {}\n    return []",
            notes: "Idiomatic Python dictionary.",
          },
        ],
      },
      {
        id: "sol-2",
        approachId: "app-1",
        name: "Two-Pass Pre-populated Map",
        description: "Pre-fills map before running second lookup loop.",
        algorithm: "1. Pre-fill map\n2. Loop to find target - nums[i]",
        notes: "Slower than one-pass due to two scans.",
        codes: [],
      },
    ],
  };

  const mockApproach2: KnowledgeApproach = {
    id: "app-2",
    problemId: "prob-1",
    name: "Two Pointers Strategy",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(1)",
    coreIdea: "Sort array and pinch pointers from both ends.",
    whyItWorks: "Monotonicity of sorted numbers ensures pointer steps are sound.",
    whenToUse: "When array can be sorted or indices are not required.",
    pros: "Zero auxiliary memory.",
    cons: "Modifies original order.",
    solutions: [],
  };

  describe("KnowledgeWorkspace", () => {
    it("renders empty state when no approaches exist", () => {
      const html = renderToStaticMarkup(
        <KnowledgeWorkspace problemId="prob-1" approaches={[]} />,
      );

      expect(html).toContain("No Knowledge Recorded Yet");
      expect(html).toContain("become your reusable problem-solving playbook");
      expect(html).toContain("+ Add Approach");
    });

    it("renders approach tabs and active approach when multiple approaches exist", () => {
      const html = renderToStaticMarkup(
        <KnowledgeWorkspace
          problemId="prob-1"
          approaches={[mockApproach1, mockApproach2]}
        />,
      );

      // Tab switcher shows both approach names
      expect(html).toContain("Hash Map Strategy");
      expect(html).toContain("Two Pointers Strategy");
      expect(html).toContain('role="tablist"');
      // Shows active approach complexity on the right
      expect(html).toContain("O(n)");

      // Active approach 1 content is rendered
      expect(html).toContain("Trade auxiliary space for constant time lookups of complements.");
      expect(html).toContain("One-Pass Complement Lookup");
    });

    it("renders plain header without approach tabs when only one approach exists", () => {
      const html = renderToStaticMarkup(
        <KnowledgeWorkspace
          problemId="prob-1"
          approaches={[mockApproach1]}
        />,
      );

      expect(html).toContain("Hash Map Strategy");
      expect(html).not.toContain('aria-label="Problem approaches"');
      expect(html).toContain("O(n)");
      expect(html).toContain("Trade auxiliary space for constant time lookups of complements.");
    });
  });

  describe("ApproachOverview", () => {
    it("renders full fields including pros, cons, mistakes, and notes", () => {
      const html = renderToStaticMarkup(
        <ApproachOverview approach={mockApproach1} />,
      );

      // Header & complexity
      expect(html).toContain("Hash Map Strategy");
      expect(html).toContain("O(n)");

      // Core idea prominently displayed
      expect(html).toContain("Core Idea");
      expect(html).toContain("Trade auxiliary space for constant time lookups of complements.");

      // Why it works & When to use
      expect(html).toContain("Why It Works");
      expect(html).toContain("For any element x, complement target - x is uniquely defined.");
      expect(html).toContain("When To Use");
      expect(html).toContain("When searching for pair sums in unsorted arrays.");

      // Pros & Cons
      expect(html).toContain("Pros &amp; Advantages");
      expect(html).toContain("Fast O(n) linear execution in a single pass.");
      expect(html).toContain("Cons &amp; Limitations");
      expect(html).toContain("Allocates O(n) memory proportional to the input array.");

      // Common pitfalls / mistakes
      expect(html).toContain("Common Mistakes to Avoid");
      expect(html).toContain("Inserting elements before checking complement can cause self-matching bugs.");

      // Additional notes
      expect(html).toContain("Additional Notes");
      expect(html).toContain("Works for negative numbers and zero.");
    });

    it("cleanly omits empty optional sections without creating blank boxes", () => {
      const minimalApproach: KnowledgeApproach = {
        id: "app-min",
        problemId: "prob-1",
        name: "Minimal Approach",
        coreIdea: "Simple intuition only.",
        solutions: [],
      };

      const html = renderToStaticMarkup(
        <ApproachOverview approach={minimalApproach} />,
      );

      expect(html).toContain("Minimal Approach");
      expect(html).toContain("Simple intuition only.");

      // Should not render unpopulated sections
      expect(html).not.toContain("Why It Works");
      expect(html).not.toContain("When To Use");
      expect(html).not.toContain("Pros &amp; Advantages");
      expect(html).not.toContain("Cons &amp; Limitations");
      expect(html).not.toContain("Common Mistakes to Avoid");
      expect(html).not.toContain("Additional Notes");
    });
  });

  describe("SolutionTechniqueView", () => {
    it("renders empty technique state when approach has no solutions", () => {
      const html = renderToStaticMarkup(
        <SolutionTechniqueView approach={mockApproach2} />,
      );

      expect(html).toContain("No Methods Recorded Yet");
      expect(html).toContain("does not have any concrete methods recorded yet");
      expect(html).toContain("+ Add Solution");
    });

    it("renders solution tabs when multiple solutions exist", () => {
      const html = renderToStaticMarkup(
        <SolutionTechniqueView approach={mockApproach1} />,
      );

      expect(html).toContain("Methods &amp; Algorithms");
      expect(html).toContain("One-Pass Complement Lookup");
      expect(html).toContain("Two-Pass Pre-populated Map");
      expect(html).toContain("Step-by-Step Guide");
      expect(html).toContain("1. Initialize empty map");
    });

    it("renders single solution cleanly without tab clutter", () => {
      const singleSolutionApproach: KnowledgeApproach = {
        ...mockApproach1,
        solutions: [mockApproach1.solutions[0]],
      };

      const html = renderToStaticMarkup(
        <SolutionTechniqueView approach={singleSolutionApproach} />,
      );

      // Header shows technique name directly
      expect(html).toContain("— One-Pass Complement Lookup");
      expect(html).toContain("Step-by-Step Guide");
    });
  });

  describe("KnowledgeCodeBlock", () => {
    it("renders empty code state when solution has no implementations", () => {
      const emptySolution: KnowledgeSolution = {
        id: "sol-empty",
        approachId: "app-1",
        name: "Empty Solution",
        codes: [],
      };

      const html = renderToStaticMarkup(
        <KnowledgeCodeBlock solution={emptySolution} />,
      );

      expect(html).toContain("No Implementation Recorded");
      expect(html).toContain("Add an optimized implementation for this method");
      expect(html).toContain("+ Add Code");
    });

    it("renders language selector when multiple codes exist and displays canonical code", () => {
      const html = renderToStaticMarkup(
        <KnowledgeCodeBlock solution={mockApproach1.solutions[0]} />,
      );

      expect(html).toContain("Optimized Implementation");
      expect(html).toContain("Reusable Knowledge");

      // Language selector tabs
      expect(html).toContain("typescript");
      expect(html).toContain("python3");

      // Copy Code action
      expect(html).toContain("Copy Code");

      // Code text
      expect(html).toContain("function twoSum");

      // Code notes
      expect(html).toContain("Implementation Notes:");
      expect(html).toContain("Strict typing enabled.");
    });
  });
});
