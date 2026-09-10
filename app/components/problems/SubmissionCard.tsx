"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles, AlertCircle, Code, CheckCircle2 } from "lucide-react";
import { SubmissionAnalysisContainer } from "./analysis/SubmissionAnalysisContainer";
import type { SerializedSubmissionAnalysis } from "./analysis/types";
import { cn } from "@/lib/utils";

export interface SubmissionCardProps {
  id: string;
  status: string;
  language: string;
  runtimeMs: number | null;
  memoryBytes: bigint | number | null;
  submittedAt: Date | string | null;
  code: string | null;
  analyses?: SerializedSubmissionAnalysis[];
  isSelected?: boolean;
  onSelect?: () => void;
  showAnalysisInside?: boolean;
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "ACCEPTED":
      return "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/40";
    case "WRONG_ANSWER":
    case "RUNTIME_ERROR":
    case "COMPILE_ERROR":
      return "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/40";
    case "TIME_LIMIT_EXCEEDED":
    case "MEMORY_LIMIT_EXCEEDED":
      return "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800/40";
    default:
      return "bg-muted text-muted-foreground border";
  }
}

function formatDate(date: Date | string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function SubmissionCard({
  id,
  status,
  language,
  runtimeMs,
  memoryBytes,
  submittedAt,
  code,
  analyses = [],
  isSelected = false,
  onSelect,
  showAnalysisInside = false,
}: SubmissionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const latestAnalysis = analyses[0];

  function handleCardClick() {
    onSelect?.();
    setIsExpanded((prev) => !prev);
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-card transition-all text-card-foreground",
        isSelected
          ? "border-primary/60 ring-2 ring-primary/20 bg-primary/[0.02]"
          : "hover:border-muted-foreground/30",
      )}
    >
      {/* Header — click to select and expand/collapse */}
      <button
        type="button"
        onClick={handleCardClick}
        aria-selected={isSelected}
        aria-expanded={isExpanded}
        className="w-full px-4 py-3 text-left focus:outline-none"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: status badge + language + date + selection indicator + analysis indicator */}
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              {/* Radio-like active selection indicator if inside selectable list */}
              {onSelect && (
                <span
                  className={cn(
                    "flex size-4 items-center justify-center rounded-full border transition-colors shrink-0",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40 bg-background",
                  )}
                  title={isSelected ? "Selected for AI review" : "Click to select"}
                >
                  {isSelected && <CheckCircle2 className="size-3 stroke-[3]" />}
                </span>
              )}

              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(
                  status,
                )}`}
              >
                {status.replaceAll("_", " ")}
              </span>

              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                {language}
              </span>

              {/* Analysis status indicator on card header */}
              {latestAnalysis && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    latestAnalysis.status === "DRAFT_READY"
                      ? "bg-primary/10 text-primary"
                      : latestAnalysis.status === "FAILED"
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {latestAnalysis.status === "DRAFT_READY" ? (
                    <>
                      <Sparkles className="size-3" />
                      <span>AI Review Ready</span>
                    </>
                  ) : latestAnalysis.status === "FAILED" ? (
                    <>
                      <AlertCircle className="size-3" />
                      <span>AI Review Failed</span>
                    </>
                  ) : (
                    <span>AI Review In Progress</span>
                  )}
                </span>
              )}
            </div>

            {submittedAt && (
              <span className="text-[11px] sm:text-xs text-muted-foreground">
                {formatDate(submittedAt)}
              </span>
            )}
          </div>

          {/* Right: runtime + memory + code indicator + chevron */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="text-right text-xs sm:text-sm text-muted-foreground">
              <p>{runtimeMs != null ? `${runtimeMs} ms` : "—"}</p>
              <p>
                {memoryBytes != null
                  ? `${Math.round(Number(memoryBytes) / 1024 / 1024)} MB`
                  : "—"}
              </p>
            </div>

            {code && (
              <span
                className="hidden sm:inline-flex items-center gap-0.5 text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono"
                title="Historical code available"
              >
                <Code className="size-3" />
                <span>Code</span>
              </span>
            )}

            {isExpanded ? (
              <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded body */}
      {isExpanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-4">
          {/* Historical submission code */}
          {code ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Your Submitted Code (Historical attempt — unchanged)
                </p>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {language}
                </span>
              </div>
              <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs font-mono leading-relaxed max-h-60 overflow-y-auto">
                <code>{code}</code>
              </pre>
            </div>
          ) : (
            <p className="text-xs italic text-muted-foreground">
              No historical code recorded for this submission.
            </p>
          )}

          {/* Optional: Embedded AI Analysis (if showAnalysisInside is true) */}
          {showAnalysisInside && (
            <div className="border-t pt-4">
              <SubmissionAnalysisContainer
                submissionId={id}
                initialAnalyses={analyses}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
