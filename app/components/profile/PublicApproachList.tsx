"use client";

import React from "react";
import {
  Lightbulb,
  Clock,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Compass,
  ListOrdered,
  Code2,
} from "lucide-react";
import { CodeViewer } from "@/components/problems/CodeViewer";
import type { PublicProblemDetail } from "@/lib/profile/service";

type Approach = PublicProblemDetail["approaches"][number];
type Solution = Approach["solutions"][number];

// ── Status suffix helpers ──────────────────────────────────────────────────

function stripStatusSuffix(name: string): string {
  return name.replace(/(\s*\((?:My Accepted Implementation|My Attempt)\))+$/g, "").trim();
}

function getStatusBadge(name: string): string | null {
  const match = name.match(/\((My Accepted Implementation|My Attempt)\)\s*$/);
  return match ? match[1] : null;
}

/** Extract a plain language slug from storage strings like
 *  "Actual accepted submission code (python, 4ms)." → "python" */
function extractLanguage(langField: string): string {
  if (!/[( ]/.test(langField)) return langField.toLowerCase();
  const m = langField.match(/\(([a-zA-Z0-9_+#]+)/);
  return m ? m[1].toLowerCase() : langField.toLowerCase();
}

/**
 * Formats inline backtick identifiers like `len(s)` into styled code chips —
 * matches the styling used in ApproachOverview and SolutionTechniqueView.
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

// ── Sub-components ────────────────────────────────────────────────────────────

function SolutionBlock({ solution }: { solution: Solution }) {
  const codes = solution.codes ?? [];

  return (
    <div className="space-y-5">
      {/* Solution name */}
      <div className="flex items-center gap-2">
        <span className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
          <ListOrdered className="size-5 text-sky-400 shrink-0" />
          {solution.name}
        </span>
      </div>

      {/* Description */}
      {solution.description && (
        <p className="text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
          {formatText(solution.description)}
        </p>
      )}

      {/* Algorithm steps — plain readable text, NOT font-mono */}
      {solution.algorithm && (
        <div className="rounded-xl border border-[#4a4a4a] bg-[#2a2a2a] p-5 text-white shadow-2xs">
          <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-zinc-100 mb-2.5">
            <ListOrdered className="size-5 text-amber-400 shrink-0" />
            <span>Step-by-Step Guide</span>
          </div>
          <div className="rounded-lg bg-[#222222] border border-[#4a4a4a] p-4 text-zinc-300">
            <p className="whitespace-pre-wrap text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {formatText(solution.algorithm)}
            </p>
          </div>
        </div>
      )}

      {/* Solution notes */}
      {solution.notes && (
        <div className="rounded-xl border border-[#4a4a4a] bg-[#2a2a2a] p-5 text-zinc-300 shadow-2xs">
          <div className="flex items-center gap-2.5 text-base font-bold text-zinc-100 mb-2">
            <FileText className="size-5 text-blue-400 shrink-0" />
            <span>Method Notes</span>
          </div>
          <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
            {formatText(solution.notes)}
          </p>
        </div>
      )}

      {/* Code blocks — using the same CodeViewer as the internal workspace */}
      {codes.length > 0 && (
        <div className="border-t border-[#4a4a4a] pt-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Code2 className="size-5 text-emerald-400 shrink-0" />
              <span>Implementation</span>
            </span>
            {/* Language chip(s) */}
            {codes.map((c) => (
              <span
                key={c.id}
                className="rounded bg-[#2a2a2a] border border-[#4a4a4a] px-2 py-0.5 text-[10px] font-mono text-white uppercase"
              >
                {extractLanguage(c.language)}
              </span>
            ))}
          </div>

          {codes.map((codeItem) => (
            <div key={codeItem.id} className="space-y-2">
              <CodeViewer
                code={codeItem.code}
                language={extractLanguage(codeItem.language)}
                showLineNumbers={true}
              />
              {codeItem.notes && (
                <div className="rounded-md border border-[#4a4a4a] bg-[#2a2a2a] px-3 py-2 text-xs text-white shadow-2xs">
                  <span className="font-semibold text-white">
                    Implementation Notes:{" "}
                  </span>
                  <span className="text-zinc-300">{codeItem.notes}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ApproachSection({ approach }: { approach: Approach }) {
  const displayName = stripStatusSuffix(approach.name);
  const statusBadge = getStatusBadge(approach.name);
  const hasMechanics = Boolean(approach.whyItWorks || approach.whenToUse);
  const hasTradeoffs = Boolean(approach.pros || approach.cons);

  return (
    <div className="space-y-5 rounded-xl border border-[#4a4a4a] bg-[#373737] p-5 sm:p-6 shadow-2xs text-white">
      {/* ── Approach Header & Complexity Chips ─────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#4a4a4a] pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Approach
          </span>
          <div className="flex flex-wrap items-center gap-2 mt-0.5">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {displayName}
            </h3>
            {statusBadge && (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                {statusBadge}
              </span>
            )}
          </div>
        </div>

        {(approach.timeComplexity || approach.spaceComplexity) && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
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
          </div>
        )}
      </div>

      {/* ── Core Idea ──────────────────────────────────────────── */}
      {approach.coreIdea && (
        <div className="rounded-xl border border-[#4a4a4a] bg-[#2a2a2a] p-5 text-white shadow-2xs">
          <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-amber-400">
            <Lightbulb className="size-5 text-amber-400 shrink-0" />
            <span>Core Idea</span>
          </div>
          <p className="mt-2 text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
            {formatText(approach.coreIdea)}
          </p>
        </div>
      )}

      {/* ── Why It Works & When To Use ─────────────────────────── */}
      {hasMechanics && (
        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          {approach.whyItWorks && (
            <div className="rounded-xl border border-[#4a4a4a] bg-[#2a2a2a] p-5 text-white shadow-2xs">
              <div className="flex items-center gap-2.5 text-base font-bold text-zinc-100 mb-2.5">
                <Compass className="size-5 text-sky-400 shrink-0" />
                <span>Why It Works</span>
              </div>
              <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                {formatText(approach.whyItWorks!)}
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
                {formatText(approach.whenToUse!)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Trade-offs ─────────────────────────────────────────── */}
      {hasTradeoffs && (
        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          {approach.pros && (
            <div className="rounded-xl border border-emerald-500/30 bg-[#2a2a2a] p-5 text-white shadow-2xs">
              <div className="flex items-center gap-2.5 text-base font-bold text-emerald-400 mb-2.5">
                <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                <span>Pros &amp; Advantages</span>
              </div>
              <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                {formatText(approach.pros!)}
              </p>
            </div>
          )}
          {approach.cons && (
            <div className="rounded-xl border border-rose-500/30 bg-[#2a2a2a] p-5 text-white shadow-2xs">
              <div className="flex items-center gap-2.5 text-base font-bold text-rose-400 mb-2.5">
                <AlertTriangle className="size-5 text-rose-400 shrink-0" />
                <span>Cons &amp; Limitations</span>
              </div>
              <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                {formatText(approach.cons!)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Pitfalls ───────────────────────────────────────────── */}
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

      {/* ── Additional Notes ───────────────────────────────────── */}
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

      {/* ── Solutions (stacked, not tabbed) ────────────────────── */}
      {approach.solutions.length > 0 && (
        <div className="border-t border-[#4a4a4a] pt-5 space-y-8">
          {approach.solutions.map((solution, idx) => (
            <div key={solution.id}>
              {idx > 0 && <div className="border-t border-[#383838] mb-8" />}
              <SolutionBlock solution={solution} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────

interface PublicApproachListProps {
  approaches: Approach[];
}

export function PublicApproachList({ approaches }: PublicApproachListProps) {
  return (
    <div className="space-y-6 text-white">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-[#383838] pb-4">
        <h2 className="text-base sm:text-lg font-bold text-zinc-100">
          Approaches
          <span className="ml-2 text-sm font-normal text-zinc-400">
            ({approaches.length})
          </span>
        </h2>
      </div>

      {/* Stacked approach sections */}
      <div className="space-y-6">
        {approaches.map((approach) => (
          <ApproachSection key={approach.id} approach={approach} />
        ))}
      </div>
    </div>
  );
}
