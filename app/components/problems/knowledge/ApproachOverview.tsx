import type { KnowledgeApproach } from "./types";
import { ApproachDialog } from "@/components/problems/dialogs/ApproachDialog";
import {
  Lightbulb,
  Clock,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Compass,
} from "lucide-react";

interface ApproachOverviewProps {
  approach: KnowledgeApproach;
}

export function ApproachOverview({ approach }: ApproachOverviewProps) {
  const hasTradeoffs = Boolean(approach.pros || approach.cons);
  const hasMechanics = Boolean(approach.whyItWorks || approach.whenToUse);

  return (
    <div className="space-y-5 rounded-xl border bg-card p-5 sm:p-6 shadow-2xs">
      {/* ── Approach Header & Complexity Chips ────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Selected Strategy
          </span>
          <h3 className="text-xl font-bold text-foreground mt-0.5">
            {approach.name}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {(approach.timeComplexity || approach.spaceComplexity) && (
            <>
              {approach.timeComplexity && (
                <div className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-2.5 py-1">
                  <Clock className="size-3.5 text-primary" />
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {approach.timeComplexity}
                  </span>
                </div>
              )}
              {approach.spaceComplexity && (
                <div className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-2.5 py-1">
                  <HardDrive className="size-3.5 text-primary" />
                  <span className="text-muted-foreground">Space:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {approach.spaceComplexity}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Edit Approach Dialog Trigger */}
          <ApproachDialog mode="edit" approach={approach} />
        </div>
      </div>

      {/* ── Core Idea (Visually Prominent) ────────────────────── */}
      {approach.coreIdea && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Lightbulb className="size-4 text-primary shrink-0" />
            <span>Core Intuition</span>
          </div>
          <p className="mt-1.5 text-sm text-foreground leading-relaxed">
            {approach.coreIdea}
          </p>
        </div>
      )}

      {/* ── Why It Works & When To Use ────────────────────────── */}
      {hasMechanics && (
        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          {approach.whyItWorks && (
            <div className="rounded-lg border bg-muted/20 p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1.5">
                <Compass className="size-3.5 text-primary" />
                <span>Why It Works / Invariant</span>
              </div>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {approach.whyItWorks}
              </p>
            </div>
          )}

          {approach.whenToUse && (
            <div className="rounded-lg border bg-muted/20 p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1.5">
                <Compass className="size-3.5 text-primary" />
                <span>When To Use / Signals</span>
              </div>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {approach.whenToUse}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Trade-offs (Pros & Cons) ──────────────────────────── */}
      {hasTradeoffs && (
        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          {approach.pros && (
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400 mb-1.5">
                <CheckCircle2 className="size-3.5 text-green-600" />
                <span>Advantages & Strengths</span>
              </div>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {approach.pros}
              </p>
            </div>
          )}

          {approach.cons && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-400 mb-1.5">
                <AlertTriangle className="size-3.5 text-red-600" />
                <span>Trade-offs & Limitations</span>
              </div>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {approach.cons}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Common Mistakes / Pitfalls ────────────────────────── */}
      {approach.mistakes && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-400 mb-1.5">
            <AlertTriangle className="size-3.5 text-amber-600" />
            <span>Common Pitfalls to Avoid</span>
          </div>
          <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
            {approach.mistakes}
          </p>
        </div>
      )}

      {/* ── Notes ─────────────────────────────────────────────── */}
      {approach.notes && (
        <div className="rounded-lg border bg-muted/10 p-3.5 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground mb-1">
            <FileText className="size-3.5 text-muted-foreground" />
            <span>Additional Notes</span>
          </div>
          <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
            {approach.notes}
          </p>
        </div>
      )}
    </div>
  );
}
