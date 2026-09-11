"use client";

import { useState } from "react";
import { Code2, ListOrdered } from "lucide-react";
import type { PublicProblemDetail } from "@/lib/profile/service";
import { CodeViewer } from "@/components/problems/CodeViewer";

type Approach = PublicProblemDetail["approaches"][number];

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Status suffixes that KnowledgeDraftSection may have embedded in approach.name
 *  before the promotion.ts fix landed. Strip them defensively so already-saved
 *  rows render correctly without a DB migration. */
const STATUS_SUFFIXES = [" (My Accepted Implementation)", " (My Attempt)"];

function stripStatusSuffix(name: string): string {
  for (const suffix of STATUS_SUFFIXES) {
    if (name.endsWith(suffix)) return name.slice(0, -suffix.length).trim();
  }
  return name;
}

function getStatusBadge(name: string): string | null {
  for (const suffix of STATUS_SUFFIXES) {
    if (name.endsWith(suffix)) return suffix.slice(2, -1); // strip " (" and ")"
  }
  return null;
}

/** Extract the base language slug from a human-readable language string.
 *  e.g. "Actual accepted submission code (python, 4ms)." → "python" */
function extractLanguage(langField: string): string {
  // If it's already a short slug (no spaces/parens), use as-is
  if (!/[( ]/.test(langField)) return langField.toLowerCase();
  // Pull the first word inside parentheses, e.g. "python" from "(python, 4ms)"
  const m = langField.match(/\(([a-zA-Z0-9_+#]+)/);
  return m ? m[1].toLowerCase() : langField.toLowerCase();
}

// ── Component ────────────────────────────────────────────────────────────────

interface ApproachTabsProps {
  approaches: Approach[];
}

export function ApproachTabs({ approaches }: ApproachTabsProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = approaches[activeIdx];

  // Separate display name from any embedded status label
  const displayName = stripStatusSuffix(active.name);
  const statusBadge = getStatusBadge(active.name);

  return (
    <div className="space-y-5">
      {/* ── Tab strip (only shown when there are multiple approaches) ── */}
      {approaches.length > 1 && (
        <div
          role="tablist"
          className="flex gap-2 flex-wrap border-b border-[#383838] pb-3"
        >
          {approaches.map((approach, idx) => (
            <button
              key={approach.id}
              role="tab"
              aria-selected={idx === activeIdx}
              onClick={() => setActiveIdx(idx)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                idx === activeIdx
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "text-zinc-400 hover:text-white border border-transparent hover:border-[#444444]"
              }`}
            >
              {/* Approach name appears ONCE per tab button — never repeated */}
              {stripStatusSuffix(approach.name)}
            </button>
          ))}
        </div>
      )}

      {/* ── Active approach panel ── */}
      <div role="tabpanel" key={active.id} className="space-y-6">

        {/* Approach name badge + optional status tag — rendered ONCE as panel heading */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-300">
            {displayName}
          </span>
          {statusBadge && (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
              {statusBadge}
            </span>
          )}
        </div>

        {/* Approach meta grid */}
        {(active.coreIdea || active.whyItWorks || active.whenToUse ||
          active.timeComplexity || active.spaceComplexity) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {active.coreIdea && (
              <InfoBlock label="Core Idea" body={active.coreIdea} />
            )}
            {active.whyItWorks && (
              <InfoBlock label="Why It Works" body={active.whyItWorks} />
            )}
            {active.whenToUse && (
              <InfoBlock label="When To Use" body={active.whenToUse} />
            )}
            {(active.timeComplexity || active.spaceComplexity) && (
              <div className="rounded-xl border border-[#333333] bg-[#1e1e1e] p-3.5 space-y-2">
                <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
                  Complexity
                </span>
                <div className="flex flex-wrap gap-3 font-mono text-zinc-300">
                  {active.timeComplexity && (
                    <span>
                      Time:{" "}
                      <strong className="text-emerald-400">
                        {active.timeComplexity}
                      </strong>
                    </span>
                  )}
                  {active.spaceComplexity && (
                    <span>
                      Space:{" "}
                      <strong className="text-blue-400">
                        {active.spaceComplexity}
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Solutions nested under the active approach */}
        {active.solutions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Code2 className="size-3.5" />
              Implementations &amp; Code
            </h3>

            <div className="space-y-4">
              {active.solutions.map((solution) => (
                <div
                  key={solution.id}
                  className="rounded-xl border border-[#333333] bg-[#1d1d1d] p-4 space-y-3"
                >
                  {/* Solution name — rendered ONCE per solution, never accumulates approach name */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white">
                      {solution.name}
                    </h4>
                    {solution.algorithm && !solution.algorithm.includes("\n") && (
                      <span className="shrink-0 text-[11px] text-zinc-400">
                        {solution.algorithm}
                      </span>
                    )}
                  </div>

                  {solution.description && (
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {solution.description}
                    </p>
                  )}

                  {/* Algorithm steps — rendered as plain readable text, NOT font-mono/code-styled */}
                  {solution.algorithm && solution.algorithm.includes("\n") && (
                    <div className="rounded-xl border border-[#333333] bg-[#1e1e1e] p-3.5 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                        <ListOrdered className="size-3.5" />
                        Step-by-Step
                      </div>
                      <p className="whitespace-pre-wrap text-xs text-zinc-300 leading-relaxed">
                        {solution.algorithm}
                      </p>
                    </div>
                  )}

                  {/* Code blocks — use CodeViewer for full syntax highlighting */}
                  {solution.codes.map((codeItem) => (
                    <div key={codeItem.id} className="space-y-1">
                      {codeItem.notes && (
                        <p className="text-[11px] text-zinc-500 px-0.5">
                          {codeItem.notes}
                        </p>
                      )}
                      <CodeViewer
                        code={codeItem.code}
                        language={extractLanguage(codeItem.language)}
                        showLineNumbers={true}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBlock({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-xl border border-[#333333] bg-[#1e1e1e] p-3.5 space-y-1">
      <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
        {label}
      </span>
      {/* Plain text — NOT wrapped in font-mono or <code> — identical to KnowledgeDraftSection body style */}
      <p className="text-zinc-200 leading-relaxed text-xs">{body}</p>
    </div>
  );
}
