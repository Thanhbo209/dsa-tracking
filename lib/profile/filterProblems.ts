import type { PublicVaultProblem } from "./service";

export type SortOption = "recent" | "number" | "difficulty";
export type ViewMode = "grid" | "list";

export interface ProblemFilterState {
  search: string;
  difficulties: string[];
  topics: string[];
  sort: SortOption;
}

const DIFFICULTY_WEIGHT: Record<string, number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
};

export function filterAndSortProblems(
  problems: PublicVaultProblem[],
  filters: ProblemFilterState,
): PublicVaultProblem[] {
  const rawQuery = filters.search.trim().toLowerCase();
  const normalizedQuery = rawQuery.startsWith("#")
    ? rawQuery.slice(1).trim()
    : rawQuery;

  return problems
    .filter((problem) => {
      // 1. Text Search: matches title or problem number
      if (rawQuery) {
        const titleMatch = problem.title.toLowerCase().includes(rawQuery);
        const numberMatch =
          problem.leetcodeId != null &&
          (problem.leetcodeId.toString() === normalizedQuery ||
            problem.leetcodeId.toString().includes(normalizedQuery));
        if (!titleMatch && !numberMatch) {
          return false;
        }
      }

      // 2. Difficulty Filter (multi-select)
      // If no difficulty filter is active: all problems (including null difficulty) pass.
      // If difficulty filter is active: must match one of the selected difficulties. Null-difficulty problems are excluded.
      if (filters.difficulties.length > 0) {
        if (!problem.difficulty || !filters.difficulties.includes(problem.difficulty)) {
          return false;
        }
      }

      // 3. Topic/Tag Filter (multi-select)
      // If no topic filter is active: all problems pass.
      // If topic filter is active:
      //   - If "Untagged" is selected and problem.topics is empty -> match!
      //   - If problem has any of the selected topics -> match!
      if (filters.topics.length > 0) {
        const wantsUntagged = filters.topics.includes("Untagged");
        const hasUntaggedMatch = wantsUntagged && problem.topics.length === 0;
        const hasTopicMatch = problem.topics.some((t) => filters.topics.includes(t));

        if (!hasUntaggedMatch && !hasTopicMatch) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case "number": {
          const numA = a.leetcodeId ?? Number.MAX_SAFE_INTEGER;
          const numB = b.leetcodeId ?? Number.MAX_SAFE_INTEGER;
          if (numA !== numB) return numA - numB;
          return a.title.localeCompare(b.title);
        }
        case "difficulty": {
          const diffA = a.difficulty ? (DIFFICULTY_WEIGHT[a.difficulty] ?? 4) : 5;
          const diffB = b.difficulty ? (DIFFICULTY_WEIGHT[b.difficulty] ?? 4) : 5;
          if (diffA !== diffB) return diffA - diffB;
          const numA = a.leetcodeId ?? Number.MAX_SAFE_INTEGER;
          const numB = b.leetcodeId ?? Number.MAX_SAFE_INTEGER;
          return numA - numB;
        }
        case "recent":
        default: {
          const timeA = a.latestApproachCreatedAt
            ? new Date(a.latestApproachCreatedAt).getTime()
            : 0;
          const timeB = b.latestApproachCreatedAt
            ? new Date(b.latestApproachCreatedAt).getTime()
            : 0;
          if (timeB !== timeA) return timeB - timeA;
          const numA = a.leetcodeId ?? Number.MAX_SAFE_INTEGER;
          const numB = b.leetcodeId ?? Number.MAX_SAFE_INTEGER;
          return numA - numB;
        }
      }
    });
}
