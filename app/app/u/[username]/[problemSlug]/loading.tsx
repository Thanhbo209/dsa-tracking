import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard, SkeletonText, SkeletonBadge } from "@/components/ui/skeletons";

/** Loading skeleton for /u/[username]/[problemSlug].
 *  Mirrors the two-column layout: left 5/12 (ProblemDetailPanel) + right 7/12 (PublicApproachList). */
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

      <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
          {/* LEFT — Problem detail panel skeleton */}
          <div className="lg:col-span-5">
            <div className="space-y-6 rounded-xl border border-[#383838] bg-[#262626] p-5 sm:p-6 shadow-xs">
              {/* ID + title + difficulty */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Skeleton className="h-8 w-56 rounded" />
                  <SkeletonBadge width="w-16" />
                </div>
                {/* Topic chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonBadge key={i} width={i % 2 === 0 ? "w-20" : "w-16"} />
                  ))}
                </div>
              </div>

              {/* Description section */}
              <div className="border-t border-[#383838] pt-4 space-y-3">
                <Skeleton className="h-4 w-40 rounded" />
                <SkeletonText lines={8} />
                <Skeleton className="h-16 w-full rounded-lg" />
                <SkeletonText lines={4} />
              </div>
            </div>
          </div>

          {/* RIGHT — Approaches panel skeleton */}
          <div className="lg:col-span-7 rounded-xl border border-[#383838] bg-[#262626] p-5 sm:p-6 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#383838] pb-4">
              <Skeleton className="h-5 w-36 rounded" />
            </div>

            {/* Approach card skeleton */}
            <SkeletonCard className="space-y-5">
              {/* Approach header */}
              <div className="flex items-center justify-between border-b border-[#4a4a4a] pb-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-7 w-48 rounded" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-24 rounded-md" />
                  <Skeleton className="h-7 w-24 rounded-md" />
                </div>
              </div>

              {/* Core idea */}
              <div className="rounded-xl border border-[#4a4a4a] bg-[#2a2a2a] p-5 space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <SkeletonText lines={3} />
              </div>

              {/* Why It Works / When To Use grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {[0, 1].map((i) => (
                  <div key={i} className="rounded-xl border border-[#4a4a4a] bg-[#2a2a2a] p-5 space-y-2">
                    <Skeleton className="h-4 w-28 rounded" />
                    <SkeletonText lines={3} />
                  </div>
                ))}
              </div>

              {/* Code block */}
              <div className="border-t border-[#4a4a4a] pt-5 space-y-3">
                <Skeleton className="h-5 w-36 rounded" />
                <Skeleton className="h-40 w-full rounded-lg" />
              </div>
            </SkeletonCard>
          </div>
        </div>
      </main>
    </div>
  );
}
