import React from "react";
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

/**
 * Formats inline backticked code identifiers like `len(s)` into clean code chips.
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

export function ApproachOverview({ approach }: ApproachOverviewProps) {
  const hasTradeoffs = Boolean(approach.pros || approach.cons);
  const hasMechanics = Boolean(approach.whyItWorks || approach.whenToUse);

  return (
    <div className="space-y-5 rounded-xl border border-[#4a4a4a] bg-[#373737] p-5 sm:p-6 shadow-2xs text-white">
      {/* ── Approach Header & Complexity Chips ────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#4a4a4a] pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Selected Approach
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
            {approach.name}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {(approach.timeComplexity || approach.spaceComplexity) && (
            <>
              {approach.timeComplexity && (
                <div className="flex items-center gap-1.5 rounded-md border border-[#4a4a4a] bg-[#2a2a2a] px-2.5 py-1 text-white">
                  <Clock className="size-4 text-sky-400" />
                  <span className="text-zinc-300">Time:</span>
                  <span className="font-mono font-semibold text-white">
                    {approach.timeComplexity}
                  </span>
                </div>
              )}
              {approach.spaceComplexity && (
                <div className="flex items-center gap-1.5 rounded-md border border-[#4a4a4a] bg-[#2a2a2a] px-2.5 py-1 text-white">
                  <HardDrive className="size-4 text-purple-400" />
                  <span className="text-zinc-300">Space:</span>
                  <span className="font-mono font-semibold text-white">
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
        <div className="rounded-xl border border-[#4a4a4a] bg-[#2a2a2a] p-5 text-white shadow-2xs">
          <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-amber-400">
            <Lightbulb className="size-5.5 text-amber-400 shrink-0" />
            <span>Core Idea</span>
          </div>
          <p className="mt-2 text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
            {formatText(approach.coreIdea)}
          </p>
        </div>
      )}

      {/* ── Why It Works & When To Use ────────────────────────── */}
      {hasMechanics && (
        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          {approach.whyItWorks && (
            <div className="rounded-xl border border-[#4a4a4a] bg-[#2a2a2a] p-5 text-white shadow-2xs">
              <div className="flex items-center gap-2.5 text-base font-bold text-zinc-100 mb-2.5">
                <Compass className="size-5 text-sky-400 shrink-0" />
                <span>Why It Works</span>
              </div>
              <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                {formatText(approach.whyItWorks)}
              </p>
            </div>
          )}

          {approach.whenToUse && (
            <div className="rounded-xl border border-[#4a4a4a] bg-[#2a2a2a] p-5 text-white shadow-2xs">
              <div className="flex items-center gap-2.5 text-base font-bold text-zinc-100 mb-2.5">
                <Compass className="size-5 text-purple-400 shrink-0" />
                <span>When To Use</span>
              </div>
              <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                {formatText(approach.whenToUse)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Trade-offs (Pros & Cons) ──────────────────────────── */}
      {hasTradeoffs && (
        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          {approach.pros && (
            <div className="rounded-xl border border-emerald-500/30 bg-[#2a2a2a] p-5 text-white shadow-2xs">
              <div className="flex items-center gap-2.5 text-base font-bold text-emerald-400 mb-2.5">
                <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                <span>Pros & Advantages</span>
              </div>
              <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                {formatText(approach.pros)}
              </p>
            </div>
          )}

          {approach.cons && (
            <div className="rounded-xl border border-rose-500/30 bg-[#2a2a2a] p-5 text-white shadow-2xs">
              <div className="flex items-center gap-2.5 text-base font-bold text-rose-400 mb-2.5">
                <AlertTriangle className="size-5 text-rose-400 shrink-0" />
                <span>Cons & Limitations</span>
              </div>
              <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                {formatText(approach.cons)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Common Mistakes / Pitfalls ────────────────────────── */}
      {approach.mistakes && (
        <div className="rounded-xl border border-amber-500/30 bg-[#2a2a2a] p-5 text-white shadow-2xs">
          <div className="flex items-center gap-2.5 text-base font-bold text-amber-400 mb-2.5">
            <AlertTriangle className="size-5 text-amber-400 shrink-0" />
            <span>Common Mistakes to Avoid</span>
          </div>
          <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
            {formatText(approach.mistakes)}
          </p>
        </div>
      )}

      {/* ── Notes ─────────────────────────────────────────────── */}
      {approach.notes && (
        <div className="rounded-xl border border-[#4a4a4a] bg-[#2a2a2a] p-5 text-white shadow-2xs">
          <div className="flex items-center gap-2.5 text-base font-bold text-zinc-100 mb-2">
            <FileText className="size-5 text-blue-400 shrink-0" />
            <span>Additional Notes</span>
          </div>
          <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
            {formatText(approach.notes)}
          </p>
        </div>
      )}
    </div>
  );
}
