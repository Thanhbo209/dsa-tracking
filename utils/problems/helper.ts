import { Difficulty } from "@/lib/generated/prisma/enums";

export function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

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

export function difficultyCardStripe(difficulty: Difficulty | null): string {
  switch (difficulty) {
    case "EASY":
      return "border-l-[3px] border-l-[#46C6C2]";
    case "MEDIUM":
      return "border-l-[3px] border-l-[#eab308]";
    case "HARD":
      return "border-l-[3px] border-l-[#ef4444]";
    default:
      return "border-l-[3px] border-l-zinc-700";
  }
}
