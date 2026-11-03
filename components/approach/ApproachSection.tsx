import { FormatText } from "@/components/ui/text";
import { getStatusBadge, stripStatusSuffix } from "@/utils/approaches/helper";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  HardDrive,
  Lightbulb,
} from "lucide-react";
import { SolutionBlock } from "./SolutionBlock";
import { PublicProblemDetail } from "@/lib/profile/service";

type Approach = PublicProblemDetail["approaches"][number];

export function ApproachSection({ approach }: { approach: Approach }) {
  const displayName = stripStatusSuffix(approach.name);
  const statusBadge = getStatusBadge(approach.name);
  const hasMechanics = Boolean(approach.whyItWorks || approach.whenToUse);
  const hasTradeoffs = Boolean(approach.pros || approach.cons);

  return (
    <div className="space-y-5  border border-[#4a4a4a] bg-[#373737] p-5 sm:p-6 shadow-2xs text-white">
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
              <div className="flex items-center gap-1.5  border border-[#4a4a4a] bg-[#2a2a2a] px-2.5 py-1 text-white">
                <Clock className="size-4 text-sky-400" />
                <span className="text-zinc-300">Time:</span>
                <span className="font-mono font-semibold text-white">
                  {approach.timeComplexity}
                </span>
              </div>
            )}
            {approach.spaceComplexity && (
              <div className="flex items-center gap-1.5  border border-[#4a4a4a] bg-[#2a2a2a] px-2.5 py-1 text-white">
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
        <div className=" border border-[#4a4a4a] bg-[#2a2a2a] p-5 text-white shadow-2xs">
          <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-amber-400">
            <Lightbulb className="size-5 text-amber-400 shrink-0" />
            <span>Core Idea</span>
          </div>
          <p className="mt-2 text-sm sm:text-base leading-relaxed font-normal">
            {FormatText(approach.coreIdea)}
          </p>
        </div>
      )}

      {/* ── Why It Works & When To Use ─────────────────────────── */}
      {hasMechanics && (
        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          {approach.whyItWorks && (
            <div className=" border border-[#4a4a4a] bg-[#2a2a2a] p-5 text-white shadow-2xs">
              <div className="flex items-center gap-2.5 text-base font-bold text-zinc-100 mb-2.5">
                <Compass className="size-5 text-sky-400 shrink-0" />
                <span>Why It Works</span>
              </div>
              <p className="whitespace-pre-wrap text-sm sm:text-[15px]  leading-relaxed font-normal">
                {FormatText(approach.whyItWorks!)}
              </p>
            </div>
          )}
          {approach.whenToUse && (
            <div className=" border border-[#4a4a4a] bg-[#2a2a2a] p-5 text-white shadow-2xs">
              <div className="flex items-center gap-2.5 text-base font-bold text-zinc-100 mb-2.5">
                <Compass className="size-5 text-purple-400 shrink-0" />
                <span>When To Use</span>
              </div>
              <p className="whitespace-pre-wrap text-sm sm:text-[15px]  leading-relaxed font-normal">
                {FormatText(approach.whenToUse!)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Trade-offs ─────────────────────────────────────────── */}
      {hasTradeoffs && (
        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          {approach.pros && (
            <div className=" border border-emerald-400 bg-emerald-400/10 p-5 text-white shadow-2xs">
              <div className="flex items-center gap-2.5 text-base font-bold text-emerald-400 mb-2.5">
                <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                <span>Pros &amp; Advantages</span>
              </div>
              <p className="whitespace-pre-wrap text-sm sm:text-[15px]  leading-relaxed font-normal">
                {FormatText(approach.pros!)}
              </p>
            </div>
          )}
          {approach.cons && (
            <div className=" border border-rose-400 bg-rose-400/10 p-5 text-white shadow-2xs">
              <div className="flex items-center gap-2.5 text-base font-bold text-rose-400 mb-2.5">
                <AlertTriangle className="size-5 text-rose-400 shrink-0" />
                <span>Cons &amp; Limitations</span>
              </div>
              <p className="whitespace-pre-wrap text-sm sm:text-[15px] leading-relaxed font-normal">
                {FormatText(approach.cons!)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Pitfalls ───────────────────────────────────────────── */}
      {approach.mistakes && (
        <div className=" border border-amber-400 bg-amber-400/10 p-5 text-white shadow-2xs">
          <div className="flex items-center gap-2.5 text-base font-bold text-amber-400 mb-2.5">
            <AlertTriangle className="size-5 text-amber-400 shrink-0" />
            <span>Common Mistakes to Avoid</span>
          </div>
          <p className="whitespace-pre-wrap text-sm sm:text-[15px]  leading-relaxed font-normal">
            {FormatText(approach.mistakes)}
          </p>
        </div>
      )}

      {/* ── Additional Notes ───────────────────────────────────── */}
      {approach.notes && (
        <div className=" border border-muted-foreground bg-muted-foreground/10 p-5 text-white shadow-2xs">
          <div className="flex items-center gap-2.5 text-base font-bold text-zinc-100 mb-2">
            <FileText className="size-5 text-muted-foreground shrink-0" />
            <span>Additional Notes</span>
          </div>
          <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-muted-foreground leading-relaxed font-normal">
            {FormatText(approach.notes)}
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
