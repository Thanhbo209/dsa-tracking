import { Difficulty } from "@/lib/generated/prisma/enums";

export type ProblemStatus = "SOLVED" | "ATTEMPTED" | "TODO";

export type DifficultyFilter = "ALL" | Difficulty;
export type StatusFilter = "ALL" | ProblemStatus;
export type SortOption =
  | "NUM_ASC"
  | "NUM_DESC"
  | "TITLE_ASC"
  | "DIFF_EASY"
  | "DIFF_HARD"
  | "RECENT";

export interface ProblemExplorerItem {
  id: string;
  slug: string;
  leetcodeId: number | null;
  title: string;
  difficulty: Difficulty | null;
  topics: string[];
  status: ProblemStatus;
  approachCount: number;
  updatedAt: string;
}
