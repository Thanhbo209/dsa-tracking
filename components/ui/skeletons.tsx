/**
 * Shared skeleton building blocks used across all route loading.tsx files.
 * All components use animate-pulse with bg-[#333333] to match the app's dark theme.
 */
import { Skeleton } from "@/components/ui/skeleton";

// ── Primitives ────────────────────────────────────────────────────────────────

/** Rounded card shell matching the app's standard card appearance */
export function SkeletonCard({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-[#383838] bg-[#262626] p-5 sm:p-6 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

/** N lines of pulsing text placeholders at varying widths */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  const widths = ["w-full", "w-5/6", "w-3/4", "w-4/5", "w-2/3", "w-11/12"];
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 ${widths[i % widths.length]}`}
        />
      ))}
    </div>
  );
}

/** Circle placeholder — for avatars, donut chart center, badges */
export function SkeletonCircle({ size = 12 }: { size?: number }) {
  return (
    <Skeleton
      style={{ width: size * 4, height: size * 4 }}
      className="rounded-full shrink-0"
    />
  );
}

/** Pill/chip shaped placeholder — for topic badges, difficulty badges, status pills */
export function SkeletonBadge({ width = "w-16" }: { width?: string }) {
  return <Skeleton className={`h-5 ${width} rounded-full`} />;
}
