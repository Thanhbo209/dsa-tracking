"use client";

import React, { useState } from "react";
import type { KnowledgeApproach } from "./types";
import { KnowledgeCodeBlock } from "./KnowledgeCodeBlock";
import { SolutionDialog } from "@/components/problems/dialogs/SolutionDialog";
import { ListOrdered, Layers, FileText } from "lucide-react";

interface SolutionTechniqueViewProps {
  approach: KnowledgeApproach;
}

/**
 * Formats inline backticked code identifiers like `stack.pop()` into clean code chips.
 */
function formatText(text: string): React.ReactNode {
  if (!text || !text.includes("`")) return text;
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={idx}
          className="mx-0.5 rounded bg-[#262626] px-1.5 py-0.5 font-mono text-[13px] sm:text-sm text-zinc-200 border border-[#4a4a4a]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export function SolutionTechniqueView({ approach }: SolutionTechniqueViewProps) {
  const [selectedSolutionIndex, setSelectedSolutionIndex] = useState(0);

  const solutions = approach.solutions || [];
  const activeSolution = solutions[selectedSolutionIndex] || solutions[0];

  // Empty state when approach has no solutions
  if (solutions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#4a4a4a] p-8 text-center bg-[#373737] text-white shadow-2xs">
        <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-[#2a2a2a] text-white mb-3 border border-[#4a4a4a]">
          <Layers className="size-5 text-sky-400" />
        </div>
        <h4 className="text-base font-bold text-white">
          No Methods Recorded Yet
        </h4>
        <p className="mx-auto mt-1 max-w-md text-xs text-zinc-300 leading-relaxed">
          This approach does not have any concrete methods
          recorded yet. Add a method to document how this approach executes.
        </p>
        <div className="mt-4">
          <SolutionDialog mode="create" approach={approach} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-xl border border-[#4a4a4a] bg-[#373737] p-5 sm:p-6 shadow-2xs text-white">
      {/* ── Technique Selector Bar ────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#4a4a4a] pb-4">
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
            <ListOrdered className="size-5 text-sky-400 shrink-0" />
            <span>Methods & Algorithms</span>
          </span>

          {/* Solution tab selector if multiple exist */}
          {solutions.length > 1 && (
            <div
              role="tablist"
              aria-label="Techniques"
              className="flex flex-wrap items-center gap-1.5 ml-2"
            >
              {solutions.map((sol, idx) => (
                <button
                  key={sol.id || idx}
                  type="button"
                  role="tab"
                  aria-selected={idx === selectedSolutionIndex}
                  onClick={() => setSelectedSolutionIndex(idx)}
                  className={`rounded-md px-2.5 py-1 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    idx === selectedSolutionIndex
                      ? "bg-primary text-white font-semibold shadow-xs"
                      : "bg-[#2a2a2a] text-zinc-300 border border-[#4a4a4a] hover:bg-[#333333]"
                  }`}
                >
                  {sol.name}
                </button>
              ))}
            </div>
          )}

          {solutions.length === 1 && (
            <span className="text-sm font-semibold text-zinc-400 ml-1">
              — {activeSolution.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeSolution && (
            <SolutionDialog
              mode="edit"
              approach={approach}
              solution={activeSolution}
            />
          )}
          <SolutionDialog mode="create" approach={approach} />
        </div>
      </div>

      {/* ── Active Solution Content ───────────────────────────── */}
      {activeSolution && (
        <div className="space-y-5">
          {/* Solution Description */}
          {activeSolution.description && (
            <p className="text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
              {formatText(activeSolution.description)}
            </p>
          )}

          {/* Algorithm Steps (Easy to scan) */}
          {activeSolution.algorithm && (
            <div className="rounded-xl border border-[#4a4a4a] bg-[#2a2a2a] p-5 text-white shadow-2xs">
              <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-zinc-100 mb-2.5">
                <ListOrdered className="size-5 text-amber-400 shrink-0" />
                <span>Step-by-Step Guide</span>
              </div>
              <div className="rounded-lg bg-[#222222] border border-[#4a4a4a] p-4 text-zinc-300">
                <p className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {formatText(activeSolution.algorithm)}
                </p>
              </div>
            </div>
          )}

          {/* Solution Notes */}
          {activeSolution.notes && (
            <div className="rounded-xl border border-[#4a4a4a] bg-[#2a2a2a] p-5 text-zinc-300 shadow-2xs">
              <div className="flex items-center gap-2.5 text-base font-bold text-zinc-100 mb-2">
                <FileText className="size-5 text-blue-400 shrink-0" />
                <span>Method Notes</span>
              </div>
              <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                {formatText(activeSolution.notes)}
              </p>
            </div>
          )}

          {/* ── Canonical Code ──────────────────────────────────── */}
          <div className="border-t border-[#4a4a4a] pt-5">
            <KnowledgeCodeBlock solution={activeSolution} />
          </div>
        </div>
      )}
    </div>
  );
}
