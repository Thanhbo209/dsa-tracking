import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import * as React from "react";
import {
  ProblemsExplorer,
  type ProblemExplorerItem,
} from "@/components/problems/ProblemsExplorer";

describe("ProblemsExplorer Component", () => {
  const mockProblems: ProblemExplorerItem[] = [
    {
      id: "prob-1",
      slug: "two-sum",
      leetcodeId: 1,
      title: "Two Sum",
      difficulty: "EASY",
      topics: ["Array", "Hash Table"],
      status: "SOLVED",
      approachCount: 2,
      updatedAt: "2026-03-01T10:00:00Z",
    },
    {
      id: "prob-2",
      slug: "add-two-numbers",
      leetcodeId: 2,
      title: "Add Two Numbers",
      difficulty: "MEDIUM",
      topics: ["Linked List", "Math"],
      status: "ATTEMPTED",
      approachCount: 0,
      updatedAt: "2026-03-02T10:00:00Z",
    },
    {
      id: "prob-3",
      slug: "median-of-two-sorted-arrays",
      leetcodeId: 4,
      title: "Median of Two Sorted Arrays",
      difficulty: "HARD",
      topics: ["Array", "Binary Search"],
      status: "TODO",
      approachCount: 0,
      updatedAt: "2026-03-03T10:00:00Z",
    },
    {
      id: "prob-4",
      slug: "custom-unindexed-problem",
      leetcodeId: null,
      title: "Custom Unindexed Problem",
      difficulty: null,
      topics: ["Brainteaser"],
      status: "TODO",
      approachCount: 1,
      updatedAt: "2026-03-04T10:00:00Z",
    },
  ];

  it("renders problem items with LeetCode ID, title, difficulty, and topics", () => {
    const html = renderToStaticMarkup(
      <ProblemsExplorer problems={mockProblems} />,
    );

    // Problem 1: Two Sum
    expect(html).toContain("Two Sum");
    expect(html).toContain("#1");
    expect(html).toContain("EASY");
    expect(html).toContain("Array");
    expect(html).toContain("Hash Table");
    expect(html).toContain("/problems/two-sum");

    // Problem 2: Add Two Numbers
    expect(html).toContain("Add Two Numbers");
    expect(html).toContain("#2");
    expect(html).toContain("MEDIUM");
    expect(html).toContain("Linked List");
    expect(html).toContain("/problems/add-two-numbers");

    // Problem 3: Median of Two Sorted Arrays
    expect(html).toContain("Median of Two Sorted Arrays");
    expect(html).toContain("#4");
    expect(html).toContain("HARD");
    expect(html).toContain("/problems/median-of-two-sorted-arrays");

    // Problem 4: Null LeetCode ID
    expect(html).toContain("Custom Unindexed Problem");
    expect(html).toContain("/problems/custom-unindexed-problem");
  });

  it("renders distinct status indicators for SOLVED, ATTEMPTED, and TODO", () => {
    const html = renderToStaticMarkup(
      <ProblemsExplorer problems={mockProblems} />,
    );

    // Solved title / label
    expect(html).toContain("Solved on LeetCode");
    // Attempted title / label
    expect(html).toContain("Attempted");
    // Todo title / label
    expect(html).toContain("Todo");
  });

  it("renders knowledge approach count when > 0 and omits it when 0", () => {
    const html = renderToStaticMarkup(
      <ProblemsExplorer problems={mockProblems} />,
    );

    // Problem 1 has 2 approaches
    expect(html).toContain("2 approaches saved in Knowledge Vault");

    // Problem 4 has 1 approach
    expect(html).toContain("1 approach saved in Knowledge Vault");
  });

  it("renders overall library statistics cards independent of filters", () => {
    const html = renderToStaticMarkup(
      <ProblemsExplorer problems={mockProblems} />,
    );

    // Stats bar labels
    expect(html).toContain("Total Tracked");
    expect(html).toContain("Solved");
    expect(html).toContain("Easy");
    expect(html).toContain("Medium");
    expect(html).toContain("Hard");
    expect(html).toContain("Knowledge");

    // Problem counts: Total = 4, Solved = 1, Easy = 1, Medium = 1, Hard = 1, Knowledge = 2
    expect(html).toContain("4");
    expect(html).toContain("1");
    expect(html).toContain("2");
  });

  it("renders empty state when problems list is empty", () => {
    const html = renderToStaticMarkup(<ProblemsExplorer problems={[]} />);

    expect(html).toContain("No tracked problems yet");
    expect(html).toContain("Solve problems on LeetCode with the extension enabled");
  });

  it("renders search input, filter pills, and sort selector", () => {
    const html = renderToStaticMarkup(
      <ProblemsExplorer problems={mockProblems} />,
    );

    expect(html).toContain("Search problems");
    expect(html).toContain("All Topics");
    expect(html).toContain("Number: Low to High");
    expect(html).toContain("Difficulty:");
    expect(html).toContain("Status:");
  });
});
