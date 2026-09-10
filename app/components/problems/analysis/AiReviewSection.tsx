import * as React from "react";
import type { AiReview } from "@/lib/validation/analysis";
import {
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  Lightbulb,
  AlertTriangle,
  Zap,
  Target,
  FileCode2,
} from "lucide-react";

interface AiReviewSectionProps {
  review: AiReview;
}

/**
 * Formats inline backticked code identifiers like `stack.append()` into clean code chips.
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

export function AiReviewSection({ review }: AiReviewSectionProps) {
  return (
    <div className="space-y-6 text-white">
      {/* Header & Correctness Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#4a4a4a] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h4 className="text-lg font-bold text-white">
              AI Diagnostic Review
            </h4>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs sm:text-sm font-medium ${
                review.isCorrect
                  ? "bg-green-500/20 text-green-300 border border-green-500/40"
                  : "bg-red-500/20 text-red-300 border border-red-500/40"
              }`}
            >
              {review.isCorrect ? (
                <>
                  <CheckCircle2 className="size-3.5 text-green-400" />
                  <span>Correct Logic</span>
                </>
              ) : (
                <>
                  <XCircle className="size-3.5 text-red-400" />
                  <span>Contains Bugs / Suboptimal</span>
                </>
              )}
            </span>
          </div>
          <p className="mt-1.5 text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
            {formatText(review.summary)}
          </p>
        </div>
      </div>

      {/* Complexity Breakdown (Time & Space) */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Time Complexity */}
        <div className="rounded-xl border border-[#4a4a4a] bg-[#373737] p-5 text-white shadow-2xs">
          <div className="flex items-center justify-between gap-2 border-b border-[#4a4a4a] pb-3">
            <div className="flex items-center gap-2 text-base font-semibold text-zinc-100">
              <Clock className="size-4.5 text-[#38bdf8]" />
              <span>Time Complexity</span>
            </div>
            <span className="rounded bg-[#262626] border border-[#4a4a4a] px-2.5 py-0.5 font-mono text-sm sm:text-base font-semibold text-zinc-200">
              {review.timeComplexity.value}
            </span>
          </div>

          <p className="mt-3 text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
            {formatText(review.timeComplexity.explanation)}
          </p>

          {review.timeComplexity.reasoning &&
            review.timeComplexity.reasoning.length > 0 && (
              <div className="mt-3.5 border-t border-[#4a4a4a] pt-3">
                <p className="text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                  Why this code is {review.timeComplexity.value}:
                </p>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm sm:text-[15px] text-zinc-300">
                  {review.timeComplexity.reasoning.map((point, i) => (
                    <li key={i} className="leading-relaxed font-normal">
                      {formatText(point)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>

        {/* Space Complexity */}
        <div className="rounded-xl border border-[#4a4a4a] bg-[#373737] p-5 text-white shadow-2xs">
          <div className="flex items-center justify-between gap-2 border-b border-[#4a4a4a] pb-3">
            <div className="flex items-center gap-2 text-base font-semibold text-zinc-100">
              <HardDrive className="size-4.5 text-[#38bdf8]" />
              <span>Space Complexity</span>
            </div>
            <span className="rounded bg-[#262626] border border-[#4a4a4a] px-2.5 py-0.5 font-mono text-sm sm:text-base font-semibold text-zinc-200">
              {review.spaceComplexity.value}
            </span>
          </div>

          <p className="mt-3 text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
            {formatText(review.spaceComplexity.explanation)}
          </p>

          {review.spaceComplexity.reasoning &&
            review.spaceComplexity.reasoning.length > 0 && (
              <div className="mt-3.5 border-t border-[#4a4a4a] pt-3">
                <p className="text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                  Why this code is {review.spaceComplexity.value}:
                </p>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm sm:text-[15px] text-zinc-300">
                  {review.spaceComplexity.reasoning.map((point, i) => (
                    <li key={i} className="leading-relaxed font-normal">
                      {formatText(point)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      </div>

      {/* Diagnostics: Strengths & Mistakes */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Strengths */}
        <div className="rounded-xl border border-[#4a4a4a] bg-[#373737] p-5 text-white shadow-2xs">
          <div className="flex items-center gap-2 text-base font-semibold text-zinc-100 mb-3">
            <Zap className="size-4.5 text-green-400" />
            <span>Strengths</span>
          </div>
          {review.strengths && review.strengths.length > 0 ? (
            <ul className="list-disc space-y-2 pl-5 text-sm sm:text-[15px] text-zinc-300">
              {review.strengths.map((str, i) => (
                <li key={i} className="leading-relaxed font-normal">
                  {formatText(str)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-400">None noted.</p>
          )}
        </div>

        {/* Mistakes / Inefficiencies */}
        <div className="rounded-xl border border-[#4a4a4a] bg-[#373737] p-5 text-white shadow-2xs">
          <div className="flex items-center gap-2 text-base font-semibold text-zinc-100 mb-3">
            <AlertTriangle className="size-4.5 text-amber-400" />
            <span>Mistakes & Inefficiencies</span>
          </div>
          {review.mistakes && review.mistakes.length > 0 ? (
            <ul className="list-disc space-y-2 pl-5 text-sm sm:text-[15px] text-zinc-300">
              {review.mistakes.map((mistake, i) => (
                <li key={i} className="leading-relaxed font-normal">
                  {formatText(mistake)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-400">No mistakes identified.</p>
          )}
        </div>
      </div>

      {/* Detailed Gaps & Missed Edge Cases */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Missed Edge Cases */}
        <div className="rounded-xl border border-[#4a4a4a] bg-[#373737] p-5 text-white shadow-2xs">
          <div className="flex items-center gap-2 text-base font-semibold text-zinc-100 mb-3">
            <Target className="size-4.5 text-[#38bdf8]" />
            <span>Missed Edge Cases</span>
          </div>
          {review.missedEdgeCases && review.missedEdgeCases.length > 0 ? (
            <ul className="list-disc space-y-2 pl-5 text-sm sm:text-[15px] text-zinc-300">
              {review.missedEdgeCases.map((edgeCase, i) => (
                <li key={i} className="leading-relaxed font-normal">
                  {formatText(edgeCase)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-400">
              All tested edge cases handled properly.
            </p>
          )}
        </div>

        {/* Concept Gaps */}
        <div className="rounded-xl border border-[#4a4a4a] bg-[#373737] p-5 text-white shadow-2xs">
          <div className="flex items-center gap-2 text-base font-semibold text-zinc-100 mb-3">
            <FileCode2 className="size-4.5 text-[#38bdf8]" />
            <span>Concept Gaps</span>
          </div>
          {review.conceptGaps && review.conceptGaps.length > 0 ? (
            <ul className="list-disc space-y-2 pl-5 text-sm sm:text-[15px] text-zinc-300">
              {review.conceptGaps.map((gap, i) => (
                <li key={i} className="leading-relaxed font-normal">
                  {formatText(gap)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-400">
              Demonstrates solid algorithmic fluency.
            </p>
          )}
        </div>
      </div>

      {/* Improvement Suggestions */}
      {review.improvementSuggestions &&
        review.improvementSuggestions.length > 0 && (
          <div className="rounded-xl border border-[#4a4a4a] bg-[#373737] p-5 text-white shadow-2xs">
            <div className="flex items-center gap-2 text-base font-semibold text-zinc-100 mb-3">
              <Lightbulb className="size-4.5 text-amber-400" />
              <span>Actionable Improvement Suggestions</span>
            </div>
            <ul className="list-disc space-y-2 pl-5 text-sm sm:text-[15px] text-zinc-300">
              {review.improvementSuggestions.map((suggestion, i) => (
                <li key={i} className="leading-relaxed font-normal">
                  {formatText(suggestion)}
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* High-Value Learning Takeaways */}
      {review.learningTakeaways && review.learningTakeaways.length > 0 && (
        <div className="rounded-xl border border-[#4a4a4a] bg-[#373737] p-5 text-white shadow-2xs">
          <div className="flex items-center gap-2 text-base font-semibold text-[#38bdf8] mb-3">
            <Lightbulb className="size-4.5 text-[#38bdf8]" />
            <span>Core Learning Takeaways</span>
          </div>
          <ul className="list-disc space-y-2 pl-5 text-sm sm:text-[15px] text-zinc-200 font-medium">
            {review.learningTakeaways.map((takeaway, i) => (
              <li key={i} className="leading-relaxed font-normal">
                {formatText(takeaway)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
