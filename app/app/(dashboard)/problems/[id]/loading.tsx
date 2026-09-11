import { Skeleton } from "@/components/ui/skeleton";
import {
  SkeletonCard,
  SkeletonText,
  SkeletonBadge,
} from "@/components/ui/skeletons";

/** Mirrors the problem detail two-column layout:
 *  - Left (5/12): title, badge row, topics, description block
 *  - Right (7/12): tabs (Submissions | Knowledge), content rows
 */
export default function ProblemDetailLoading() {
  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
        {/* ── LEFT: Problem Detail Panel ── */}
        <div className="lg:col-span-5">
          <SkeletonCard className="space-y-4 h-full">
            {/* Problem number + title */}
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-12 rounded" />
              <Skeleton className="h-7 w-4/5 rounded" />
            </div>

            {/* Difficulty badge + URL link */}
            <div className="flex items-center gap-2">
              <SkeletonBadge width="w-16" />
              <Skeleton className="h-4 w-28 rounded" />
            </div>

            {/* Topic chips */}
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBadge key={i} width={i % 2 === 0 ? "w-20" : "w-16"} />
              ))}
            </div>

            {/* Description body — this section may load slowly due to syncProblem backfill */}
            <div className="space-y-3 pt-2">
              <SkeletonText lines={6} />
              <Skeleton className="h-20 w-full rounded-lg" />
              <SkeletonText lines={4} />
            </div>
          </SkeletonCard>
        </div>

        {/* ── RIGHT: Learning Workspace ── */}
        <div className="lg:col-span-7 rounded-xl border border-[#383838] bg-[#262626] p-5 sm:p-6">
          {/* Tabs row */}
          <div className="flex items-center gap-2 border-b border-[#383838] pb-3 mb-4">
            {["Submissions", "Knowledge"].map((_, i) => (
              <Skeleton key={i} className="h-8 w-28 rounded-md" />
            ))}
          </div>

          {/* Submission cards */}
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-[#383838] bg-[#1e1e1e] p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SkeletonBadge width="w-16" />
                    <Skeleton className="h-3.5 w-20 rounded" />
                  </div>
                  <Skeleton className="h-3.5 w-24 rounded" />
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-3.5 w-20 rounded" />
                  <Skeleton className="h-3.5 w-24 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
