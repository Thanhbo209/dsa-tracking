import { ExternalLink } from "lucide-react";

interface ProblemDetailPanelProps {
  leetcodeId: number | null;
  title: string;
  difficulty: string | null;
  url?: string | null;
  topics: Array<{ id: string; name: string }>;
  description: string | null;
}

function difficultyBadgeClass(difficulty: string | null): string {
  switch (difficulty?.toUpperCase()) {
    case "EASY":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    case "MEDIUM":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    case "HARD":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function ProblemDetailPanel({
  leetcodeId,
  title,
  difficulty,
  url,
  topics,
  description,
}: ProblemDetailPanelProps) {
  return (
    <aside className="space-y-6 rounded-xl border border-border/80 bg-zinc-100/60 dark:bg-zinc-900/60 p-5 sm:p-6 shadow-xs lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
      {/* ── Problem Header ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          {leetcodeId != null && (
            <span className="font-mono text-xs font-semibold text-muted-foreground">
              LeetCode #{leetcodeId}
            </span>
          )}

          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              title="Open problem on LeetCode"
            >
              <span>View on LeetCode</span>
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>

          {difficulty && (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${difficultyBadgeClass(
                difficulty,
              )}`}
            >
              {difficulty}
            </span>
          )}
        </div>

        {/* Topic tags */}
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {topics.map((topic) => (
              <span
                key={topic.id}
                className="rounded-md border bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {topic.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Problem Description
        </h2>

        <div
          className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed break-words [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-md [&_code]:text-xs [&_code]:font-mono"
          dangerouslySetInnerHTML={{
            __html: description ?? "<p>No description available.</p>",
          }}
        />
      </div>
    </aside>
  );
}
