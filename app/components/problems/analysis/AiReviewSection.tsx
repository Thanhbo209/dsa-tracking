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

export function AiReviewSection({ review }: AiReviewSectionProps) {
  return (
    <div className="space-y-6">
      {/* Header & Correctness Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-foreground">
              AI Diagnostic Review
            </h4>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                review.isCorrect
                  ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
              }`}
            >
              {review.isCorrect ? (
                <>
                  <CheckCircle2 className="size-3.5" />
                  Correct Logic
                </>
              ) : (
                <>
                  <XCircle className="size-3.5" />
                  Contains Bugs / Suboptimal
                </>
              )}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            {review.summary}
          </p>
        </div>
      </div>

      {/* Complexity Breakdown (Time & Space) */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Time Complexity */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-2 border-b pb-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="size-4 text-primary" />
              <span>Time Complexity</span>
            </div>
            <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-sm font-semibold text-primary">
              {review.timeComplexity.value}
            </span>
          </div>

          <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
            {review.timeComplexity.explanation}
          </p>

          {review.timeComplexity.reasoning &&
            review.timeComplexity.reasoning.length > 0 && (
              <div className="mt-3 border-t pt-2.5">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Why this code is {review.timeComplexity.value}:
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                  {review.timeComplexity.reasoning.map((point, i) => (
                    <li key={i} className="leading-relaxed">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>

        {/* Space Complexity */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-2 border-b pb-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <HardDrive className="size-4 text-primary" />
              <span>Space Complexity</span>
            </div>
            <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-sm font-semibold text-primary">
              {review.spaceComplexity.value}
            </span>
          </div>

          <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
            {review.spaceComplexity.explanation}
          </p>

          {review.spaceComplexity.reasoning &&
            review.spaceComplexity.reasoning.length > 0 && (
              <div className="mt-3 border-t pt-2.5">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Why this code is {review.spaceComplexity.value}:
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                  {review.spaceComplexity.reasoning.map((point, i) => (
                    <li key={i} className="leading-relaxed">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      </div>

      {/* Diagnostics: Strengths & Mistakes */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Strengths */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
            <Zap className="size-4 text-green-600 dark:text-green-400" />
            <span>Strengths</span>
          </div>
          {review.strengths && review.strengths.length > 0 ? (
            <ul className="list-disc space-y-1.5 pl-4 text-xs text-muted-foreground">
              {review.strengths.map((str, i) => (
                <li key={i} className="leading-relaxed">
                  {str}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">None noted.</p>
          )}
        </div>

        {/* Mistakes / Inefficiencies */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
            <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
            <span>Mistakes & Inefficiencies</span>
          </div>
          {review.mistakes && review.mistakes.length > 0 ? (
            <ul className="list-disc space-y-1.5 pl-4 text-xs text-muted-foreground">
              {review.mistakes.map((mistake, i) => (
                <li key={i} className="leading-relaxed">
                  {mistake}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No mistakes identified.</p>
          )}
        </div>
      </div>

      {/* Detailed Gaps & Missed Edge Cases */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Missed Edge Cases */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
            <Target className="size-4 text-primary" />
            <span>Missed Edge Cases</span>
          </div>
          {review.missedEdgeCases && review.missedEdgeCases.length > 0 ? (
            <ul className="list-disc space-y-1.5 pl-4 text-xs text-muted-foreground">
              {review.missedEdgeCases.map((edgeCase, i) => (
                <li key={i} className="leading-relaxed">
                  {edgeCase}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              All tested edge cases handled properly.
            </p>
          )}
        </div>

        {/* Concept Gaps */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
            <FileCode2 className="size-4 text-primary" />
            <span>Concept Gaps</span>
          </div>
          {review.conceptGaps && review.conceptGaps.length > 0 ? (
            <ul className="list-disc space-y-1.5 pl-4 text-xs text-muted-foreground">
              {review.conceptGaps.map((gap, i) => (
                <li key={i} className="leading-relaxed">
                  {gap}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              Demonstrates solid algorithmic fluency.
            </p>
          )}
        </div>
      </div>

      {/* Improvement Suggestions */}
      {review.improvementSuggestions &&
        review.improvementSuggestions.length > 0 && (
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              <Lightbulb className="size-4 text-amber-500" />
              <span>Actionable Improvement Suggestions</span>
            </div>
            <ul className="list-disc space-y-1.5 pl-4 text-xs text-muted-foreground">
              {review.improvementSuggestions.map((suggestion, i) => (
                <li key={i} className="leading-relaxed">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* High-Value Learning Takeaways */}
      {review.learningTakeaways && review.learningTakeaways.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
            <Lightbulb className="size-4 text-primary" />
            <span>Core Learning Takeaways</span>
          </div>
          <ul className="list-disc space-y-1.5 pl-4 text-xs text-foreground/90 font-medium">
            {review.learningTakeaways.map((takeaway, i) => (
              <li key={i} className="leading-relaxed">
                {takeaway}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
