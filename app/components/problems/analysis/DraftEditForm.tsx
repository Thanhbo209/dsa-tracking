"use client";

import { useState, type FormEvent } from "react";
import type { AiDraft } from "@/lib/validation/analysis";
import { Button } from "@/components/ui/button";
import { Check, X, AlertCircle } from "lucide-react";

interface DraftEditFormProps {
  initialDraft: AiDraft;
  onSave: (editedDraft: AiDraft) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  submissionCode?: string | null;
  submissionLanguage?: string | null;
}

export function DraftEditForm({
  initialDraft,
  onSave,
  onCancel,
  isSaving,
  submissionCode,
  submissionLanguage,
}: DraftEditFormProps) {
  // Approach state
  const [approachName, setApproachName] = useState(initialDraft.approach.name);
  const [coreIdea, setCoreIdea] = useState(initialDraft.approach.coreIdea || "");
  const [whyItWorks, setWhyItWorks] = useState(initialDraft.approach.whyItWorks || "");
  const [whenToUse, setWhenToUse] = useState(initialDraft.approach.whenToUse || "");
  const [timeComplexity, setTimeComplexity] = useState(
    initialDraft.approach.timeComplexity || "",
  );
  const [spaceComplexity, setSpaceComplexity] = useState(
    initialDraft.approach.spaceComplexity || "",
  );
  const [pros, setPros] = useState(initialDraft.approach.pros || "");
  const [cons, setCons] = useState(initialDraft.approach.cons || "");
  const [approachNotes, setApproachNotes] = useState(
    initialDraft.approach.notes || "",
  );
  const [approachMistakes, setApproachMistakes] = useState(
    initialDraft.approach.mistakes || "",
  );

  // Solution state
  const [solutionName, setSolutionName] = useState(initialDraft.solution.name);
  const [description, setDescription] = useState(
    initialDraft.solution.description || "",
  );
  const [algorithm, setAlgorithm] = useState(
    initialDraft.solution.algorithm || "",
  );
  const [solutionNotes, setSolutionNotes] = useState(
    initialDraft.solution.notes || "",
  );

  // Code state
  const [language, setLanguage] = useState(initialDraft.code.language);
  const [code, setCode] = useState(initialDraft.code.code);
  const [codeNotes, setCodeNotes] = useState(initialDraft.code.notes || "");

  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!approachName.trim()) {
      setValidationError("Approach name is required");
      return;
    }
    if (!solutionName.trim()) {
      setValidationError("Solution name is required");
      return;
    }
    if (!language.trim()) {
      setValidationError("Code language is required");
      return;
    }
    if (!code.trim()) {
      setValidationError("Code content is required");
      return;
    }

    setValidationError(null);

    const editedDraft: AiDraft = {
      approach: {
        name: approachName.trim(),
        coreIdea: coreIdea.trim(),
        whyItWorks: whyItWorks.trim(),
        whenToUse: whenToUse.trim(),
        timeComplexity: timeComplexity.trim(),
        spaceComplexity: spaceComplexity.trim(),
        pros: pros.trim(),
        cons: cons.trim(),
        notes: approachNotes.trim() || undefined,
        mistakes: approachMistakes.trim() || undefined,
      },
      solution: {
        name: solutionName.trim(),
        description: description.trim(),
        algorithm: algorithm.trim(),
        notes: solutionNotes.trim() || undefined,
      },
      code: {
        language: language.trim(),
        code: code.trim(),
        notes: codeNotes.trim() || undefined,
      },
    };

    await onSave(editedDraft);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg border border-[#4a4a4a] bg-[#373737] p-5 text-white shadow-2xs"
    >
      <div className="border-b border-[#4a4a4a] pb-3">
        <h4 className="text-base font-semibold text-white">
          Edit Knowledge Draft
        </h4>
        <p className="mt-0.5 text-xs text-white">
          Modify the proposed approach, solution, and code before saving to your
          permanent knowledge base.
        </p>
      </div>

      {validationError && (
        <div className="flex items-center gap-2 rounded-md border border-red-500/40 bg-red-500/20 p-3 text-xs text-white">
          <AlertCircle className="size-4 shrink-0 text-red-400" />
          <span>{validationError}</span>
        </div>
      )}

      {/* ── APPROACH FIELDS ───────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          1. Approach (Strategy)
        </p>

        <div>
          <label className="text-xs font-medium text-white">
            Approach Name *
          </label>
          <input
            type="text"
            required
            value={approachName}
            onChange={(e) => setApproachName(e.target.value)}
            className="mt-1 w-full rounded-md border border-[#555555] bg-[#222222] px-3 py-1.5 text-xs text-white outline-none focus:border-primary"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-white">
              Time Complexity
            </label>
            <input
              type="text"
              value={timeComplexity}
              onChange={(e) => setTimeComplexity(e.target.value)}
              className="mt-1 w-full rounded-md border border-[#555555] bg-[#222222] px-3 py-1.5 text-xs text-white outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white">
              Space Complexity
            </label>
            <input
              type="text"
              value={spaceComplexity}
              onChange={(e) => setSpaceComplexity(e.target.value)}
              className="mt-1 w-full rounded-md border border-[#555555] bg-[#222222] px-3 py-1.5 text-xs text-white outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-white">Core Idea</label>
          <textarea
            rows={2}
            value={coreIdea}
            onChange={(e) => setCoreIdea(e.target.value)}
            className="mt-1 w-full rounded-md border border-[#555555] bg-[#222222] px-3 py-1.5 text-xs text-white outline-none focus:border-primary"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-white">Why It Works</label>
            <textarea
              rows={2}
              value={whyItWorks}
              onChange={(e) => setWhyItWorks(e.target.value)}
              className="mt-1 w-full rounded-md border border-[#555555] bg-[#222222] px-3 py-1.5 text-xs text-white outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white">When To Use</label>
            <textarea
              rows={2}
              value={whenToUse}
              onChange={(e) => setWhenToUse(e.target.value)}
              className="mt-1 w-full rounded-md border border-[#555555] bg-[#222222] px-3 py-1.5 text-xs text-white outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-white">Pros</label>
            <textarea
              rows={2}
              value={pros}
              onChange={(e) => setPros(e.target.value)}
              className="mt-1 w-full rounded-md border border-[#555555] bg-[#222222] px-3 py-1.5 text-xs text-white outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white">Cons</label>
            <textarea
              rows={2}
              value={cons}
              onChange={(e) => setCons(e.target.value)}
              className="mt-1 w-full rounded-md border border-[#555555] bg-[#222222] px-3 py-1.5 text-xs text-white outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-white">
            Common Pitfalls / Mistakes
          </label>
          <input
            type="text"
            value={approachMistakes}
            onChange={(e) => setApproachMistakes(e.target.value)}
            className="mt-1 w-full rounded-md border border-[#555555] bg-[#222222] px-3 py-1.5 text-xs text-white outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* ── SOLUTION FIELDS ───────────────────────────────── */}
      <div className="space-y-3 border-t border-[#4a4a4a] pt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          2. Solution (Concrete Technique)
        </p>

        <div>
          <label className="text-xs font-medium text-white">
            Solution Name *
          </label>
          <input
            type="text"
            required
            value={solutionName}
            onChange={(e) => setSolutionName(e.target.value)}
            className="mt-1 w-full rounded-md border border-[#555555] bg-[#222222] px-3 py-1.5 text-xs text-white outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white">Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-md border border-[#555555] bg-[#222222] px-3 py-1.5 text-xs text-white outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white">
            Algorithm Steps
          </label>
          <textarea
            rows={4}
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="mt-1 w-full rounded-md border border-[#555555] bg-[#222222] font-mono px-3 py-1.5 text-xs text-white outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* ── CODE FIELDS ──────────────────────────────────── */}
      <div className="space-y-3 border-t border-[#4a4a4a] pt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          3. Optimized Implementation
        </p>

        <div>
          <label className="text-xs font-medium text-white">Language *</label>
          <input
            type="text"
            required
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-1 w-full rounded-md border border-[#555555] bg-[#222222] px-3 py-1.5 text-xs text-white outline-none focus:border-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-white">
              Implementation Code *
            </label>
            {submissionCode && (
              <button
                type="button"
                onClick={() => {
                  setCode(submissionCode);
                  if (submissionLanguage) setLanguage(submissionLanguage);
                }}
                className="text-[11px] text-primary hover:underline font-medium"
              >
                Load My Submitted Code
              </button>
            )}
          </div>
          <textarea
            rows={8}
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 w-full rounded-md border border-[#555555] bg-[#222222] font-mono px-3 py-2 text-xs text-white outline-none focus:border-primary leading-relaxed"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white">Code Notes</label>
          <input
            type="text"
            value={codeNotes}
            onChange={(e) => setCodeNotes(e.target.value)}
            className="mt-1 w-full rounded-md border border-[#555555] bg-[#222222] px-3 py-1.5 text-xs text-white outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-2 border-t border-[#4a4a4a] pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
          className="border-[#555555] bg-[#2a2a2a] text-white hover:bg-[#333333]"
        >
          <X className="size-3.5" />
          <span>Cancel</span>
        </Button>

        <Button type="submit" size="sm" disabled={isSaving} className="gap-1.5 text-white font-semibold">
          <Check className="size-3.5" />
          <span>{isSaving ? "Saving..." : "Save to Knowledge"}</span>
        </Button>
      </div>
    </form>
  );
}
