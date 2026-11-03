"use client";

import React, { useState } from "react";
import { KnowledgeCodeBlock } from "./KnowledgeCodeBlock";
import { SolutionDialog } from "@/components/dialogs/SolutionDialog";
import { ListOrdered, Layers, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormatText } from "../ui/text";
import { KnowledgeApproach } from "@/types/knowledge";

interface SolutionTechniqueViewProps {
  approach: KnowledgeApproach;
}

export function SolutionTechniqueView({
  approach,
}: SolutionTechniqueViewProps) {
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
          This approach does not have any concrete methods recorded yet. Add a
          method to document how this approach executes.
        </p>
        <div className="mt-4">
          <SolutionDialog mode="create" approach={approach} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 border border-border bg-card p-5 sm:p-6 shadow-2xs text-white">
      {/* ── Technique Selector Bar ────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#4a4a4a] pb-4">
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
            <ListOrdered className="size-5 text-sky-400 shrink-0" />
            <span className="text-md">Methods & Algorithms</span>
          </span>

          {/* Solution tab selector if multiple exist */}
          {solutions.length > 1 && (
            <div
              role="tablist"
              aria-label="Techniques"
              className="flex flex-wrap items-center gap-1.5 ml-2"
            >
              {solutions.map((sol, idx) => (
                <Button
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
                </Button>
              ))}
            </div>
          )}

          {solutions.length === 1 && (
            <span className="text-md font-semibold text-muted-foreground ml-1">
              — {activeSolution.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {activeSolution && (
            <SolutionDialog
              mode="edit"
              approach={approach}
              solution={activeSolution}
            />
          )}
        </div>
      </div>

      {/* ── Active Solution Content ───────────────────────────── */}
      {activeSolution && (
        <div className="space-y-5">
          {/* Solution Description */}
          {activeSolution.description && (
            <p className="text-xl sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
              {FormatText(activeSolution.description)}
            </p>
          )}

          {/* Algorithm Steps (Easy to scan) */}
          {activeSolution.algorithm && (
            <div className=" border border-[#4a4a4a] bg-[#2a2a2a] p-5 text-white shadow-2xs">
              <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-zinc-100 mb-2.5">
                <ListOrdered className="size-5 text-amber-400 shrink-0" />
                <span>Step-by-Step Guide</span>
              </div>
              <div className=" bg-card border border-[#4a4a4a] p-4 text-zinc-300">
                <p className="whitespace-pre-wrap font-mono text-md sm:text-md text-zinc-300 leading-relaxed">
                  {FormatText(activeSolution.algorithm)}
                </p>
              </div>
            </div>
          )}

          {/* Solution Notes */}
          {activeSolution.notes && (
            <div className="border border-[#4a4a4a] bg-[#2a2a2a] p-5 text-zinc-300 shadow-2xs">
              <div className="flex items-center gap-2.5 text-base font-bold text-zinc-100 mb-2">
                <FileText className="size-5 text-blue-400 shrink-0" />
                <span>Method Notes</span>
              </div>
              <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                {FormatText(activeSolution.notes)}
              </p>
            </div>
          )}

          {/* ── Canonical Code ──────────────────────────────────── */}
          <div className="border-t border-border pt-5">
            <KnowledgeCodeBlock solution={activeSolution} />
          </div>
        </div>
      )}
    </div>
  );
}
