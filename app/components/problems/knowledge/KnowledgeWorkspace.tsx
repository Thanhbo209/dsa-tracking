"use client";

import { useState, useRef } from "react";
import type { KnowledgeApproach } from "./types";
import { ApproachTabs } from "./ApproachTabs";
import { ApproachOverview } from "./ApproachOverview";
import { SolutionTechniqueView } from "./SolutionTechniqueView";
import { ApproachDialog } from "@/components/problems/dialogs/ApproachDialog";
import { BookOpen } from "lucide-react";

interface KnowledgeWorkspaceProps {
  problemId: string;
  approaches: KnowledgeApproach[];
}

export function KnowledgeWorkspace({
  problemId,
  approaches = [],
}: KnowledgeWorkspaceProps) {
  const [selectedApproachIndex, setSelectedApproachIndex] = useState(0);
  const contentAreaRef = useRef<HTMLDivElement>(null);

  // If approaches change or index out of range, fall back to first
  const activeApproach =
    approaches[selectedApproachIndex] || approaches[0] || null;

  function handleSelectApproach(index: number) {
    setSelectedApproachIndex(index);
    if (contentAreaRef.current) {
      contentAreaRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  // Empty state: no approaches yet
  if (approaches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#4a4a4a] p-10 text-center bg-[#373737] text-white shadow-2xs">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/20 text-primary mb-3">
          <BookOpen className="size-6" />
        </div>
        <h3 className="text-base font-bold text-white">
          No Knowledge Recorded Yet
        </h3>
        <p className="mx-auto mt-2 max-w-md text-xs text-white leading-relaxed">
          Approaches, algorithms, and optimized implementations organized here become your
          reusable problem-solving playbook. Record an approach manually or
          review a submission to generate AI suggested solutions.
        </p>
        <div className="mt-5">
          <ApproachDialog mode="create" problemId={problemId} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Approach Underline Tabs Navigation ──────────────────── */}
      <ApproachTabs
        problemId={problemId}
        approaches={approaches}
        selectedIndex={selectedApproachIndex}
        onSelect={handleSelectApproach}
      />

      {/* ── Active Approach Content ────────────────────────────── */}
      {activeApproach && (
        <div ref={contentAreaRef} className="space-y-6">
          <ApproachOverview approach={activeApproach} showHeader={false} />

          {/* ── Solution / Techniques & Code ──────────────────── */}
          <SolutionTechniqueView approach={activeApproach} />
        </div>
      )}
    </div>
  );
}
