import { describe, it, expect } from "vitest";
import { filterAndSortProblems, type ProblemFilterState } from "@/lib/profile/filterProblems";
import type { PublicVaultProblem } from "@/lib/profile/service";

const sampleProblems: PublicVaultProblem[] = [
  {
    slug: "two-sum",
    leetcodeId: 1,
    title: "Two Sum",
    difficulty: "EASY",
    topics: ["Array", "Hash Table"],
    approachCount: 2,
    latestApproachCreatedAt: "2026-03-01T12:00:00.000Z",
  },
  {
    slug: "3sum",
    leetcodeId: 15,
    title: "3Sum",
    difficulty: "MEDIUM",
    topics: ["Array", "Two Pointers"],
    approachCount: 1,
    latestApproachCreatedAt: "2026-03-05T12:00:00.000Z",
  },
  {
    slug: "trapping-rain-water",
    leetcodeId: 42,
    title: "Trapping Rain Water",
    difficulty: "HARD",
    topics: ["Array", "Two Pointers", "Stack"],
    approachCount: 3,
    latestApproachCreatedAt: "2026-03-10T12:00:00.000Z",
  },
  {
    slug: "same-tree",
    leetcodeId: 100,
    title: "Same Tree",
    difficulty: "EASY",
    topics: ["Tree", "Depth-First Search"],
    approachCount: 1,
    latestApproachCreatedAt: "2026-02-20T12:00:00.000Z",
  },
  {
    slug: "custom-problem",
    leetcodeId: null,
    title: "Custom Problem Without Number",
    difficulty: null,
    topics: [],
    approachCount: 1,
    latestApproachCreatedAt: "2026-01-15T12:00:00.000Z",
  },
];

const defaultFilters: ProblemFilterState = {
  search: "",
  difficulties: [],
  topics: [],
  sort: "recent",
};

describe("filterAndSortProblems", () => {
  describe("Text Search", () => {
    it("returns all problems when query is empty", () => {
      const result = filterAndSortProblems(sampleProblems, defaultFilters);
      expect(result).toHaveLength(5);
    });

    it("matches problem title case-insensitively", () => {
      const result = filterAndSortProblems(sampleProblems, {
        ...defaultFilters,
        search: "sum",
      });
      expect(result.map((p) => p.title)).toEqual(["3Sum", "Two Sum"]);
    });

    it("matches problem leetcodeId by number", () => {
      const result = filterAndSortProblems(sampleProblems, {
        ...defaultFilters,
        search: "42",
      });
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Trapping Rain Water");
    });

    it("matches problem number with leading '#' symbol", () => {
      const result = filterAndSortProblems(sampleProblems, {
        ...defaultFilters,
        search: "#15",
      });
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("3Sum");
    });

    it("returns empty array when search query matches nothing", () => {
      const result = filterAndSortProblems(sampleProblems, {
        ...defaultFilters,
        search: "nonexistent query xyz",
      });
      expect(result).toHaveLength(0);
    });
  });

  describe("Difficulty Filtering", () => {
    it("includes all problems including null difficulty when no difficulty filter is active", () => {
      const result = filterAndSortProblems(sampleProblems, {
        ...defaultFilters,
        difficulties: [],
      });
      expect(result.some((p) => p.difficulty === null)).toBe(true);
    });

    it("filters by a single difficulty", () => {
      const result = filterAndSortProblems(sampleProblems, {
        ...defaultFilters,
        difficulties: ["EASY"],
      });
      expect(result.map((p) => p.slug)).toEqual(["two-sum", "same-tree"]);
    });

    it("filters by multiple difficulties (union)", () => {
      const result = filterAndSortProblems(sampleProblems, {
        ...defaultFilters,
        difficulties: ["EASY", "HARD"],
      });
      expect(result.map((p) => p.slug)).toEqual(["trapping-rain-water", "two-sum", "same-tree"]);
    });

    it("excludes null difficulty problems when difficulty filter is active", () => {
      const result = filterAndSortProblems(sampleProblems, {
        ...defaultFilters,
        difficulties: ["EASY", "MEDIUM", "HARD"],
      });
      expect(result.some((p) => p.slug === "custom-problem")).toBe(false);
      expect(result).toHaveLength(4);
    });
  });

  describe("Topic Filtering", () => {
    it("returns all problems when no topic filter is active", () => {
      const result = filterAndSortProblems(sampleProblems, {
        ...defaultFilters,
        topics: [],
      });
      expect(result).toHaveLength(5);
    });

    it("filters by a single topic", () => {
      const result = filterAndSortProblems(sampleProblems, {
        ...defaultFilters,
        topics: ["Two Pointers"],
      });
      expect(result.map((p) => p.slug)).toEqual(["trapping-rain-water", "3sum"]);
    });

    it("filters by multiple topics (union match)", () => {
      const result = filterAndSortProblems(sampleProblems, {
        ...defaultFilters,
        topics: ["Tree", "Stack"],
      });
      expect(result.map((p) => p.slug)).toEqual(["trapping-rain-water", "same-tree"]);
    });

    it("matches problems with empty topics when 'Untagged' is selected", () => {
      const result = filterAndSortProblems(sampleProblems, {
        ...defaultFilters,
        topics: ["Untagged"],
      });
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("custom-problem");
    });

    it("matches untagged problems alongside other selected topics", () => {
      const result = filterAndSortProblems(sampleProblems, {
        ...defaultFilters,
        topics: ["Untagged", "Tree"],
      });
      expect(result.map((p) => p.slug)).toEqual(["same-tree", "custom-problem"]);
    });
  });

  describe("Combined Filtering", () => {
    it("applies search, difficulty, and topic simultaneously", () => {
      const result = filterAndSortProblems(sampleProblems, {
        search: "Sum",
        difficulties: ["EASY"],
        topics: ["Array"],
        sort: "recent",
      });
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Two Sum");
    });
  });

  describe("Sorting", () => {
    it("sorts by recent (latest approach createdAt desc)", () => {
      const result = filterAndSortProblems(sampleProblems, {
        ...defaultFilters,
        sort: "recent",
      });
      expect(result.map((p) => p.slug)).toEqual([
        "trapping-rain-water",
        "3sum",
        "two-sum",
        "same-tree",
        "custom-problem",
      ]);
    });

    it("sorts by number (leetcodeId asc, nulls last)", () => {
      const result = filterAndSortProblems(sampleProblems, {
        ...defaultFilters,
        sort: "number",
      });
      expect(result.map((p) => p.slug)).toEqual([
        "two-sum",
        "3sum",
        "trapping-rain-water",
        "same-tree",
        "custom-problem",
      ]);
    });

    it("sorts by difficulty (EASY -> MEDIUM -> HARD -> null)", () => {
      const result = filterAndSortProblems(sampleProblems, {
        ...defaultFilters,
        sort: "difficulty",
      });
      expect(result.map((p) => p.slug)).toEqual([
        "two-sum",
        "same-tree",
        "3sum",
        "trapping-rain-water",
        "custom-problem",
      ]);
    });
  });
});
