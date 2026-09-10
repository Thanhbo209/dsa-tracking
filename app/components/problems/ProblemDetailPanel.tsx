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
        <h2 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-white mb-4">
          Problem Description
        </h2>

        <div
          className="max-w-none text-sm sm:text-base leading-relaxed break-words text-white space-y-4
            [&_p]:my-4.5 [&_p]:leading-relaxed [&_p]:text-zinc-200
            [&_p:has(strong)]:mt-7 [&_p:has(strong)]:mb-3
            [&_p:has(.example)]:mt-7 [&_p:has(.example)]:mb-3
            [&_strong]:font-bold [&_strong]:text-white
            [&_pre]:mt-3 [&_pre]:mb-8 [&_pre]:p-4.5 sm:[&_pre]:p-5 [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-[#4a4a4a] [&_pre]:bg-[#333333] [&_pre]:font-mono [&_pre]:text-xs sm:[&_pre]:text-sm [&_pre]:leading-relaxed [&_pre]:overflow-x-auto [&_pre]:shadow-xs
            [&_code]:rounded-md [&_code]:bg-[#373737] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs sm:[&_code]:text-[13px] [&_code]:border [&_code]:border-[#4a4a4a] [&_code]:text-zinc-200
            [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:border-0 [&_pre_code]:text-zinc-100 [&_pre_code]:text-xs sm:[&_pre_code]:text-sm
            [&_ul]:my-4 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:space-y-2
            [&_ol]:my-4 [&_ol]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-2
            [&_li]:text-zinc-200 [&_li]:leading-relaxed
            [&_img]:my-4 [&_img]:rounded-lg [&_img]:border [&_img]:border-[#4a4a4a]"
          dangerouslySetInnerHTML={{
            __html: description ?? "<p>No description available.</p>",
          }}
        />
      </div>
    </aside>
  );
}
