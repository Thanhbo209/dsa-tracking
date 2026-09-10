"use client";

import type { KnowledgeApproach } from "./types";
import { ApproachForm } from "@/components/problems/ApproachForm";

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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
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
                  ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                  : "border-border bg-card text-foreground hover:bg-muted/60"
              }`}
            >
              <span>{approach.name}</span>
              {hasComplexity && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                    isSelected
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
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
        <ApproachForm problemId={problemId} />
      </div>
    </div>
  );
}
