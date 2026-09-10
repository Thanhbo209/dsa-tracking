"use client";

import { useState } from "react";
import type { AiDraft } from "@/lib/validation/analysis";
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
} from "lucide-react";

interface KnowledgeDraftSectionProps {
  draft: AiDraft;
  status: AnalysisStatus;
  onAccept: (editedDraft?: AiDraft) => Promise<void>;
  onReject: () => Promise<void>;
  isPromoting: boolean;
}

export function KnowledgeDraftSection({
  draft,
  status,
  onAccept,
  onReject,
  isPromoting,
}: KnowledgeDraftSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmMode, setConfirmMode] = useState<"accept" | "reject" | null>(
    null,
  );

  const { approach, solution, code } = draft;

  if (isEditing) {
    return (
      <div className="pt-6 border-t">
        <DraftEditForm
          initialDraft={draft}
          onSave={async (editedDraft) => {
            await onAccept(editedDraft);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
          isSaving={isPromoting}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-6 border-t">
      {/* ── Status Banner ─────────────────────────────────── */}
      {status === "ACCEPTED" ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3.5 py-2.5 text-xs text-green-800 dark:text-green-300">
          <CheckCircle2 className="size-4 shrink-0 text-green-600 dark:text-green-400" />
          <span className="font-semibold">
            Saved to Knowledge — Approach, Solution, and Code have been added
            to Your Knowledge.
          </span>
        </div>
      ) : status === "REJECTED" ? (
        <div className="flex items-center gap-2 rounded-lg border border-zinc-500/30 bg-zinc-500/10 px-3.5 py-2.5 text-xs text-muted-foreground">
          <XCircle className="size-4 shrink-0 text-zinc-500" />
          <span>
            Draft Rejected — This draft was rejected and not saved to your
            knowledge base.
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-800 dark:text-amber-300">
          <Sparkles className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="font-medium">
            AI-generated draft — not saved to your knowledge base
          </span>
        </div>
      )}

      {/* ── Knowledge Model Display ───────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              Proposed Knowledge Model
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Structured candidate knowledge extracted from this submission.
            </p>
          </div>

          {/* Action Bar (only when DRAFT_READY) */}
          {status === "DRAFT_READY" && !confirmMode && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={isPromoting}
                className="gap-1.5"
              >
                <Edit3 className="size-3.5" />
                <span>Edit Draft</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirmMode("reject")}
                disabled={isPromoting}
                className="gap-1.5 border-zinc-500/30 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-500/10"
              >
                <X className="size-3.5" />
                <span>Reject Draft</span>
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => setConfirmMode("accept")}
                disabled={isPromoting}
                className="gap-1.5"
              >
                <Check className="size-3.5" />
                <span>Accept Draft</span>
              </Button>
            </div>
          )}
        </div>

        {/* Confirmation Banner for Accept / Reject */}
        {confirmMode === "accept" && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Confirm Knowledge Promotion
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This will save this draft as permanent knowledge for this
                  problem (creating an Approach, Solution, and Code in your
                  Knowledge Hierarchy).
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
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="xs"
                onClick={async () => {
                  await onAccept();
                  setConfirmMode(null);
                }}
                disabled={isPromoting}
                className="gap-1"
              >
                <Check className="size-3" />
                <span>{isPromoting ? "Saving..." : "Confirm & Save"}</span>
              </Button>
            </div>
          </div>
        )}

        {confirmMode === "reject" && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Confirm Rejection
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
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
                className="gap-1"
              >
                <X className="size-3" />
                <span>{isPromoting ? "Rejecting..." : "Confirm Reject"}</span>
              </Button>
            </div>
          </div>
        )}

        {/* ── Candidate Approach ──────────────────────────── */}
        <div className="rounded-lg border border-l-4 border-l-primary/60 bg-card p-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Candidate Approach
              </span>
              <h5 className="text-base font-bold text-foreground mt-0.5">
                {approach.name}
              </h5>
            </div>
            <div className="shrink-0 text-right text-xs font-mono text-muted-foreground">
              {approach.timeComplexity && <p>Time: {approach.timeComplexity}</p>}
              {approach.spaceComplexity && <p>Space: {approach.spaceComplexity}</p>}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            {approach.coreIdea && (
              <div className="sm:col-span-2">
                <span className="font-semibold text-foreground">Core Idea: </span>
                <span className="text-muted-foreground">{approach.coreIdea}</span>
              </div>
            )}
            {approach.whyItWorks && (
              <div>
                <span className="font-semibold text-foreground">Why It Works: </span>
                <span className="text-muted-foreground">{approach.whyItWorks}</span>
              </div>
            )}
            {approach.whenToUse && (
              <div>
                <span className="font-semibold text-foreground">When To Use: </span>
                <span className="text-muted-foreground">{approach.whenToUse}</span>
              </div>
            )}
            {approach.pros && (
              <div>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  Pros:{" "}
                </span>
                <span className="text-muted-foreground">{approach.pros}</span>
              </div>
            )}
            {approach.cons && (
              <div>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  Cons:{" "}
                </span>
                <span className="text-muted-foreground">{approach.cons}</span>
              </div>
            )}
            {approach.mistakes && (
              <div className="sm:col-span-2 flex items-start gap-1.5 text-amber-700 dark:text-amber-400">
                <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                <span>
                  <strong>Common Pitfalls:</strong> {approach.mistakes}
                </span>
              </div>
            )}
            {approach.notes && (
              <div className="sm:col-span-2 text-muted-foreground">
                <span className="font-semibold text-foreground">Notes: </span>
                <span>{approach.notes}</span>
              </div>
            )}
          </div>

          {/* ── Candidate Solution ─────────────────────────── */}
          <div className="mt-3 border-t pt-3 space-y-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Candidate Solution
              </span>
              <h6 className="text-sm font-semibold text-foreground mt-0.5">
                {solution.name}
              </h6>
            </div>

            {solution.description && (
              <p className="text-xs text-muted-foreground">{solution.description}</p>
            )}

            {solution.algorithm && (
              <div className="rounded bg-muted/40 p-2.5 text-xs">
                <p className="font-semibold text-foreground mb-1">Algorithm Steps:</p>
                <p className="whitespace-pre-wrap font-mono text-[11px] text-muted-foreground leading-relaxed">
                  {solution.algorithm}
                </p>
              </div>
            )}

            {solution.notes && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Notes: </span>
                {solution.notes}
              </p>
            )}

            {/* ── Candidate Code ───────────────────────────── */}
            <div className="mt-3 border-t pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Candidate Canonical Code
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Generated knowledge draft — not saved
                  </p>
                </div>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary uppercase">
                  {code.language}
                </span>
              </div>

              <div className="rounded-md border border-primary/20 bg-muted/20">
                <pre className="overflow-x-auto p-3.5 text-xs font-mono text-foreground leading-relaxed">
                  <code>{code.code}</code>
                </pre>
              </div>

              {code.notes && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Code Notes: </span>
                  {code.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
