import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import * as React from "react";
import { PublicPlaybookExplorer } from "@/components/profile/PublicPlaybookExplorer";
import type { PublicVaultProblem } from "@/lib/profile/service";

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  usePathname: () => "/u/testuser",
  useSearchParams: () => new URLSearchParams(),
}));

const mockProblems: PublicVaultProblem[] = Array.from({ length: 50 }, (_, i) => ({
  slug: `problem-${i + 1}`,
  leetcodeId: i + 1,
  title: `Problem ${i + 1}`,
  difficulty: i % 3 === 0 ? "EASY" : i % 3 === 1 ? "MEDIUM" : "HARD",
  topics: i % 2 === 0 ? ["Array"] : ["Dynamic Programming"],
  approachCount: 1,
  latestApproachCreatedAt: new Date(Date.now() - i * 1000 * 60).toISOString(),
}));

describe("PublicPlaybookExplorer Component", () => {
  it("renders first page with up to 24 problems and displays correct counts", () => {
    const html = renderToStaticMarkup(
      <PublicPlaybookExplorer problems={mockProblems} username="testuser" />,
    );

    // Initial page shows 1–24 of 50 problems
    expect(html).toContain("Showing");
    expect(html).toContain("1–24");
    expect(html).toContain("50");
    expect(html).toContain("problems");

    // Renders Problem 1 through 24
    expect(html).toContain("Problem 1");
    expect(html).toContain("Problem 24");
    // Does NOT render Problem 25 on page 1
    expect(html).not.toContain(">Problem 25<");

    // Renders pagination navigation controls
    expect(html).toContain("aria-label=\"Pagination Navigation\"");
    expect(html).toContain("Previous");
    expect(html).toContain("Next");
  });

  it("renders empty state when no problems exist", () => {
    const html = renderToStaticMarkup(
      <PublicPlaybookExplorer problems={[]} username="testuser" />,
    );

    expect(html).toContain("No matching problems found");
    expect(html).toContain("No public knowledge published yet.");
  });
});
