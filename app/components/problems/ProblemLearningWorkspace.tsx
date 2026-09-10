"use client";

import { useState } from "react";
import { History, Sparkles, BookOpen, AlertCircle } from "lucide-react";
import { SubmissionCard } from "./SubmissionCard";
import { SubmissionAnalysisContainer } from "./analysis/SubmissionAnalysisContainer";
import { KnowledgeWorkspace } from "./knowledge/KnowledgeWorkspace";
import type { KnowledgeApproach } from "./knowledge/types";
import type { SerializedSubmissionAnalysis } from "./analysis/types";

export interface WorkspaceSubmission {
  id: string;
  status: string;
  language: string;
  runtimeMs: number | null;
  memoryBytes: bigint | number | null;
  submittedAt: Date | string | null;
  code: string | null;
  analyses: SerializedSubmissionAnalysis[];
}

interface ProblemLearningWorkspaceProps {
  problemId: string;
  submissions: WorkspaceSubmission[];
  approaches: KnowledgeApproach[];
}

export function ProblemLearningWorkspace({
  problemId,
  submissions = [],
  approaches = [],
}: ProblemLearningWorkspaceProps) {
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(
    () => submissions[0]?.id ?? null,
  );

  // Derive the active selected submission (or default to the latest)
  const selectedSubmission =
    submissions.find((s) => s.id === selectedSubmissionId) ||
    submissions[0] ||
    null;

  return (
    <div className="space-y-12">
      {/* ══ 1. SUBMISSIONS SECTION ("What did I try?") ═══════════════ */}
      <section aria-labelledby="submissions-section-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2">
            <History className="size-4 text-primary shrink-0" />
            <h2
              id="submissions-section-heading"
              className="text-lg font-bold tracking-tight text-foreground"
            >
              Submissions
            </h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {submissions.length}
            </span>
          </div>

          <p className="text-xs text-muted-foreground hidden sm:block">
            Select an attempt to evaluate with AI
          </p>
        </div>

        {submissions.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center bg-muted/10">
            <p className="text-sm font-medium text-foreground">
              No submissions recorded yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Solve this problem on LeetCode with the extension active to sync your attempts.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {submissions.map((submission) => (
              <SubmissionCard
                key={submission.id}
                id={submission.id}
                status={submission.status}
                language={submission.language}
                runtimeMs={submission.runtimeMs}
                memoryBytes={submission.memoryBytes}
                submittedAt={submission.submittedAt}
                code={submission.code}
                analyses={submission.analyses}
                isSelected={submission.id === selectedSubmission?.id}
                onSelect={() => setSelectedSubmissionId(submission.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ══ 2. AI ANALYSIS SECTION ("What happened and why?") ══════════ */}
      <section aria-labelledby="analysis-section-heading" className="space-y-4">
        <div className="border-b pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary shrink-0" />
            <h2
              id="analysis-section-heading"
              className="text-lg font-bold tracking-tight text-foreground"
            >
              AI Diagnostic Review
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Code-specific complexity explanations, mistakes, takeaways, and candidate knowledge drafts.
          </p>
        </div>

        {submissions.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center bg-muted/10">
            <AlertCircle className="size-6 text-muted-foreground mx-auto mb-2 opacity-60" />
            <p className="text-xs text-muted-foreground">
              No submissions available to analyze. Record or sync an attempt first.
            </p>
          </div>
        ) : selectedSubmission ? (
          <div className="space-y-3">
            {/* Active attempt context pill */}
            <div className="flex items-center justify-between rounded-md bg-muted/40 border px-3 py-1.5 text-xs text-muted-foreground">
              <span>
                Evaluating attempt:{" "}
                <strong className="text-foreground">
                  {selectedSubmission.status.replaceAll("_", " ")}
                </strong>{" "}
                ({selectedSubmission.language}
                {selectedSubmission.runtimeMs != null
                  ? ` · ${selectedSubmission.runtimeMs} ms`
                  : ""}
                )
              </span>
              <span className="text-[11px] font-mono">
                #{selectedSubmission.id.slice(-6)}
              </span>
            </div>

            <SubmissionAnalysisContainer
              key={selectedSubmission.id}
              submissionId={selectedSubmission.id}
              initialAnalyses={selectedSubmission.analyses}
            />
          </div>
        ) : (
          <div className="rounded-lg border p-6 text-center text-xs text-muted-foreground">
            Select a submission above to review its AI analysis.
          </div>
        )}
      </section>

      {/* ══ 3. PERMANENT KNOWLEDGE SECTION ("What should I remember?") ══ */}
      <section aria-labelledby="knowledge-section-heading" className="space-y-4">
        <div className="border-b pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-primary shrink-0" />
            <h2
              id="knowledge-section-heading"
              className="text-lg font-bold tracking-tight text-foreground"
            >
              Permanent Knowledge
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Approaches, algorithmic invariants, and canonical implementations in your personal playbook.
          </p>
        </div>

        <KnowledgeWorkspace
          problemId={problemId}
          approaches={approaches}
        />
      </section>
    </div>
  );
}
