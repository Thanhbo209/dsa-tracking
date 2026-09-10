"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface SubmissionCodeOption {
  id: string;
  language: string;
  solutionName: string;
  approachName: string;
}

interface SubmissionCardProps {
  status: string;
  language: string;
  runtimeMs: number | null;
  memoryBytes: bigint | null;
  submittedAt: Date | null;
  code: string | null;
  submissionId: string;
  linkedCodeId: string | null;
  availableCodes: SubmissionCodeOption[];
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
  submissionId,
  linkedCodeId,
  availableCodes,
}: SubmissionCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCodeId, setSelectedCodeId] = useState<string>("");
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const linkedCode = linkedCodeId
    ? availableCodes.find((c) => c.id === linkedCodeId)
    : null;

  async function handleLink() {
    const codeId = selectedCodeId || null;
    setIsLinking(true);
    setLinkError(null);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/code`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }
      setSelectedCodeId("");
      router.refresh();
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLinking(false);
    }
  }

  async function handleUnlink() {
    setIsLinking(true);
    setLinkError(null);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/code`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeId: null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }
      router.refresh();
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLinking(false);
    }
  }

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

      {/* Expanded: historical submission code (submission.code, NOT linked Code.code) */}
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

      {/* Knowledge link section */}
      <div className="border-t px-4 py-3">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Knowledge
        </p>

        {linkedCode ? (
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm">
              <span className="font-medium">{linkedCode.approachName}</span>
              <span className="mx-1 text-muted-foreground">→</span>
              {linkedCode.solutionName}
              <span className="mx-1 text-muted-foreground">→</span>
              <span className="font-mono text-xs">{linkedCode.language}</span>
            </p>
            <button
              type="button"
              onClick={handleUnlink}
              disabled={isLinking}
              className="shrink-0 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLinking ? "Unlinking…" : "Unlink"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Not linked</p>
        )}

        <div className="mt-2 flex items-center gap-2">
          <select
            value={selectedCodeId}
            onChange={(e) => setSelectedCodeId(e.target.value)}
            disabled={isLinking || availableCodes.length === 0}
            className="flex-1 rounded-md border bg-background px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {availableCodes.length === 0
                ? "No codes available"
                : "Select a code…"}
            </option>
            {availableCodes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.approachName} → {c.solutionName} → {c.language}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleLink}
            disabled={isLinking || !selectedCodeId}
            className="shrink-0 rounded-md border px-3 py-1 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLinking ? "Linking…" : "Link"}
          </button>
        </div>

        {linkError && (
          <p className="mt-1.5 text-xs text-destructive">{linkError}</p>
        )}
      </div>
    </div>
  );
}
