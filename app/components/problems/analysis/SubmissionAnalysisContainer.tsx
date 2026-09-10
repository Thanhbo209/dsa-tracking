"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, RotateCcw, History, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SerializedSubmissionAnalysis } from "./types";
import { AiReviewSection } from "./AiReviewSection";
import { KnowledgeDraftSection } from "./KnowledgeDraftSection";
import { AnalysisEmptyState } from "./AnalysisEmptyState";
import { AnalysisGeneratingState } from "./AnalysisGeneratingState";
import { AnalysisFailedState } from "./AnalysisFailedState";

interface SubmissionAnalysisContainerProps {
  submissionId: string;
  initialAnalyses?: SerializedSubmissionAnalysis[];
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SubmissionAnalysisContainer({
  submissionId,
  initialAnalyses = [],
}: SubmissionAnalysisContainerProps) {
  const router = useRouter();
  const [analyses, setAnalyses] =
    useState<SerializedSubmissionAnalysis[]>(initialAnalyses);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const activeAnalysis = analyses[selectedIndex] || null;

  async function handleAnalyze() {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/submissions/${submissionId}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.error || "Failed to analyze submission");
      }

      const newAnalysis: SerializedSubmissionAnalysis = await response.json();

      // Prepend the new analysis to the list and select it as latest
      setAnalyses((prev) => [newAnalysis, ...prev]);
      setSelectedIndex(0);

      // Refresh server components to synchronize server state
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Analysis request failed";
      setActionError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  // If analysis is currently in progress, show generating state
  if (isAnalyzing) {
    return <AnalysisGeneratingState />;
  }

  // If no analysis exists yet
  if (analyses.length === 0) {
    return (
      <div className="space-y-3">
        {actionError && (
          <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-400">
            {actionError}
          </div>
        )}
        <AnalysisEmptyState
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Controls: Analysis Switcher / History & Re-analyze */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/20 px-3.5 py-2">
        <div className="flex items-center gap-2">
          <Bot className="size-4 text-primary shrink-0" />
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-semibold text-foreground">
              {selectedIndex === 0 ? "Latest Analysis" : "Previous Analysis"}
            </span>
            {activeAnalysis?.createdAt && (
              <span className="text-muted-foreground">
                ({formatDate(activeAnalysis.createdAt)})
              </span>
            )}
            {activeAnalysis?.modelName && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                {activeAnalysis.modelName}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* History selector if multiple analyses exist */}
          {analyses.length > 1 && (
            <div className="flex items-center gap-1 text-xs">
              <History className="size-3.5 text-muted-foreground" />
              <select
                aria-label="Select analysis history run"
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(Number(e.target.value))}
                className="rounded border bg-background px-2 py-1 text-xs text-foreground outline-none"
              >
                {analyses.map((item, idx) => (
                  <option key={item.id || idx} value={idx}>
                    {idx === 0 ? "Latest: " : `Run #${analyses.length - idx}: `}
                    {item.createdAt ? formatDate(item.createdAt) : `Analysis ${idx + 1}`}
                    {item.status === "FAILED" ? " (Failed)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Re-analyze Action Button */}
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="gap-1.5"
          >
            <RotateCcw className="size-3" />
            <span>Re-analyze</span>
          </Button>
        </div>
      </div>

      {actionError && (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-400">
          {actionError}
        </div>
      )}

      {/* Active Analysis View */}
      {activeAnalysis && (
        <div>
          {activeAnalysis.status === "FAILED" ? (
            <AnalysisFailedState
              errorMessage={activeAnalysis.errorMessage}
              onRetry={handleAnalyze}
              isRetrying={isAnalyzing}
            />
          ) : activeAnalysis.status === "DRAFT_READY" && activeAnalysis.review ? (
            <div className="space-y-6">
              <AiReviewSection review={activeAnalysis.review} />
              {activeAnalysis.draft && (
                <KnowledgeDraftSection draft={activeAnalysis.draft} />
              )}
            </div>
          ) : (
            <div className="rounded-lg border p-6 text-center text-xs text-muted-foreground">
              Analysis in progress or incomplete.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
