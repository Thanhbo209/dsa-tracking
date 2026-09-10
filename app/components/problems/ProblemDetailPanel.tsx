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
    <aside className="space-y-6 rounded-xl border border-[#383838] bg-[#262626] p-5 sm:p-6 shadow-xs lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto text-white">
      {/* ── Problem Header ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          {leetcodeId != null && (
            <span className="font-mono text-sm font-semibold text-white">
              LeetCode #{leetcodeId}
            </span>
          )}

          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white transition-colors underline underline-offset-2"
              title="Open problem on LeetCode"
            >
              <span>View on LeetCode</span>
              <ExternalLink className="size-3.5 text-zinc-300" />
            </a>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {title}
          </h1>

          {difficulty && (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs sm:text-sm font-semibold uppercase tracking-wider ${difficultyBadgeClass(
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
                className="rounded-md border border-[#4a4a4a] bg-[#373737] px-2.5 py-1 text-xs sm:text-sm font-medium text-white shadow-2xs"
              >
                {topic.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-[#383838] pt-4">
        <h2 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-white mb-3">
          Problem Description
        </h2>

        <div
          className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed break-words text-white [&_*]:text-white [&_pre]:bg-[#373737] [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:border [&_pre]:border-[#4a4a4a] [&_code]:text-white [&_code]:font-mono"
          dangerouslySetInnerHTML={{
            __html: description ?? "<p>No description available.</p>",
          }}
        />
      </div>
    </aside>
  );
}
