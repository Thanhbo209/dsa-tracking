"use client";

import { useState } from "react";
import type { KnowledgeApproach } from "./types";
import { KnowledgeCodeBlock } from "./KnowledgeCodeBlock";
import { SolutionForm } from "@/components/problems/SolutionForm";
import { ListOrdered, Layers, FileText } from "lucide-react";

interface SolutionTechniqueViewProps {
  approach: KnowledgeApproach;
}

export function SolutionTechniqueView({ approach }: SolutionTechniqueViewProps) {
  const [selectedSolutionIndex, setSelectedSolutionIndex] = useState(0);

  const solutions = approach.solutions || [];
  const activeSolution = solutions[selectedSolutionIndex] || solutions[0];

  // Empty state when approach has no solutions
  if (solutions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center bg-muted/10">
        <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
          <Layers className="size-5" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">
          No Techniques Recorded Yet
        </h4>
        <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground leading-relaxed">
          This approach does not have any concrete algorithmic variations
          recorded yet. Add a technique to document how this strategy executes.
        </p>
        <div className="mt-4">
          <SolutionForm approachId={approach.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-xl border bg-card p-5 sm:p-6 shadow-2xs">
      {/* ── Technique Selector Bar ────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <ListOrdered className="size-4 text-primary" />
            Techniques & Algorithms
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
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {sol.name}
                </button>
              ))}
            </div>
          )}

          {solutions.length === 1 && (
            <span className="text-xs font-semibold text-primary ml-1">
              — {activeSolution.name}
            </span>
          )}
        </div>

        <div className="shrink-0">
          <SolutionForm approachId={approach.id} />
        </div>
      </div>

      {/* ── Active Solution Content ───────────────────────────── */}
      {activeSolution && (
        <div className="space-y-5">
          {/* Solution Description */}
          {activeSolution.description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {activeSolution.description}
            </p>
          )}

          {/* Algorithm Steps (Easy to scan) */}
          {activeSolution.algorithm && (
            <div className="rounded-lg border bg-muted/20 p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
                <ListOrdered className="size-3.5 text-primary" />
                <span>Algorithm Steps</span>
              </div>
              <div className="rounded-md bg-background/80 border p-3">
                <p className="whitespace-pre-wrap font-mono text-xs text-muted-foreground leading-relaxed">
                  {activeSolution.algorithm}
                </p>
              </div>
            </div>
          )}

          {/* Solution Notes */}
          {activeSolution.notes && (
            <div className="rounded-md border bg-muted/10 p-3 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-foreground mb-0.5">
                <FileText className="size-3 text-muted-foreground" />
                <span>Technique Notes</span>
              </div>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {activeSolution.notes}
              </p>
            </div>
          )}

          {/* ── Canonical Code ──────────────────────────────────── */}
          <div className="border-t pt-5">
            <KnowledgeCodeBlock solution={activeSolution} />
          </div>
        </div>
      )}
    </div>
  );
}
