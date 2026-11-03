export function getDifficultyBadge(difficulty: string | null) {
  switch (difficulty) {
    case "EASY":
      return <Badge variant="easy">EASY</Badge>;
    case "MEDIUM":
      return <Badge variant="medium">MEDIUM</Badge>;
    case "HARD":
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