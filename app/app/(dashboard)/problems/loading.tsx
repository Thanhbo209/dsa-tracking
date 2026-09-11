import { Skeleton } from "@/components/ui/skeleton";
import {
  SkeletonCard,
  SkeletonText,
  SkeletonBadge,
} from "@/components/ui/skeletons";

/** Mirrors the ProblemsExplorer layout exactly:
 *  - Stats row: donut card (left) + heatmap card (right)
 *  - Topics solved bar
 *  - Filter toolbar
 *  - 4-column problem card grid (8 cards)
 *  - Pagination row
 */
export default function ProblemsLoading() {
  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      {/* Page heading */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-40 rounded" />
        <Skeleton className="h-4 w-80 rounded" />
      </div>

      {/* ── Stats row: donut (5 cols) + heatmap (7 cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Donut chart card */}
        <SkeletonCard className="lg:col-span-5 flex flex-col gap-4">
          <Skeleton className="h-5 w-44 rounded" />
          <div className="flex items-center justify-center gap-8">
            {/* Donut circle */}
            <div className="relative flex items-center justify-center">
              <Skeleton className="h-36 w-36 rounded-full" />
            </div>
            {/* Legend */}
            <div className="space-y-3 flex-1">
              {[80, 60, 50].map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className={`h-3.5 w-${w === 80 ? "20" : w === 60 ? "16" : "14"} rounded`} />
                </div>
              ))}
            </div>
          </div>
        </SkeletonCard>

        {/* Heatmap card */}
        <SkeletonCard className="lg:col-span-7 flex flex-col gap-4">
          <Skeleton className="h-5 w-52 rounded" />
          {/* Month labels row */}
          <div className="flex gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-3 flex-1 rounded" />
            ))}
          </div>
          {/* Heatmap grid rows */}
          {Array.from({ length: 7 }).map((_, row) => (
            <div key={row} className="flex gap-1">
              {Array.from({ length: 52 }).map((_, col) => (
                <Skeleton key={col} className="h-3 w-3 rounded-sm" />
              ))}
            </div>
          ))}
          {/* Less / More legend */}
          <div className="flex items-center gap-2 justify-end mt-1">
            <Skeleton className="h-3 w-8 rounded" />
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-3 w-3 rounded-sm" />
            ))}
            <Skeleton className="h-3 w-8 rounded" />
          </div>
        </SkeletonCard>
      </div>

      {/* ── Topics solved bar ── */}
      <SkeletonCard className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-40 rounded" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonBadge key={i} width={i % 3 === 0 ? "w-24" : i % 2 === 0 ? "w-20" : "w-16"} />
          ))}
        </div>
      </SkeletonCard>

      {/* ── Filter toolbar + top pagination ── */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-9 w-56 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
        {/* Top pagination */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded" />
          ))}
        </div>
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>

      {/* ── Problem card grid (4 columns × 2 rows = 8 cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} className="space-y-3">
            {/* Title row */}
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-5 w-3/4 rounded" />
              <SkeletonBadge width="w-14" />
            </div>
            {/* ID + status row */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-10 rounded" />
              <SkeletonBadge width="w-16" />
            </div>
            {/* Topics chips */}
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: 3 }).map((_, j) => (
                <SkeletonBadge key={j} width="w-14" />
              ))}
            </div>
            {/* Footer row */}
            <div className="flex items-center justify-between pt-1">
              <Skeleton className="h-3.5 w-20 rounded" />
              <Skeleton className="h-3.5 w-12 rounded" />
            </div>
          </SkeletonCard>
        ))}
      </div>

      {/* ── Bottom pagination ── */}
      <div className="flex items-center justify-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded" />
        ))}
      </div>
    </main>
  );
}
