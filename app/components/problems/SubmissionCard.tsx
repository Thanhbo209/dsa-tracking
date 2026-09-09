"use client";

import { useState } from "react";

interface SubmissionCardProps {
  status: string;
  language: string;
  runtimeMs: number | null;
  memoryBytes: bigint | null;
  submittedAt: Date | null;
  code: string | null;
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
    </div>
  );
}
