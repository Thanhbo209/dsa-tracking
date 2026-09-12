"use client";

import { useState, useMemo } from "react";
import * as React from "react";
import type { AiDraft, AiReview, AiRecommendation } from "@/lib/validation/analysis";
import type { AnalysisStatus } from "./types";
import { DraftEditForm } from "./DraftEditForm";
import { Button } from "@/components/ui/button";
import { DsaLogo } from "@/components/brand/DsaLogo";
import {
  BookOpen,
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
  Sparkles,
  Info,
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
  draft: (AiRecommendation & Partial<AiDraft>) | AiDraft | null;
  review?: AiReview | null;
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
  const [editingTarget, setEditingTarget] = useState<"user" | "ai" | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<"user" | "ai" | null>(null);
  const [confirmAction, setConfirmAction] = useState<"accept" | "reject" | null>(null);

  const hasUserCode = Boolean(submissionCode && submissionCode.trim().length > 0);
  const isSubmissionAccepted = submissionStatus === "ACCEPTED";
  const hasActualApproach = Boolean(review?.actualApproach?.name);

  // ── 1. Synthesize User's Actual Approach Draft ──────────────────────────────
  const userApproachDraft = useMemo<AiDraft | null>(() => {
    if (!hasUserCode || !submissionCode) return null;

    // Derived directly from the user's actual approach identified by AI
    const approachName = review?.actualApproach?.name || "Historical Submission Attempt";
    const coreIdeaText = review?.actualApproach?.coreIdea || review?.summary || "Implementation analyzed from submission code.";
    const whyItWorksText =
      review?.actualApproach?.explanation ||
      review?.timeComplexity?.explanation ||
      coreIdeaText;
    const whenToUseText =
      review?.conceptGaps && review.conceptGaps.length > 0
        ? `Best applied when solving problems requiring: ${review.conceptGaps.join(", ")}.`
        : "General problem-solving approach applicable to this problem type.";

    const timeComp = review?.timeComplexity?.value?.trim() || "O(n)";
    const spaceComp = review?.spaceComplexity?.value?.trim() || "O(1)";

    const prosText =
      review?.strengths && review.strengths.length > 0
        ? review.strengths.map((s) => `• ${s}`).join("\n")
        : "Implemented and evaluated on LeetCode.";

    const consList = [
      ...(review?.mistakes || []),
      ...(review?.improvementSuggestions || []),
    ];
    const consText =
      consList.length > 0
        ? consList.map((c) => `• ${c}`).join("\n")
        : "No major bottlenecks identified.";

    const mistakesText =
      review?.mistakes && review.mistakes.length > 0
        ? review.mistakes.map((m) => `• ${m}`).join("\n")
        : review?.missedEdgeCases && review.missedEdgeCases.length > 0
          ? review.missedEdgeCases.map((e) => `• Edge Case: ${e}`).join("\n")
          : "";

    const takeawaysText =
      review?.learningTakeaways && review.learningTakeaways.length > 0
        ? review.learningTakeaways.map((t) => `• ${t}`).join("\n")
        : "";

    const solutionName =
      review?.actualSolution?.name ||
      (isSubmissionAccepted ? "My Accepted Solution" : "My Submission Attempt");

    const solutionDescription =
      review?.actualSolution?.description || review?.summary || "Implementation analyzed from submission code.";

    const algorithmText =
      review?.actualSolution?.algorithm ||
      (review?.timeComplexity?.reasoning && review.timeComplexity.reasoning.length > 0
        ? review.timeComplexity.reasoning.map((step, idx) => `${idx + 1}. ${step}`).join("\n")
        : "1. Implemented according to submission logic.");

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
        name: solutionName,
        description: solutionDescription,
        algorithm: algorithmText,
        notes: runtimeMs ? `Executed on LeetCode with runtime ${runtimeMs}ms.` : "",
      },
      code: {
        language: submissionLanguage || "code",
        code: submissionCode,
        notes: isSubmissionAccepted
          ? `Actual accepted submission code (${submissionLanguage || "code"}${runtimeMs ? `, ${runtimeMs}ms` : ""}).`
          : `Actual submission code (${submissionLanguage || "code"}).`,
      },
    };
  }, [
    hasUserCode,
    submissionCode,
    review,
    isSubmissionAccepted,
    runtimeMs,
    submissionLanguage,
  ]);

  // ── 2. Derive AI Recommendation Draft (if available) ────────────────────────
  const { isRecommendationAvailable, recommendationReason, aiRecommendationDraft } =
    useMemo(() => {
      if (!draft || typeof draft !== "object") {
        return {
          isRecommendationAvailable: false,
          recommendationReason: undefined,
          aiRecommendationDraft: null,
        };
      }

      // Check for new schema: { available: boolean, reason?: string, approach?, solution?, code? }
      if ("available" in draft) {
        const isAvail = draft.available === true && Boolean(draft.approach?.name);
        return {
          isRecommendationAvailable: isAvail,
          recommendationReason: draft.reason,
          aiRecommendationDraft: isAvail
            ? ({
                approach: draft.approach!,
                solution: draft.solution!,
                code: draft.code!,
              } as AiDraft)
            : null,
        };
      }

      // Legacy fallback: draft is { approach, solution, code }
      const legacyDraft = draft as AiDraft;
      if (legacyDraft.approach?.name) {
        return {
          isRecommendationAvailable: true,
          recommendationReason: "Recommended canonical approach from historical analysis.",
          aiRecommendationDraft: legacyDraft,
        };
      }

      return {
        isRecommendationAvailable: false,
        recommendationReason: undefined,
        aiRecommendationDraft: null,
      };
    }, [draft]);

  async function handleConfirmAccept(target: "user" | "ai") {
    const targetDraft = target === "user" ? userApproachDraft : aiRecommendationDraft;
    if (!targetDraft) return;
    await onAccept(targetDraft);
    setConfirmTarget(null);
    setConfirmAction(null);
  }

  // ── Render Edit Form if editing ───────────────────────────────────────────
  if (editingTarget !== null) {
    const draftToEdit = editingTarget === "user" ? userApproachDraft : aiRecommendationDraft;
    if (draftToEdit) {
      return (
        <div className="pt-6 border-t border-[#444444]">
          <DraftEditForm
            initialDraft={draftToEdit}
            onSave={async (editedDraft) => {
              await onAccept(editedDraft);
              setEditingTarget(null);
            }}
            onCancel={() => setEditingTarget(null)}
            isSaving={isPromoting}
            submissionCode={submissionCode}
            submissionLanguage={submissionLanguage}
          />
        </div>
      );
    }
  }

  return (
    <div className="space-y-8 text-white">
      {/* ── Status Banner ─────────────────────────────────── */}
      {status === "ACCEPTED" ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/40 bg-green-500/20 px-3.5 py-2.5 text-xs text-white">
          <CheckCircle2 className="size-4 shrink-0 text-green-400" />
          <span className="font-semibold">
            Knowledge Vault Active — You can save your approach or the AI recommendation anytime into your knowledge base.
          </span>
        </div>
      ) : status === "REJECTED" ? (
        <div className="flex items-center gap-2 rounded-lg border border-zinc-500/40 bg-[#2a2a2a] px-3.5 py-2.5 text-xs text-white">
          <XCircle className="size-4 shrink-0 text-zinc-400" />
          <span>
            Draft Rejected — This draft was rejected and not saved to your knowledge base.
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/20 px-3.5 py-2.5 text-xs text-white">
          <DsaLogo size="xs" className="h-4 w-auto shrink-0" />
          <span className="font-medium">
            AI-generated analysis — not saved to your knowledge base
          </span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1: MY APPROACH (Derived strictly from user's submitted code)
         ═══════════════════════════════════════════════════════════════════════ */}
      {userApproachDraft && (
        <div className="rounded-xl border border-[#4a4a4a] bg-[#373737] p-5 sm:p-6 space-y-6 shadow-2xs">
          {/* Header Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#4a4a4a] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  My Approach
                </span>
                {/* Standalone status badge — isolated peer element, never concatenated! */}
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                    isSubmissionAccepted
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {isSubmissionAccepted ? "Accepted Attempt" : "Attempt"}
                </span>
              </div>

              {/* Approach name rendered ONCE directly from actualApproach.name */}
              <h4 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {userApproachDraft.approach.name}
              </h4>

              {/* Legacy notice if actualApproach was missing */}
              {!hasActualApproach && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-400">
                  <Info className="size-3.5 shrink-0" />
                  <span>
                    Legacy record: Click &quot;Re-analyze&quot; above to classify your specific algorithmic paradigm.
                  </span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            {status !== "REJECTED" && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTarget("user")}
                  disabled={isPromoting}
                  className="gap-1.5 border-[#555555] bg-[#2a2a2a] text-white hover:bg-[#333333]"
                >
                  <Edit3 className="size-3.5 text-white" />
                  <span>Edit Draft</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setConfirmTarget("user");
                    setConfirmAction("accept");
                  }}
                  disabled={isPromoting}
                  className="gap-1.5 text-white font-semibold"
                >
                  <Check className="size-3.5" />
                  <span>Save My Approach to Vault</span>
                </Button>
              </div>
            )}
          </div>

          {/* Confirmation Banner for Saving My Approach */}
          {confirmTarget === "user" && confirmAction === "accept" && (
            <div className="rounded-lg border border-primary/40 bg-[#2a2a2a] p-4 space-y-3 text-white">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-white">
                    Confirm Saving My Approach
                  </p>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    This will save your implementation of{" "}
                    <strong className="text-white">
                      &quot;{userApproachDraft.approach.name}&quot;
                    </strong>{" "}
                    with your actual submitted code into your permanent Knowledge Vault.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    setConfirmTarget(null);
                    setConfirmAction(null);
                  }}
                  disabled={isPromoting}
                  className="border-[#555555] bg-[#333333] text-white hover:bg-[#444444]"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="xs"
                  onClick={() => handleConfirmAccept("user")}
                  disabled={isPromoting}
                  className="gap-1 text-white font-semibold"
                >
                  <Check className="size-3" />
                  <span>{isPromoting ? "Saving..." : "Confirm & Save"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Complexity Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {userApproachDraft.approach.timeComplexity && (
              <div className="flex items-center gap-1.5 rounded-md border border-[#4a4a4a] bg-[#2a2a2a] px-2.5 py-1 text-white">
                <Clock className="size-4 text-sky-400" />
                <span className="text-zinc-300">Time:</span>
                <span className="font-mono font-semibold text-white">
                  {userApproachDraft.approach.timeComplexity}
                </span>
              </div>
            )}
            {userApproachDraft.approach.spaceComplexity && (
              <div className="flex items-center gap-1.5 rounded-md border border-[#4a4a4a] bg-[#2a2a2a] px-2.5 py-1 text-white">
                <HardDrive className="size-4 text-purple-400" />
                <span className="text-zinc-300">Space:</span>
                <span className="font-mono font-semibold text-white">
                  {userApproachDraft.approach.spaceComplexity}
                </span>
              </div>
            )}
          </div>

          {/* Core Idea Card */}
          {userApproachDraft.approach.coreIdea && (
            <div className="rounded-xl border border-[#4a4a4a] bg-[#222222] p-5 text-white shadow-2xs">
              <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-amber-400">
                <Lightbulb className="size-5 text-amber-400 shrink-0" />
                <span>Core Idea</span>
              </div>
              <p className="mt-2 text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                {formatText(userApproachDraft.approach.coreIdea)}
              </p>
            </div>
          )}

          {/* Why It Works & When To Use */}
          {(userApproachDraft.approach.whyItWorks || userApproachDraft.approach.whenToUse) && (
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              {userApproachDraft.approach.whyItWorks && (
                <div className="rounded-xl border border-[#4a4a4a] bg-[#222222] p-5 text-white shadow-2xs">
                  <div className="flex items-center gap-2.5 text-base font-bold text-zinc-100 mb-2.5">
                    <Compass className="size-5 text-sky-400 shrink-0" />
                    <span>How It Realizes Strategy</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                    {formatText(userApproachDraft.approach.whyItWorks)}
                  </p>
                </div>
              )}
              {userApproachDraft.approach.whenToUse && (
                <div className="rounded-xl border border-[#4a4a4a] bg-[#222222] p-5 text-white shadow-2xs">
                  <div className="flex items-center gap-2.5 text-base font-bold text-zinc-100 mb-2.5">
                    <Compass className="size-5 text-purple-400 shrink-0" />
                    <span>When To Use</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                    {formatText(userApproachDraft.approach.whenToUse)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step-by-Step Algorithm */}
          {userApproachDraft.solution.algorithm && (
            <div className="rounded-xl border border-[#4a4a4a] bg-[#222222] p-5 text-white shadow-2xs">
              <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-zinc-100 mb-2.5">
                <ListOrdered className="size-5 text-amber-400 shrink-0" />
                <span>
                  Method: {userApproachDraft.solution.name}
                </span>
              </div>
              <div className="rounded-lg bg-[#1a1a1a] border border-[#4a4a4a] p-4 text-zinc-300">
                <p className="whitespace-pre-wrap font-mono text-xs sm:text-[14px] text-zinc-200 leading-relaxed">
                  {formatText(userApproachDraft.solution.algorithm)}
                </p>
              </div>
            </div>
          )}

          {/* Trade-offs (Pros & Cons) */}
          {(userApproachDraft.approach.pros || userApproachDraft.approach.cons) && (
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              {userApproachDraft.approach.pros && (
                <div className="rounded-xl border border-emerald-500/30 bg-[#222222] p-5 text-white shadow-2xs">
                  <div className="flex items-center gap-2.5 text-base font-bold text-emerald-400 mb-2.5">
                    <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                    <span>Strengths</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                    {formatText(userApproachDraft.approach.pros)}
                  </p>
                </div>
              )}
              {userApproachDraft.approach.cons && (
                <div className="rounded-xl border border-rose-500/30 bg-[#222222] p-5 text-white shadow-2xs">
                  <div className="flex items-center gap-2.5 text-base font-bold text-rose-400 mb-2.5">
                    <AlertTriangle className="size-5 text-rose-400 shrink-0" />
                    <span>Bottlenecks & Limitations</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                    {formatText(userApproachDraft.approach.cons)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* User's Actual Implementation Code */}
          <div className="border-t border-[#383838] pt-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-400">
                  Actual Submitted Code
                </span>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Your actual code evaluated on LeetCode
                </p>
              </div>
            </div>

            <CodeViewer
              code={userApproachDraft.code.code}
              language={userApproachDraft.code.language}
              badge="My Submission"
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2: AI RECOMMENDATION (Rendered when available or optimal note)
         ═══════════════════════════════════════════════════════════════════════ */}
      {isRecommendationAvailable && aiRecommendationDraft ? (
        <div className="rounded-xl border border-primary/40 bg-[#2a2a2a] p-5 sm:p-6 space-y-6 shadow-2xs">
          {/* Header Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#444444] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  AI Recommendation
                </span>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                  Alternative / Optimization
                </span>
              </div>

              <h4 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {aiRecommendationDraft.approach.name}
              </h4>

              {recommendationReason && (
                <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                  {recommendationReason}
                </p>
              )}
            </div>

            {/* Action Bar */}
            {status !== "REJECTED" && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTarget("ai")}
                  disabled={isPromoting}
                  className="gap-1.5 border-[#555555] bg-[#222222] text-white hover:bg-[#333333]"
                >
                  <Edit3 className="size-3.5 text-white" />
                  <span>Edit Draft</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setConfirmTarget("ai");
                    setConfirmAction("accept");
                  }}
                  disabled={isPromoting}
                  className="gap-1.5 bg-primary text-white font-semibold hover:bg-primary/90"
                >
                  <Check className="size-3.5" />
                  <span>Save Recommendation to Vault</span>
                </Button>
              </div>
            )}
          </div>

          {/* Confirmation Banner for Saving AI Recommendation */}
          {confirmTarget === "ai" && confirmAction === "accept" && (
            <div className="rounded-lg border border-primary/40 bg-[#1e1e1e] p-4 space-y-3 text-white">
              <div className="flex items-start gap-2">
                <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-white">
                    Confirm Saving AI Recommendation
                  </p>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    This will save the AI-recommended approach{" "}
                    <strong className="text-white">
                      &quot;{aiRecommendationDraft.approach.name}&quot;
                    </strong>{" "}
                    with its optimized canonical code into your Knowledge Vault as a separate entry.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    setConfirmTarget(null);
                    setConfirmAction(null);
                  }}
                  disabled={isPromoting}
                  className="border-[#555555] bg-[#333333] text-white hover:bg-[#444444]"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="xs"
                  onClick={() => handleConfirmAccept("ai")}
                  disabled={isPromoting}
                  className="gap-1 bg-primary text-white font-semibold hover:bg-primary/90"
                >
                  <Check className="size-3" />
                  <span>{isPromoting ? "Saving..." : "Confirm & Save"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Complexity Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {aiRecommendationDraft.approach.timeComplexity && (
              <div className="flex items-center gap-1.5 rounded-md border border-[#4a4a4a] bg-[#1e1e1e] px-2.5 py-1 text-white">
                <Clock className="size-4 text-sky-400" />
                <span className="text-zinc-300">Time:</span>
                <span className="font-mono font-semibold text-white">
                  {aiRecommendationDraft.approach.timeComplexity}
                </span>
              </div>
            )}
            {aiRecommendationDraft.approach.spaceComplexity && (
              <div className="flex items-center gap-1.5 rounded-md border border-[#4a4a4a] bg-[#1e1e1e] px-2.5 py-1 text-white">
                <HardDrive className="size-4 text-purple-400" />
                <span className="text-zinc-300">Space:</span>
                <span className="font-mono font-semibold text-white">
                  {aiRecommendationDraft.approach.spaceComplexity}
                </span>
              </div>
            )}
          </div>

          {/* Core Idea Card */}
          {aiRecommendationDraft.approach.coreIdea && (
            <div className="rounded-xl border border-[#4a4a4a] bg-[#1e1e1e] p-5 text-white shadow-2xs">
              <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-amber-400">
                <Lightbulb className="size-5 text-amber-400 shrink-0" />
                <span>Core Idea</span>
              </div>
              <p className="mt-2 text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                {formatText(aiRecommendationDraft.approach.coreIdea)}
              </p>
            </div>
          )}

          {/* Why It Works & When To Use */}
          {(aiRecommendationDraft.approach.whyItWorks || aiRecommendationDraft.approach.whenToUse) && (
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              {aiRecommendationDraft.approach.whyItWorks && (
                <div className="rounded-xl border border-[#4a4a4a] bg-[#1e1e1e] p-5 text-white shadow-2xs">
                  <div className="flex items-center gap-2.5 text-base font-bold text-zinc-100 mb-2.5">
                    <Compass className="size-5 text-sky-400 shrink-0" />
                    <span>Why It Works</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                    {formatText(aiRecommendationDraft.approach.whyItWorks)}
                  </p>
                </div>
              )}
              {aiRecommendationDraft.approach.whenToUse && (
                <div className="rounded-xl border border-[#4a4a4a] bg-[#1e1e1e] p-5 text-white shadow-2xs">
                  <div className="flex items-center gap-2.5 text-base font-bold text-zinc-100 mb-2.5">
                    <Compass className="size-5 text-purple-400 shrink-0" />
                    <span>When To Use</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
                    {formatText(aiRecommendationDraft.approach.whenToUse)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Algorithm */}
          {aiRecommendationDraft.solution.algorithm && (
            <div className="rounded-xl border border-[#4a4a4a] bg-[#1e1e1e] p-5 text-white shadow-2xs">
              <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-zinc-100 mb-2.5">
                <ListOrdered className="size-5 text-amber-400 shrink-0" />
                <span>
                  Method: {aiRecommendationDraft.solution.name}
                </span>
              </div>
              <div className="rounded-lg bg-[#141414] border border-[#4a4a4a] p-4 text-zinc-300">
                <p className="whitespace-pre-wrap font-mono text-xs sm:text-[14px] text-zinc-200 leading-relaxed">
                  {formatText(aiRecommendationDraft.solution.algorithm)}
                </p>
              </div>
            </div>
          )}

          {/* Canonical Code */}
          <div className="border-t border-[#444444] pt-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-400">
                  Recommended Canonical Implementation
                </span>
                <p className="text-xs text-zinc-400 mt-0.5">
                  AI-provided reference implementation
                </p>
              </div>
            </div>

            <CodeViewer
              code={aiRecommendationDraft.code.code}
              language={aiRecommendationDraft.code.language}
              badge="AI Recommended"
            />
          </div>
        </div>
      ) : recommendationReason ? (
        /* Optimal feedback when no recommendation is necessary */
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-white shadow-2xs flex items-start gap-3">
          <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-sm font-bold text-emerald-300">
              Optimal Approach Confirmed
            </h5>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {recommendationReason}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
