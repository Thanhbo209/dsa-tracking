"use client";

import type { KnowledgeApproach } from "./types";
import { ApproachDialog } from "@/components/problems/dialogs/ApproachDialog";

interface ApproachSelectorProps {
  problemId: string;
  approaches: KnowledgeApproach[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function ApproachSelector({
  problemId,
  approaches,
  selectedIndex,
  onSelect,
}: ApproachSelectorProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#383838] pb-4">
      {/* Approach selector tabs */}
      <div
        role="tablist"
        aria-label="Problem approaches"
        className="flex flex-wrap items-center gap-2"
      >
        {approaches.map((approach, index) => {
          const isSelected = index === selectedIndex;
          const hasComplexity =
            approach.timeComplexity || approach.spaceComplexity;

          return (
            <button
              key={approach.id || index}
              role="tab"
              type="button"
              aria-selected={isSelected}
              onClick={() => onSelect(index)}
              className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-left transition-all text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isSelected
                  ? "border-primary bg-primary/20 text-white font-semibold shadow-xs"
                  : "border-[#4a4a4a] bg-[#373737] text-white hover:bg-[#454545]"
              }`}
            >
              <span>{approach.name}</span>
              {hasComplexity && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                    isSelected
                      ? "bg-primary/30 text-white font-semibold"
                      : "bg-[#2a2a2a] text-white border border-[#4a4a4a]"
                  }`}
                >
                  {approach.timeComplexity || "—"}
                  {approach.spaceComplexity ? ` · ${approach.spaceComplexity}` : ""}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add Approach Action */}
      <div className="shrink-0">
        <ApproachDialog mode="create" problemId={problemId} />
      </div>
    </div>
  );
}
