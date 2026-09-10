"use client";

import { useState } from "react";
import type { KnowledgeApproach } from "./types";
import { ApproachSelector } from "./ApproachSelector";
import { ApproachOverview } from "./ApproachOverview";
import { SolutionTechniqueView } from "./SolutionTechniqueView";
import { ApproachForm } from "@/components/problems/ApproachForm";
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

  // If approaches change or index out of range, fall back to first
  const activeApproach =
    approaches[selectedApproachIndex] || approaches[0] || null;

  // Empty state: no approaches yet
  if (approaches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center bg-muted/10">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
          <BookOpen className="size-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          No Knowledge Recorded Yet
        </h3>
        <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground leading-relaxed">
          Approaches, algorithms, and canonical code organized here become your
          reusable problem-solving playbook. Record an approach manually or
          review a submission to generate a candidate draft.
        </p>
        <div className="mt-5">
          <ApproachForm problemId={problemId} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Approach Navigation Bar ───────────────────────────── */}
      <ApproachSelector
        problemId={problemId}
        approaches={approaches}
        selectedIndex={selectedApproachIndex}
        onSelect={(idx) => setSelectedApproachIndex(idx)}
      />

      {/* ── Active Approach Overview ─────────────────────────── */}
      {activeApproach && (
        <div className="space-y-6">
          <ApproachOverview approach={activeApproach} />

          {/* ── Solution / Techniques & Code ──────────────────── */}
          <SolutionTechniqueView approach={activeApproach} />
        </div>
      )}
    </div>
  );
}
