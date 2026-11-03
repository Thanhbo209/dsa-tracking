import { Difficulty } from "@/lib/generated/prisma/enums";
import { Badge } from "./badge";

interface DifficultyBadgeProps {
  difficulty: Difficulty | null;
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  switch (difficulty) {
    case Difficulty.EASY:
      return <Badge variant="easy">EASY</Badge>;

    case Difficulty.MEDIUM:
      return <Badge variant="medium">MEDIUM</Badge>;

    case Difficulty.HARD:
      return <Badge variant="hard">HARD</Badge>;

    default:
      return (
        <Badge
          variant="outline"
          className="text-zinc-400 border-zinc-700 bg-zinc-800/60"
        >
          UNTIERED
        </Badge>
      );
  }
}
