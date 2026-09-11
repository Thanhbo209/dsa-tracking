"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle, Code, CheckCircle2 } from "lucide-react";
import { DsaLogo } from "@/components/brand/DsaLogo";
import { SubmissionAnalysisContainer } from "./analysis/SubmissionAnalysisContainer";
import type { SerializedSubmissionAnalysis } from "./analysis/types";
import { cn } from "@/lib/utils";
import { CodeViewer } from "./CodeViewer";

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
        "rounded-lg border border-[#4a4a4a] bg-[#373737] transition-all text-white shadow-2xs",
        isSelected
          ? "border-primary ring-2 ring-primary/30"
          : "hover:border-zinc-400/60",
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
                      : "border-white/60 bg-[#2a2a2a]",
                  )}
                  title={isSelected ? "Selected for AI review" : "Click to select"}
                >
                  {isSelected && <CheckCircle2 className="size-3 stroke-[3]" />}
                </span>
              )}

              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs sm:text-sm font-medium ${statusBadgeClass(
                  status,
                )}`}
              >
                {status.replaceAll("_", " ")}
              </span>

              <span className="text-sm sm:text-base font-semibold text-white">
                {language}
              </span>

              {/* Analysis status indicator on card header */}
              {latestAnalysis && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    latestAnalysis.status === "DRAFT_READY"
                      ? "bg-primary/20 text-white border border-primary/40"
                      : latestAnalysis.status === "FAILED"
                        ? "bg-red-500/20 text-white border border-red-500/40"
                        : "bg-[#2a2a2a] text-white border border-[#4a4a4a]"
                  }`}
                >
                  {latestAnalysis.status === "DRAFT_READY" ? (
                    <>
                      <DsaLogo size="xs" className="h-3.5 w-auto inline-block" />
                      <span>AI Review Ready</span>
                    </>
                  ) : latestAnalysis.status === "FAILED" ? (
                    <>
                      <AlertCircle className="size-3.5 text-red-400" />
                      <span>AI Review Failed</span>
                    </>
                  ) : (
                    <span>AI Review In Progress</span>
                  )}
                </span>
              )}
            </div>

            {submittedAt && (
              <span className="text-xs sm:text-sm text-zinc-300">
                {formatDate(submittedAt)}
              </span>
            )}
          </div>

          {/* Right: runtime + memory + code indicator + chevron */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="text-right text-sm sm:text-base text-white font-mono">
              <p>{runtimeMs != null ? `${runtimeMs} ms` : "—"}</p>
              <p>
                {memoryBytes != null
                  ? `${Math.round(Number(memoryBytes) / 1024 / 1024)} MB`
                  : "—"}
              </p>
            </div>

            {code && (
              <span
                className="hidden sm:inline-flex items-center gap-0.5 text-[11px] text-white bg-[#2a2a2a] border border-[#4a4a4a] px-1.5 py-0.5 rounded font-mono"
                title="Historical code available"
              >
                <Code className="size-3 text-white" />
                <span>Code</span>
              </span>
            )}

            {isExpanded ? (
              <ChevronUp className="size-4 shrink-0 text-white" />
            ) : (
              <ChevronDown className="size-4 shrink-0 text-white" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded body */}
      {isExpanded && (
        <div className="border-t border-[#4a4a4a] px-4 pb-4 pt-3 space-y-4">
          {/* Historical submission code */}
          {code ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-white">
                  Your Submitted Code (Historical attempt — unchanged)
                </p>
                <span className="text-[10px] font-mono text-white">
                  {language}
                </span>
              </div>
              <CodeViewer
                code={code}
                language={language}
                badge="Historical Attempt"
              />
            </div>
          ) : (
            <p className="text-xs italic text-white">
              No historical code recorded for this submission.
            </p>
          )}

          {/* Optional: Embedded AI Analysis (if showAnalysisInside is true) */}
          {showAnalysisInside && (
            <div className="border-t border-[#4a4a4a] pt-4">
              <SubmissionAnalysisContainer
                submissionId={id}
                submissionCode={code}
                submissionLanguage={language}
                submissionStatus={status}
                runtimeMs={runtimeMs}
                initialAnalyses={analyses}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
