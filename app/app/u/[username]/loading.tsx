import { Skeleton } from "@/components/ui/skeleton";
import {
  SkeletonCard,
  SkeletonText,
  SkeletonBadge,
  SkeletonCircle,
} from "@/components/ui/skeletons";

/** Mirrors the updated /u/[username] list layout:
 *  - Sticky nav bar
 *  - Profile header card (avatar + name + 4-stat mini grid)
 *  - Problem cards grid (3 columns, 6 cards)
 */
export default function PublicProfileLoading() {
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* ── Top nav bar ── */}
      <header className="border-b border-[#383838] bg-[#222222]/80 sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-24 rounded" />
          <Skeleton className="h-4 w-px rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
        <Skeleton className="h-4 w-36 rounded" />
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ── Profile header card ── */}
        <section className="rounded-2xl border border-[#383838] bg-[#262626] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
            {/* Avatar + name/bio */}
            <div className="flex items-center gap-4">
              <SkeletonCircle size={20} />
              <div className="space-y-2">
                <Skeleton className="h-7 w-40 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-3.5 w-56 rounded" />
                <Skeleton className="h-3 w-28 rounded" />
              </div>
            </div>

            {/* 4-stat mini grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto pt-4 sm:pt-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[#383838] bg-[#1e1e1e] p-3 text-center space-y-2"
                >
                  <Skeleton className="h-2.5 w-14 mx-auto rounded" />
                  <Skeleton className="h-6 w-8 mx-auto rounded" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Problem list section ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-40 rounded" />
            </div>
            <Skeleton className="h-4 w-20 rounded" />
          </div>

          {/* 3-column problem card grid — 6 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} className="space-y-3">
                {/* Title row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <Skeleton className="h-3 w-10 rounded" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                  </div>
                  <SkeletonBadge width="w-14" />
                </div>

                {/* Topic chips */}
                <div className="flex gap-1.5 flex-wrap">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <SkeletonBadge key={j} width="w-14" />
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-[#333333]">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-3 w-10 rounded" />
                </div>
              </SkeletonCard>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
