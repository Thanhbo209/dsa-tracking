"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, History, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SerializedSubmissionAnalysis } from "./types";
import type { AiDraft } from "@/lib/validation/analysis";
import { AiReviewSection } from "./AiReviewSection";
import { KnowledgeDraftSection } from "./KnowledgeDraftSection";
import { AnalysisEmptyState } from "./AnalysisEmptyState";
import { AnalysisGeneratingState } from "./AnalysisGeneratingState";
import { AnalysisFailedState } from "./AnalysisFailedState";

interface SubmissionAnalysisContainerProps {
  submissionId: string;
  submissionCode?: string | null;
  submissionLanguage?: string | null;
  submissionStatus?: string | null;
  runtimeMs?: number | null;
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
  submissionCode,
  submissionLanguage,
  submissionStatus,
  runtimeMs,
  initialAnalyses = [],
}: SubmissionAnalysisContainerProps) {
  const router = useRouter();
  const [analyses, setAnalyses] =
    useState<SerializedSubmissionAnalysis[]>(initialAnalyses);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isPromoting, setIsPromoting] = useState<boolean>(false);
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

  async function handleAccept(editedDraft?: AiDraft) {
    if (isPromoting || !activeAnalysis) return;

    setIsPromoting(true);
    setActionError(null);

    try {
      const response = await fetch(
        `/api/submissions/${submissionId}/analyze/${activeAnalysis.id}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ editedDraft }),
        },
      );

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.error || "Failed to accept draft");
      }

      const { analysis: updatedAnalysis } = await response.json();

      setAnalyses((prev) =>
        prev.map((item) =>
          item.id === updatedAnalysis.id
            ? {
                ...item,
                status: "ACCEPTED",
              }
            : item,
        ),
      );

      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to accept draft";
      setActionError(message);
    } finally {
      setIsPromoting(false);
    }
  }

  async function handleReject() {
    if (isPromoting || !activeAnalysis) return;

    setIsPromoting(true);
    setActionError(null);

    try {
      const response = await fetch(
        `/api/submissions/${submissionId}/analyze/${activeAnalysis.id}/reject`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.error || "Failed to reject draft");
      }

      const updatedAnalysis = await response.json();

      setAnalyses((prev) =>
        prev.map((item) =>
          item.id === updatedAnalysis.id
            ? {
                ...item,
                status: "REJECTED",
              }
            : item,
        ),
      );

      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to reject draft";
      setActionError(message);
    } finally {
      setIsPromoting(false);
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
    <div className="space-y-4 text-white">
      {/* Top Controls: Analysis Switcher / History & Re-analyze */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#4a4a4a] bg-[#373737] px-3.5 py-2 text-white shadow-2xs">
        <div className="flex items-center gap-2">
          <Bot className="size-4 text-primary shrink-0" />
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-semibold text-white">
              {selectedIndex === 0 ? "Latest Analysis" : "Previous Analysis"}
            </span>
            {activeAnalysis?.createdAt && (
              <span className="text-white">
                ({formatDate(activeAnalysis.createdAt)})
              </span>
            )}
            {activeAnalysis?.modelName && (
              <span className="rounded bg-[#2a2a2a] border border-[#4a4a4a] px-1.5 py-0.5 text-[10px] font-mono text-white">
                {activeAnalysis.modelName}
              </span>
            )}
            {activeAnalysis?.status && activeAnalysis.status !== "DRAFT_READY" && (
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                  activeAnalysis.status === "ACCEPTED"
                    ? "bg-green-500/20 text-white border border-green-500/40"
                    : activeAnalysis.status === "REJECTED"
                      ? "bg-zinc-500/20 text-white border border-zinc-500/40"
                      : "bg-red-500/20 text-white border border-red-500/40"
                }`}
              >
                {activeAnalysis.status}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* History selector if multiple analyses exist */}
          {analyses.length > 1 && (
            <div className="flex items-center gap-1 text-xs">
              <History className="size-3.5 text-white" />
              <select
                aria-label="Select analysis history run"
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(Number(e.target.value))}
                className="rounded border border-[#555555] bg-[#222222] px-2 py-1 text-xs text-white outline-none"
              >
                {analyses.map((item, idx) => (
                  <option key={item.id || idx} value={idx}>
                    {idx === 0 ? "Latest: " : `Run #${analyses.length - idx}: `}
                    {item.createdAt ? formatDate(item.createdAt) : `Analysis ${idx + 1}`}
                    {item.status === "ACCEPTED"
                      ? " (Accepted)"
                      : item.status === "REJECTED"
                        ? " (Rejected)"
                        : item.status === "FAILED"
                          ? " (Failed)"
                          : ""}
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
            className="gap-1 text-xs h-7 border-[#555555] bg-[#2a2a2a] text-white hover:bg-[#333333]"
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
          ) : activeAnalysis.review ? (
            <div className="space-y-10 sm:space-y-12">
              <AiReviewSection review={activeAnalysis.review} />

              {activeAnalysis.draft && (
                <div className="pt-8 sm:pt-10 border-t border-[#444444]">
                  <KnowledgeDraftSection
                    draft={activeAnalysis.draft}
                    review={activeAnalysis.review}
                    status={activeAnalysis.status}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    isPromoting={isPromoting}
                    submissionCode={submissionCode}
                    submissionLanguage={submissionLanguage}
                    submissionStatus={submissionStatus}
                    runtimeMs={runtimeMs}
                  />
                </div>
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
