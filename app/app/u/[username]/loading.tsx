import { Skeleton } from "@/components/ui/skeleton";
import {
  SkeletonCard,
  SkeletonText,
  SkeletonBadge,
  SkeletonCircle,
} from "@/components/ui/skeletons";

/** Mirrors the PublicProfilePage layout:
 *  - Sticky top nav bar
 *  - Profile header card: avatar + name/bio + 4-stat mini grid
 *  - "Public DSA Playbook" section with 3 approach cards
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
                <Skeleton className="h-3.5 w-64 rounded" />
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

        {/* ── Public DSA Playbook section ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-40 rounded" />
            </div>
            <Skeleton className="h-4 w-20 rounded" />
          </div>

          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <article
                key={i}
                className="rounded-2xl border border-[#383838] bg-[#262626] p-6 space-y-5"
              >
                {/* Problem header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#383838] pb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3.5 w-8 rounded" />
                      <Skeleton className="h-5 w-48 rounded" />
                      <SkeletonBadge width="w-14" />
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <SkeletonBadge key={j} width="w-16" />
                      ))}
                    </div>
                  </div>
                  <SkeletonBadge width="w-24" />
                </div>

                {/* Approach body grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div
                      key={j}
                      className="rounded-xl border border-[#333333] bg-[#1e1e1e] p-3.5 space-y-2"
                    >
                      <Skeleton className="h-3 w-20 rounded" />
                      <SkeletonText lines={2} />
                    </div>
                  ))}
                </div>

                {/* Code block placeholder */}
                <div className="rounded-xl border border-[#333333] bg-[#1d1d1d] p-4 space-y-2">
                  <Skeleton className="h-3.5 w-24 rounded" />
                  <Skeleton className="h-28 w-full rounded-lg" />
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
