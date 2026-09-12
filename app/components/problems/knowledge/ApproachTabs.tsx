"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KnowledgeApproach } from "./types";
import { ApproachDialog } from "@/components/problems/dialogs/ApproachDialog";

interface ApproachTabsProps {
  problemId: string;
  approaches: KnowledgeApproach[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function ApproachTabs({
  problemId,
  approaches,
  selectedIndex,
  onSelect,
}: ApproachTabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  const tabListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeApproach =
    approaches[selectedIndex] || approaches[0] || null;

  // Measure and position the sliding underline indicator on mount, resize, or tab change
  useEffect(() => {
    function updateIndicator() {
      const currentTab = tabRefs.current[selectedIndex];
      if (currentTab && tabListRef.current) {
        setIndicatorStyle({
          left: currentTab.offsetLeft,
          width: currentTab.offsetWidth,
        });
      }
    }

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [selectedIndex, approaches]);

  if (!activeApproach) return null;

  const hasMultipleApproaches = approaches.length > 1;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#383838] pb-3">
      {/* ── Left Side: Google-style Underline Tabs OR Plain Header ── */}
      {hasMultipleApproaches ? (
        <div
          ref={tabListRef}
          role="tablist"
          aria-label="Problem approaches"
          className="relative flex items-center gap-6 sm:gap-8 text-sm sm:text-base font-sans select-none overflow-x-auto no-scrollbar"
        >
          {approaches.map((approach, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={approach.id || index}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                role="tab"
                type="button"
                aria-selected={isSelected}
                onClick={() => onSelect(index)}
                className={cn(
                  "relative pb-2.5 pt-1 text-sm sm:text-base font-medium transition-colors cursor-pointer whitespace-nowrap outline-none focus-visible:text-white",
                  isSelected
                    ? "text-white font-bold"
                    : "text-zinc-400 hover:text-zinc-200",
                )}
              >
                {approach.name}
              </button>
            );
          })}

          {/* Animated sliding underline indicator */}
          <span
            className="absolute bottom-0 h-[2.5px] bg-[#46C6C2] rounded-full transition-all duration-300 ease-out pointer-events-none"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.width > 0 ? 1 : 0,
            }}
          />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mr-1 hidden sm:inline">
            Approach:
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            {activeApproach.name}
          </h3>
        </div>
      )}

      {/* ── Right Side: Active Approach Complexity Badges & Actions ── */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {(activeApproach.timeComplexity || activeApproach.spaceComplexity) && (
          <>
            {activeApproach.timeComplexity && (
              <div className="flex items-center gap-1.5 rounded-md border border-[#4a4a4a] bg-[#2a2a2a] px-2.5 py-1 text-white">
                <Clock className="size-3.5 text-sky-400" />
                <span className="text-zinc-300">Time:</span>
                <span className="font-mono font-semibold text-white">
                  {activeApproach.timeComplexity}
                </span>
              </div>
            )}
            {activeApproach.spaceComplexity && (
              <div className="flex items-center gap-1.5 rounded-md border border-[#4a4a4a] bg-[#2a2a2a] px-2.5 py-1 text-white">
                <HardDrive className="size-3.5 text-purple-400" />
                <span className="text-zinc-300">Space:</span>
                <span className="font-mono font-semibold text-white">
                  {activeApproach.spaceComplexity}
                </span>
              </div>
            )}
          </>
        )}

        <div className="flex items-center gap-2">
          <ApproachDialog mode="edit" approach={activeApproach} />
          <ApproachDialog mode="create" problemId={problemId} />
        </div>
      </div>
    </div>
  );
}
