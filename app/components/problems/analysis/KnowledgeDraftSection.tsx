"use client";

import { useState, useMemo } from "react";
import * as React from "react";
import type { AiDraft, AiReview } from "@/lib/validation/analysis";
import type { AnalysisStatus } from "./types";
import { DraftEditForm } from "./DraftEditForm";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit3,
  Check,
  X,
  Lightbulb,
  Compass,
  AlertTriangle,
  FileText,
  Clock,
  HardDrive,
  ListOrdered,
} from "lucide-react";
import { CodeViewer } from "../CodeViewer";

/**
 * Formats inline backticked code identifiers into styled code chips.
 */
function formatText(text: string): React.ReactNode {
  if (!text || !text.includes("`")) return text;
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={idx}
          className="mx-0.5 rounded bg-[#262626] px-1.5 py-0.5 font-mono text-[13px] sm:text-sm text-zinc-200 border border-[#4a4a4a]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

interface KnowledgeDraftSectionProps {
  draft: AiDraft;
  review?: AiReview;
  status: AnalysisStatus;
  onAccept: (editedDraft?: AiDraft) => Promise<void>;
  onReject: () => Promise<void>;
  isPromoting: boolean;
  submissionCode?: string | null;
  submissionLanguage?: string | null;
  submissionStatus?: string | null;
  runtimeMs?: number | null;
}

export function KnowledgeDraftSection({
  draft,
  review,
  status,
  onAccept,
  onReject,
  isPromoting,
  submissionCode,
  submissionLanguage,
  submissionStatus,
  runtimeMs,
}: KnowledgeDraftSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmMode, setConfirmMode] = useState<"accept" | "reject" | null>(
    null,
  );

  const hasUserCode = Boolean(submissionCode && submissionCode.trim().length > 0);
  const isSubmissionAccepted = submissionStatus === "ACCEPTED";

  // Synthesize a complete draft from the user's submission & AI review analytics
  const userSubmissionDraft = useMemo<AiDraft | null>(() => {
    if (!hasUserCode || !submissionCode) return null;

    const timeComp =
      review?.timeComplexity?.value?.trim() ||
      draft.approach.timeComplexity ||
      "O(n)";
    const spaceComp =
      review?.spaceComplexity?.value?.trim() ||
      draft.approach.spaceComplexity ||
      "O(1)";

    // Strengths -> Pros
    const prosText =
      review?.strengths && review.strengths.length > 0
        ? review.strengths.map((s) => `• ${s}`).join("\n")
        : draft.approach.pros || "Implemented and validated on LeetCode.";

    // Bottlenecks / Suggestions / Mistakes -> Cons
    const consList = [
      ...(review?.mistakes || []),
      ...(review?.improvementSuggestions || []),
    ];
    const consText =
      consList.length > 0
        ? consList.map((c) => `• ${c}`).join("\n")
        : draft.approach.cons || "No major bottlenecks identified.";

    // Mistakes to avoid
    const mistakesText =
      review?.mistakes && review.mistakes.length > 0
        ? review.mistakes.map((m) => `• ${m}`).join("\n")
        : review?.missedEdgeCases && review.missedEdgeCases.length > 0
          ? review.missedEdgeCases.map((e) => `• Edge Case: ${e}`).join("\n")
          : draft.approach.mistakes;

    // Core Idea from Review Summary or fallback
    const coreIdeaText = review?.summary?.trim() || draft.approach.coreIdea;

    // Why it works from review timeComplexity explanation
    const whyItWorksText =
      review?.timeComplexity?.explanation?.trim() || draft.approach.whyItWorks;

    // When to use from concept gaps or draft
    const whenToUseText =
      review?.conceptGaps && review.conceptGaps.length > 0
        ? `Best applied when solving problems requiring: ${review.conceptGaps.join(", ")}.`
        : draft.approach.whenToUse;

    // Algorithm from timeComplexity reasoning steps or solution algorithm
    const algorithmText =
      review?.timeComplexity?.reasoning &&
      review.timeComplexity.reasoning.length > 0
        ? review.timeComplexity.reasoning
            .map((step, idx) => `${idx + 1}. ${step}`)
            .join("\n")
        : draft.solution.algorithm;

    // Notes from learning takeaways
    const takeawaysText =
      review?.learningTakeaways && review.learningTakeaways.length > 0
        ? review.learningTakeaways.map((t) => `• ${t}`).join("\n")
        : draft.approach.notes;

    const approachName = isSubmissionAccepted
      ? `${draft.approach.name} (My Accepted Implementation)`
      : `${draft.approach.name} (My Attempt)`;

    return {
      approach: {
        name: approachName,
        coreIdea: coreIdeaText,
        whyItWorks: whyItWorksText,
        whenToUse: whenToUseText,
        timeComplexity: timeComp,
        spaceComplexity: spaceComp,
        pros: prosText,
        cons: consText,
        mistakes: mistakesText,
        notes: takeawaysText,
      },
      solution: {
        name: isSubmissionAccepted
          ? "My Accepted Solution"
          : "My Submission Attempt",
        description: review?.summary?.trim() || draft.solution.description,
        algorithm: algorithmText,
        notes: runtimeMs
          ? `Executed on LeetCode with runtime ${runtimeMs}ms.`
          : draft.solution.notes,
      },
      code: {
        language: submissionLanguage || draft.code.language,
        code: submissionCode,
        notes: isSubmissionAccepted
          ? `Actual accepted submission code (${submissionLanguage || draft.code.language}${runtimeMs ? `, ${runtimeMs}ms` : ""}).`
          : `Actual submission code (${submissionLanguage || draft.code.language}).`,
      },
    };
  }, [
    hasUserCode,
    submissionCode,
    review,
    draft,
    isSubmissionAccepted,
    runtimeMs,
    submissionLanguage,
  ]);

  const [selectedVaultOption, setSelectedVaultOption] = useState<"user" | "ai">(
    hasUserCode && isSubmissionAccepted ? "user" : "ai",
  );

  const activeDraft =
    selectedVaultOption === "user" && userSubmissionDraft
      ? userSubmissionDraft
      : draft;

  const { approach, solution, code } = activeDraft;

  const hasTradeoffs = Boolean(approach.pros || approach.cons);
  const hasMechanics = Boolean(approach.whyItWorks || approach.whenToUse);

  async function handleConfirmAccept() {
    await onAccept(activeDraft);
    setConfirmMode(null);
  }

  if (isEditing) {
    return (
      <div className="pt-6 border-t">
        <DraftEditForm
          initialDraft={activeDraft}
          onSave={async (editedDraft) => {
            await onAccept(editedDraft);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
          isSaving={isPromoting}
          submissionCode={submissionCode}
          submissionLanguage={submissionLanguage}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* ── Status Banner ─────────────────────────────────── */}
      {status === "ACCEPTED" ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/40 bg-green-500/20 px-3.5 py-2.5 text-xs text-white">
          <CheckCircle2 className="size-4 shrink-0 text-green-400" />
          <span className="font-semibold">
            Knowledge Vault Active — You can save your attempt analytics or the AI suggested solution anytime into your knowledge base.
          </span>
        </div>
      ) : status === "REJECTED" ? (
        <div className="flex items-center gap-2 rounded-lg border border-zinc-500/40 bg-[#2a2a2a] px-3.5 py-2.5 text-xs text-white">
          <XCircle className="size-4 shrink-0 text-zinc-400" />
          <span>
            Draft Rejected — This draft was rejected and not saved to your
            knowledge base.
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/20 px-3.5 py-2.5 text-xs text-white">
          <Sparkles className="size-4 shrink-0 text-amber-400" />
          <span className="font-medium">
            AI-generated draft — not saved to your knowledge base
          </span>
        </div>
      )}

      {/* ── Option Selector Tabs (When user code is available) ── */}
      {userSubmissionDraft && (
        <div className="rounded-xl border border-[#4a4a4a] bg-[#2a2a2a] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Choose Vault Knowledge Model
            </span>
            <p className="text-xs sm:text-sm text-zinc-300 mt-0.5">
              Select whether to save your own submission with AI diagnostics or the AI&apos;s suggested optimal solution.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Vault Knowledge Selection"
            className="flex flex-wrap items-center gap-2 rounded-lg bg-[#1a1a1a] p-1.5 border border-[#4a4a4a] self-start sm:self-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedVaultOption === "user"}
              onClick={() => setSelectedVaultOption("user")}
              className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                selectedVaultOption === "user"
                  ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Option 1: My Attempt & AI Analytics</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={selectedVaultOption === "ai"}
              onClick={() => setSelectedVaultOption("ai")}
              className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                selectedVaultOption === "ai"
                  ? "bg-primary/25 text-white border border-primary/50 shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Sparkles className="size-4 text-primary" />
              <span>Option 2: AI Suggested Solution</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Knowledge Model Display ───────────────────────── */}
      <div className="space-y-4 text-white">
        <div className="rounded-xl border border-[#4a4a4a] bg-[#373737] p-5 sm:p-6 space-y-6 shadow-2xs">
          {/* Header & Status */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#4a4a4a] pb-4">
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
                <BookOpen className="size-5 text-primary" />
                {selectedVaultOption === "user"
                  ? "My Attempt & AI Analytics"
                  : "AI Suggested Solutions"}
              </h4>
              <p className="text-sm sm:text-base text-zinc-300 mt-1">
                {selectedVaultOption === "user"
                  ? "Knowledge model built directly from your submitted code and AI diagnostic findings."
                  : "Structured solution and algorithm suggestions based on your submission."}
              </p>
            </div>

            {/* Action Bar (available anytime unless REJECTED) */}
            {status !== "REJECTED" && !confirmMode && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  disabled={isPromoting}
                  className="gap-1.5 border-[#555555] bg-[#2a2a2a] text-white hover:bg-[#333333]"
                >
                  <Edit3 className="size-3.5 text-white" />
                  <span>Edit Draft</span>
                </Button>

                {status === "DRAFT_READY" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmMode("reject")}
                    disabled={isPromoting}
                    className="gap-1.5 border-red-500/40 bg-[#2a2a2a] text-white hover:bg-red-500/20"
                  >
                    <X className="size-3.5 text-red-400" />
                    <span>Reject Draft</span>
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  onClick={() => setConfirmMode("accept")}
                  disabled={isPromoting}
                  className="gap-1.5 text-white font-semibold"
                >
                  <Check className="size-3.5" />
                  <span>
                    {userSubmissionDraft
                      ? selectedVaultOption === "user"
                        ? "Save My Attempt to Vault"
                        : "Save AI Solution to Vault"
                      : "Save to Vault"}
                  </span>
                </Button>
              </div>
            )}
          </div>

          {/* Confirmation Banner for Accept / Reject */}
          {confirmMode === "accept" && (
            <div className="rounded-lg border border-primary/40 bg-[#2a2a2a] p-4 space-y-3 text-white">
              <div className="flex items-start gap-2">
                <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-white">
                    Confirm Knowledge Promotion
                  </p>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    This will save{" "}
                    <strong className="text-white">
                      {selectedVaultOption === "user"
                        ? "Your Attempt & AI Analytics (with your submission code)"
                        : "AI Suggested Solution (with AI optimized code)"}
                    </strong>{" "}
                    into your permanent Knowledge playbook.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setConfirmMode(null)}
                  disabled={isPromoting}
                  className="border-[#555555] bg-[#333333] text-white hover:bg-[#444444]"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="xs"
                  onClick={handleConfirmAccept}
                  disabled={isPromoting}
                  className="gap-1 text-white font-semibold"
                >
                  <Check className="size-3" />
                  <span>{isPromoting ? "Saving..." : "Confirm & Save"}</span>
                </Button>
              </div>
            </div>
          )}

          {confirmMode === "reject" && (
            <div className="rounded-lg border border-red-500/40 bg-[#2a2a2a] p-4 space-y-3 text-white">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 text-red-400 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-white">
                    Confirm Rejection
                  </p>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    Mark this draft as rejected? It will remain in your analysis
                    history but will not create permanent knowledge.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setConfirmMode(null)}
                  disabled={isPromoting}
                  className="border-[#555555] bg-[#333333] text-white hover:bg-[#444444]"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="xs"
                  onClick={async () => {
                    await onReject();
                    setConfirmMode(null);
                  }}
                  disabled={isPromoting}
                  className="gap-1 text-white"
                >
                  <X className="size-3" />
                  <span>{isPromoting ? "Rejecting..." : "Confirm Reject"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* ── Candidate Approach ──────────────────────────── */}
          <div className="rounded-xl border border-[#4a4a4a] border-l-4 border-l-primary bg-[#2a2a2a] p-5 sm:p-6 space-y-5 text-white shadow-2xs">
            {/* Header & Complexity Chips */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#383838] pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Suggested Approach
                </span>
                <h5 className="text-xl sm:text-2xl font-bold text-zinc-100 mt-0.5">
                  {approach.name}
                </h5>
              </div>
              {(approach.timeComplexity || approach.spaceComplexity) && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {approach.timeComplexity && (
                    <div className="flex items-center gap-1.5 rounded-md border border-[#4a4a4a] bg-[#1e1e1e] px-2.5 py-1 text-white">
                      <Clock className="size-4 text-sky-400" />
                      <span className="text-zinc-300">Time:</span>
                      <span className="font-mono font-semibold text-white">
                        {approach.timeComplexity}
                      </span>
                    </div>
                  )}
                  {approach.spaceComplexity && (
                    <div className="flex items-center gap-1.5 rounded-md border border-[#4a4a4a] bg-[#1e1e1e] px-2.5 py-1 text-white">
                      <HardDrive className="size-4 text-purple-400" />
                      <span className="text-zinc-300">Space:</span>
                      <span className="font-mono font-semibold text-white">
                        {approach.spaceComplexity}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Core Idea Card */}
            {approach.coreIdea && (
              <div className="rounded-xl border border-[#4a4a4a] bg-[#222222] p-5 text-white shadow-2xs">
                <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-amber-400">
                  <Lightbulb className="size-5.5 text-amber-400 shrink-0" />
                  <span>Core Idea</span>
                </div>
                <p className="mt-2 text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                  {formatText(approach.coreIdea)}
                </p>
              </div>
            )}

            {/* Why It Works & When To Use Cards */}
            {hasMechanics && (
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                {approach.whyItWorks && (
                  <div className="rounded-xl border border-[#4a4a4a] bg-[#222222] p-5 text-white shadow-2xs">
                    <div className="flex items-center gap-2.5 text-base font-bold text-zinc-100 mb-2.5">
                      <Compass className="size-5 text-sky-400 shrink-0" />
                      <span>Why It Works</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                      {formatText(approach.whyItWorks)}
                    </p>
                  </div>
                )}
                {approach.whenToUse && (
                  <div className="rounded-xl border border-[#4a4a4a] bg-[#222222] p-5 text-white shadow-2xs">
                    <div className="flex items-center gap-2.5 text-base font-bold text-zinc-100 mb-2.5">
                      <Compass className="size-5 text-purple-400 shrink-0" />
                      <span>When To Use</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                      {formatText(approach.whenToUse)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pros & Cons Cards */}
            {hasTradeoffs && (
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                {approach.pros && (
                  <div className="rounded-xl border border-emerald-500/30 bg-[#222222] p-5 text-white shadow-2xs">
                    <div className="flex items-center gap-2.5 text-base font-bold text-emerald-400 mb-2.5">
                      <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                      <span>Pros & Advantages</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                      {formatText(approach.pros)}
                    </p>
                  </div>
                )}
                {approach.cons && (
                  <div className="rounded-xl border border-rose-500/30 bg-[#222222] p-5 text-white shadow-2xs">
                    <div className="flex items-center gap-2.5 text-base font-bold text-rose-400 mb-2.5">
                      <AlertTriangle className="size-5 text-rose-400 shrink-0" />
                      <span>Cons & Limitations</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                      {formatText(approach.cons)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Common Pitfalls Card */}
            {approach.mistakes && (
              <div className="rounded-xl border border-amber-500/30 bg-[#222222] p-5 text-white shadow-2xs">
                <div className="flex items-center gap-2.5 text-base font-bold text-amber-400 mb-2.5">
                  <AlertTriangle className="size-5 text-amber-400 shrink-0" />
                  <span>Common Mistakes to Avoid</span>
                </div>
                <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                  {formatText(approach.mistakes)}
                </p>
              </div>
            )}

            {/* Additional Notes Card */}
            {approach.notes && (
              <div className="rounded-xl border border-[#4a4a4a] bg-[#222222] p-5 text-white shadow-2xs">
                <div className="flex items-center gap-2.5 text-base font-bold text-zinc-100 mb-2">
                  <FileText className="size-5 text-blue-400 shrink-0" />
                  <span>Additional Notes</span>
                </div>
                <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                  {formatText(approach.notes)}
                </p>
              </div>
            )}

            {/* ── Candidate Solution ─────────────────────────── */}
            <div className="mt-6 border-t border-[#383838] pt-5 space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Suggested Method
                </span>
                <h6 className="text-lg sm:text-xl font-bold text-zinc-100 mt-0.5">
                  {solution.name}
                </h6>
              </div>

              {solution.description && (
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                  {formatText(solution.description)}
                </p>
              )}

              {solution.algorithm && (
                <div className="rounded-xl border border-[#4a4a4a] bg-[#222222] p-5 text-white shadow-2xs">
                  <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-zinc-100 mb-2.5">
                    <ListOrdered className="size-5 text-amber-400 shrink-0" />
                    <span>Step-by-Step Guide</span>
                  </div>
                  <div className="rounded-lg bg-[#1a1a1a] border border-[#4a4a4a] p-4 text-zinc-300">
                    <p className="whitespace-pre-wrap font-mono text-xs sm:text-[14px] text-zinc-200 leading-relaxed">
                      {formatText(solution.algorithm)}
                    </p>
                  </div>
                </div>
              )}

              {solution.notes && (
                <div className="rounded-xl border border-[#4a4a4a] bg-[#222222] p-5 text-zinc-300 shadow-2xs">
                  <div className="flex items-center gap-2.5 text-base font-bold text-zinc-100 mb-2">
                    <FileText className="size-5 text-blue-400 shrink-0" />
                    <span>Method Notes</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                    {formatText(solution.notes)}
                  </p>
                </div>
              )}

              {/* ── Implementation Code (User vs AI) ─────────── */}
              <div className="mt-6 border-t border-[#383838] pt-5 space-y-3.5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-400">
                      {selectedVaultOption === "user"
                        ? "My Accepted Implementation"
                        : "Optimized Implementation"}
                    </span>
                    <p className="text-xs sm:text-sm text-zinc-300 mt-0.5">
                      {selectedVaultOption === "user"
                        ? "Your actual code submitted on LeetCode for this attempt"
                        : "AI-suggested optimized code — not saved"}
                    </p>
                  </div>

                  {userSubmissionDraft && (
                    <div
                      role="tablist"
                      aria-label="Code Source"
                      className="flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] p-1 border border-[#4a4a4a] self-start sm:self-auto"
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={selectedVaultOption === "user"}
                        onClick={() => setSelectedVaultOption("user")}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                          selectedVaultOption === "user"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <CheckCircle2 className="size-3.5 text-emerald-400" />
                        <span>My Accepted Code</span>
                      </button>

                      <button
                        type="button"
                        role="tab"
                        aria-selected={selectedVaultOption === "ai"}
                        onClick={() => setSelectedVaultOption("ai")}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                          selectedVaultOption === "ai"
                            ? "bg-primary/20 text-white border border-primary/40 shadow-xs"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Sparkles className="size-3.5 text-primary" />
                        <span>AI Suggested Code</span>
                      </button>
                    </div>
                  )}
                </div>

                <CodeViewer
                  code={code.code}
                  language={code.language}
                  badge={
                    selectedVaultOption === "user"
                      ? "My Accepted Attempt"
                      : "AI Suggested Implementation"
                  }
                />

                {code.notes && (
                  <div className="rounded-xl border border-[#4a4a4a] bg-[#222222] p-4 text-xs sm:text-sm text-zinc-300 shadow-2xs">
                    <span className="font-semibold text-zinc-200">
                      Code Notes:{" "}
                    </span>
                    <span className="text-zinc-300">{formatText(code.notes)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
