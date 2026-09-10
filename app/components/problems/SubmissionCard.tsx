"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SubmissionCardProps {
  status: string;
  language: string;
  runtimeMs: number | null;
  memoryBytes: bigint | null;
  submittedAt: Date | null;
  code: string | null;
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "ACCEPTED":
      return "bg-green-50 text-green-700 border border-green-200";
    case "WRONG_ANSWER":
    case "RUNTIME_ERROR":
    case "COMPILE_ERROR":
      return "bg-red-50 text-red-700 border border-red-200";
    case "TIME_LIMIT_EXCEEDED":
    case "MEMORY_LIMIT_EXCEEDED":
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    default:
      return "bg-muted text-muted-foreground border";
  }
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function SubmissionCard({
  status,
  language,
  runtimeMs,
  memoryBytes,
  submittedAt,
  code,
}: SubmissionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg border bg-card">
      {/* Header — click anywhere to expand/collapse */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full px-4 py-3 text-left"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: status badge + language + date */}
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(status)}`}
              >
                {status.replaceAll("_", " ")}
              </span>
              <span className="text-sm text-muted-foreground">{language}</span>
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

      {/* Expanded: historical submission code */}
      {isExpanded && code && (
        <div className="border-t px-4 pb-4 pt-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Submission Code
          </p>
          <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm">
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
