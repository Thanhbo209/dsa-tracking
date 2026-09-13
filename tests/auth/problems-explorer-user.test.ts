import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import * as React from "react";
import {
  ProblemsExplorer,
  type ProblemExplorerItem,
} from "@/components/problems/ProblemsExplorer";

describe("Problem Explorer User Scoping Isolation", () => {
  // Scenario: Same global problem ("Two Sum"), but User A has solved it with 2 approaches,
  // while User B has not attempted it and has 0 approaches.
  const userAProblemItem: ProblemExplorerItem = {
    id: "prob-1",
    slug: "two-sum",
    leetcodeId: 1,
    title: "Two Sum",
    difficulty: "EASY",
    topics: ["Array", "Hash Table"],
    status: "SOLVED",
    approachCount: 2,
    updatedAt: "2026-03-01T10:00:00Z",
  };

  const userBProblemItem: ProblemExplorerItem = {
    id: "prob-1",
    slug: "two-sum",
    leetcodeId: 1,
    title: "Two Sum",
    difficulty: "EASY",
    topics: ["Array", "Hash Table"],
    status: "TODO",
    approachCount: 0,
    updatedAt: "2026-03-01T10:00:00Z",
  };

  it("renders User A's view with SOLVED status and 2 knowledge approaches", () => {
    const htmlA = renderToStaticMarkup(
      React.createElement(ProblemsExplorer, { problems: [userAProblemItem] }),
    );

    expect(htmlA).toContain("Two Sum");
    expect(htmlA).toContain('title="Solved on LeetCode"');
    expect(htmlA).toContain("2 approaches");
    expect(htmlA).not.toContain('title="Todo"');
  });

  it("renders User B's view with TODO status and 0 knowledge approaches", () => {
    const htmlB = renderToStaticMarkup(
      React.createElement(ProblemsExplorer, { problems: [userBProblemItem] }),
    );

    expect(htmlB).toContain("Two Sum");
    expect(htmlB).toContain('title="Todo"');
    expect(htmlB).not.toContain("approaches saved in Knowledge Vault");
    expect(htmlB).not.toContain("No vault notes yet");
    expect(htmlB).not.toContain('title="Solved"');
  });
});
