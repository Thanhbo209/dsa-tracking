"use client";

import { useState } from "react";
import { History, Sparkles, BookOpen, AlertCircle, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
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

export type WorkspaceTab = "knowledge" | "analysis" | "submissions";

interface ProblemLearningWorkspaceProps {
  problemId: string;
  submissions?: WorkspaceSubmission[];
  approaches?: KnowledgeApproach[];
  defaultTab?: WorkspaceTab;
}

export function ProblemLearningWorkspace({
  problemId,
  submissions = [],
  approaches = [],
  defaultTab,
}: ProblemLearningWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(
    defaultTab ?? (approaches.length > 0 ? "knowledge" : "submissions"),
  );

  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(
    () => submissions[0]?.id ?? null,
  );

  // Derive the active selected submission (or default to the latest)
  const selectedSubmission =
    submissions.find((s) => s.id === selectedSubmissionId) ||
    submissions[0] ||
    null;

  return (
    <div className="space-y-6 text-white">
      {/* ══ LeetCode-Themed Tab Bar Navigation ═════════════════════════ */}
      <div
        role="tablist"
        aria-label="Learning workspace tabs"
        className="flex flex-wrap items-center gap-2 border-b border-[#383838] pb-3 text-sm sm:text-base font-sans select-none"
      >
        {/* Tab 1: Permanent Knowledge (yellow BookOpen like Editorial) */}
        <button
          type="button"
          role="tab"
          id="tab-knowledge"
          aria-selected={activeTab === "knowledge"}
          aria-controls="panel-knowledge"
          onClick={() => setActiveTab("knowledge")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors cursor-pointer text-sm sm:text-base",
            activeTab === "knowledge"
              ? "text-white font-bold bg-white/[0.08]"
              : "text-zinc-400 hover:text-zinc-200 font-medium hover:bg-white/[0.04]",
          )}
        >
          <BookOpen className="size-4.5 sm:size-5 text-[#eab308] shrink-0" />
          <span>Permanent Knowledge</span>
          {approaches.length > 0 && (
            <span className="text-xs sm:text-sm text-zinc-400">({approaches.length})</span>
          )}
        </button>

        <span className="text-zinc-600 select-none px-1 text-base font-light" aria-hidden="true">
          |
        </span>

        {/* Tab 2: AI Diagnostic Review (cyan Sparkles with attempt pill & dismiss) */}
        <button
          type="button"
          role="tab"
          id="tab-analysis"
          aria-selected={activeTab === "analysis"}
          aria-controls="panel-analysis"
          onClick={() => setActiveTab("analysis")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors cursor-pointer group text-sm sm:text-base",
            activeTab === "analysis"
              ? "text-white font-bold bg-white/[0.08]"
              : "text-zinc-400 hover:text-zinc-200 font-medium hover:bg-white/[0.04]",
          )}
        >
          <Sparkles className="size-4.5 sm:size-5 text-[#38bdf8] shrink-0" />
          <span>AI Diagnostic Review</span>
          {selectedSubmission && (
            <span className="text-xs sm:text-sm text-zinc-300 font-mono">
              ({selectedSubmission.status.replaceAll("_", " ")})
            </span>
          )}
          {activeTab === "analysis" && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab("submissions");
              }}
              className="ml-1 text-zinc-400 hover:text-white p-0.5 rounded hover:bg-white/10"
              title="Close review and view submissions"
              aria-label="Close review"
            >
              <X className="size-3.5" />
            </span>
          )}
        </button>

        <span className="text-zinc-600 select-none px-1 text-base font-light" aria-hidden="true">
          |
        </span>

        {/* Tab 3: Submissions (blue History icon) */}
        <button
          type="button"
          role="tab"
          id="tab-submissions"
          aria-selected={activeTab === "submissions"}
          aria-controls="panel-submissions"
          onClick={() => setActiveTab("submissions")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors cursor-pointer text-sm sm:text-base",
            activeTab === "submissions"
              ? "text-white font-bold bg-white/[0.08]"
              : "text-zinc-400 hover:text-zinc-200 font-medium hover:bg-white/[0.04]",
          )}
        >
          <History className="size-4.5 sm:size-5 text-[#3b82f6] shrink-0" />
          <span>Submissions</span>
          <span className="text-xs sm:text-sm text-zinc-400">({submissions.length})</span>
        </button>
      </div>

      {/* ══ 1. SUBMISSIONS SECTION ("What did I try?") ═══════════════ */}
      <section
        id="panel-submissions"
        role="tabpanel"
        aria-labelledby="tab-submissions"
        className={cn("space-y-4", activeTab !== "submissions" && "hidden")}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#383838] pb-3">
          <div className="flex items-center gap-2.5">
            <History className="size-5 text-[#3b82f6] shrink-0" />
            <h2
              id="submissions-section-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight text-white"
            >
              Submissions
            </h2>
            <span className="rounded-full bg-[#373737] border border-[#4a4a4a] px-2.5 py-0.5 text-xs sm:text-sm font-semibold text-white">
              {submissions.length}
            </span>
          </div>

          <p className="text-sm text-zinc-300 hidden sm:block">
            Select an attempt to evaluate with AI
          </p>
        </div>

        {submissions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#4a4a4a] p-8 text-center bg-[#373737] text-white">
            <p className="text-sm font-medium text-white">
              No submissions recorded yet
            </p>
            <p className="mt-1 text-xs text-white">
              Solve this problem on LeetCode with the extension active to sync your attempts.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <div key={submission.id} className="space-y-1.5">
                <SubmissionCard
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
                <div className="flex justify-end pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubmissionId(submission.id);
                      setActiveTab("analysis");
                    }}
                    className="inline-flex items-center gap-1.5 text-sm text-[#38bdf8] hover:text-white transition-colors py-1.5 px-3 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-[#444444]"
                  >
                    <Sparkles className="size-3.5 text-[#38bdf8]" />
                    <span>Open AI Diagnostic Review for this attempt &rarr;</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══ 2. AI ANALYSIS SECTION ("What happened and why?") ══════════ */}
      <section
        id="panel-analysis"
        role="tabpanel"
        aria-labelledby="tab-analysis"
        className={cn("space-y-4", activeTab !== "analysis" && "hidden")}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#383838] pb-3">
          <div>
            <div className="flex items-center gap-2.5">
              <Sparkles className="size-5 text-[#38bdf8] shrink-0" />
              <h2
                id="analysis-section-heading"
                className="text-xl sm:text-2xl font-bold tracking-tight text-white"
              >
                AI Diagnostic Review
              </h2>
            </div>
            <p className="mt-1 text-sm sm:text-base text-zinc-200">
              Code-specific complexity explanations, mistakes, takeaways, and candidate knowledge drafts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("submissions")}
            className="inline-flex items-center gap-1 text-sm text-zinc-300 hover:text-white transition-colors py-1.5 px-2.5 rounded hover:bg-white/[0.06]"
          >
            <History className="size-4" />
            <span className="hidden sm:inline">All Submissions</span>
          </button>
        </div>

        {submissions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#4a4a4a] p-8 text-center bg-[#373737] text-white">
            <AlertCircle className="size-7 text-white mx-auto mb-2 opacity-80" />
            <p className="text-sm sm:text-base text-white">
              No submissions available to analyze. Record or sync an attempt first.
            </p>
          </div>
        ) : selectedSubmission ? (
          <div className="space-y-4">
            {/* Active attempt context pill & attempt switcher */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-md bg-[#373737] border border-[#4a4a4a] px-3.5 py-2.5 text-sm text-white shadow-2xs">
              <div className="flex items-center gap-2">
                <span>
                  Evaluating attempt:{" "}
                  <strong className="text-white font-bold">
                    {selectedSubmission.status.replaceAll("_", " ")}
                  </strong>{" "}
                  ({selectedSubmission.language}
                  {selectedSubmission.runtimeMs != null
                    ? ` · ${selectedSubmission.runtimeMs} ms`
                    : ""}
                  )
                </span>
                <span className="text-xs font-mono text-zinc-300">
                  #{selectedSubmission.id.slice(-6)}
                </span>
              </div>

              {submissions.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-zinc-300">Switch attempt:</span>
                  <select
                    value={selectedSubmission.id}
                    onChange={(e) => setSelectedSubmissionId(e.target.value)}
                    className="rounded bg-[#262626] border border-[#4a4a4a] px-2.5 py-1 text-xs sm:text-sm text-white focus:outline-none focus:border-primary"
                  >
                    {submissions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.status.replaceAll("_", " ")} ({s.language}) · #{s.id.slice(-6)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <SubmissionAnalysisContainer
              key={selectedSubmission.id}
              submissionId={selectedSubmission.id}
              submissionCode={selectedSubmission.code}
              submissionLanguage={selectedSubmission.language}
              submissionStatus={selectedSubmission.status}
              runtimeMs={selectedSubmission.runtimeMs}
              initialAnalyses={selectedSubmission.analyses}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-[#4a4a4a] bg-[#373737] p-6 text-center text-sm text-white">
            Select a submission above to review its AI analysis.
          </div>
        )}
      </section>

      {/* ══ 3. PERMANENT KNOWLEDGE SECTION ("What should I remember?") ══ */}
      <section
        id="panel-knowledge"
        role="tabpanel"
        aria-labelledby="tab-knowledge"
        className={cn("space-y-4", activeTab !== "knowledge" && "hidden")}
      >
        <div className="border-b border-[#383838] pb-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="size-5 text-[#eab308] shrink-0" />
            <h2
              id="knowledge-section-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight text-white"
            >
              Permanent Knowledge
            </h2>
          </div>
          <p className="mt-1 text-sm sm:text-base text-zinc-200">
            Approaches, step-by-step algorithms, and optimized implementations in your personal playbook.
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
