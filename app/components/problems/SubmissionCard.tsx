"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="rounded-lg border p-4">
      <button
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">{status.replaceAll("_", " ")}</p>

            <p className="text-sm text-muted-foreground">{language}</p>
          </div>

          <div className="text-right text-sm text-muted-foreground">
            <p>{runtimeMs != null ? `${runtimeMs} ms` : "N/A"}</p>

            <p>
              {memoryBytes != null
                ? `${Math.round(Number(memoryBytes) / 1024 / 1024)} MB`
                : "N/A"}
            </p>
          </div>
        </div>
      </button>

      {isExpanded && code && (
        <pre className="mt-4 overflow-x-auto rounded-md bg-muted p-4 text-sm">
          <code>{code}</code>
        </pre>
      )}

      {/* Knowledge Code section */}
      <div className="mt-3 border-t pt-3">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Knowledge
        </p>

        {linkedCode ? (
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm">
              {linkedCode.approachName}
              <span className="mx-1 text-muted-foreground">→</span>
              {linkedCode.solutionName}
              <span className="mx-1 text-muted-foreground">→</span>
              {linkedCode.language}
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
              {availableCodes.length === 0 ? "No codes available" : "Select a code…"}
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
