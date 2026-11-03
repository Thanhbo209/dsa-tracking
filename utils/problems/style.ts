import { Difficulty } from "@/lib/generated/prisma/enums";

export function difficultyClass(difficulty: Difficulty | null): string {
  switch (difficulty) {
    case "EASY":
      return "bg-[#46C6C2]/10 text-[#46C6C2] border-[#46C6C2]/30";
    case "MEDIUM":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
    case "HARD":
      return "bg-red-500/10 text-red-400 border-red-500/30";
    default:
      return "bg-zinc-800 text-zinc-400 border-zinc-700";
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
