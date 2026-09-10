"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles, AlertCircle } from "lucide-react";
import { SubmissionAnalysisContainer } from "./analysis/SubmissionAnalysisContainer";
import type { SerializedSubmissionAnalysis } from "./analysis/types";

interface SubmissionCardProps {
  id: string;
  status: string;
  language: string;
  runtimeMs: number | null;
  memoryBytes: bigint | number | null;
  submittedAt: Date | string | null;
  code: string | null;
  analyses?: SerializedSubmissionAnalysis[];
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
}: SubmissionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const latestAnalysis = analyses[0];

  return (
    <div className="rounded-lg border bg-card">
      {/* Header — click anywhere to expand/collapse */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full px-4 py-3 text-left"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: status badge + language + date + analysis indicator */}
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(
                  status,
                )}`}
              >
                {status.replaceAll("_", " ")}
              </span>
              <span className="text-sm text-muted-foreground">{language}</span>

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
              <span className="text-xs text-muted-foreground">
                {formatDate(submittedAt)}
              </span>
            )}
          </div>

          {/* Right: runtime + memory + chevron */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="text-right text-sm text-muted-foreground">
              <p>{runtimeMs != null ? `${runtimeMs} ms` : "—"}</p>
              <p>
                {memoryBytes != null
                  ? `${Math.round(Number(memoryBytes) / 1024 / 1024)} MB`
                  : "—"}
              </p>
            </div>
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
        <div className="border-t px-4 pb-5 pt-4 space-y-6">
          {/* Historical submission code */}
          {code && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your Submitted Code (Historical attempt — unchanged)
              </p>
              <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs font-mono leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          )}

          {/* AI Analysis and Knowledge Draft */}
          <div className="border-t pt-5">
            <SubmissionAnalysisContainer
              submissionId={id}
              initialAnalyses={analyses}
            />
          </div>
        </div>
      )}
    </div>
  );
}
