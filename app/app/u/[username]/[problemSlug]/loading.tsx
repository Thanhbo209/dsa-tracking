import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard, SkeletonText, SkeletonBadge } from "@/components/ui/skeletons";

/** Mirrors the /u/[username]/[problemSlug] layout:
 *  - Sticky nav bar
 *  - Problem header card (number, title, difficulty badge, topic chips)
 *  - Approaches panel (tab strip + approach meta grid + solution/code blocks)
 */
export default function ProblemDetailLoading() {
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Nav bar */}
      <header className="border-b border-[#383838] bg-[#222222]/80 sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-24 rounded" />
          <Skeleton className="h-4 w-px rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
        <Skeleton className="h-4 w-36 rounded" />
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Problem header card */}
        <SkeletonCard className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-10 rounded" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-2/3 rounded" />
              <SkeletonBadge width="w-16" />
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBadge key={i} width={i % 2 === 0 ? "w-16" : "w-20"} />
            ))}
          </div>
        </SkeletonCard>

        {/* Approaches panel */}
        <SkeletonCard className="space-y-5">
          {/* Tab strip */}
          <div className="flex gap-2 pb-3 border-b border-[#383838]">
            <Skeleton className="h-7 w-28 rounded-md" />
            <Skeleton className="h-7 w-24 rounded-md" />
          </div>

          {/* Approach name badge */}
          <Skeleton className="h-7 w-36 rounded-md" />

          {/* Meta info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-[#333333] bg-[#1e1e1e] p-3.5 space-y-2"
              >
                <Skeleton className="h-3 w-20 rounded" />
                <SkeletonText lines={2} />
              </div>
            ))}
          </div>

          {/* Code block placeholder */}
          <div className="rounded-xl border border-[#333333] bg-[#1d1d1d] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3.5 w-20 rounded" />
            </div>
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </SkeletonCard>
      </main>
    </div>
  );
}
