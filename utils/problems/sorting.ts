import { Difficulty } from "@/lib/generated/prisma/enums";

export function difficultyOrder(diff: Difficulty | null): number {
  switch (diff) {
    case "EASY":
      return 1;
    case "MEDIUM":
      return 2;
    case "HARD":
      return 3;
    default:
      return 4;
  }
}
