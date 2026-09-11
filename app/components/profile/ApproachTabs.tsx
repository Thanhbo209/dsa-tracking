"use client";

import { useState } from "react";
import { Code2 } from "lucide-react";
import type { PublicProblemDetail } from "@/lib/profile/service";

type Approach = PublicProblemDetail["approaches"][number];

interface ApproachTabsProps {
  approaches: Approach[];
}

export function ApproachTabs({ approaches }: ApproachTabsProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = approaches[activeIdx];

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
              {approach.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Active approach panel ── */}
      <div role="tabpanel" key={active.id} className="space-y-6">
        {/* Approach name (rendered ONCE — as the panel heading) */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-300">
            {active.name}
          </span>
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
                  {/* Solution header — rendered ONCE per solution */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white">
                      {solution.name}
                    </h4>
                    {solution.algorithm && (
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

                  {/* Code blocks */}
                  {solution.codes.map((codeItem) => (
                    <div
                      key={codeItem.id}
                      className="rounded-lg border border-[#383838] bg-[#141414] p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span className="font-mono font-medium text-primary">
                          {codeItem.language}
                        </span>
                        {codeItem.notes && (
                          <span className="text-[11px] text-zinc-500">
                            {codeItem.notes}
                          </span>
                        )}
                      </div>
                      <pre className="overflow-x-auto text-xs font-mono text-zinc-200 bg-[#111111] p-3 rounded border border-[#2b2b2b]">
                        <code>{codeItem.code}</code>
                      </pre>
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
      <p className="text-zinc-200 leading-relaxed">{body}</p>
    </div>
  );
}
