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
}

export function DraftEditForm({
  initialDraft,
  onSave,
  onCancel,
  isSaving,
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
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-5">
      <div className="border-b pb-3">
        <h4 className="text-base font-semibold text-foreground">
          Edit Knowledge Draft
        </h4>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Modify the proposed approach, solution, and code before saving to your
          permanent knowledge base.
        </p>
      </div>

      {validationError && (
        <div className="flex items-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* ── APPROACH FIELDS ───────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          1. Approach (Strategy)
        </p>

        <div>
          <label className="text-xs font-medium text-foreground">
            Approach Name *
          </label>
          <input
            type="text"
            required
            value={approachName}
            onChange={(e) => setApproachName(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-foreground">
              Time Complexity
            </label>
            <input
              type="text"
              value={timeComplexity}
              onChange={(e) => setTimeComplexity(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground">
              Space Complexity
            </label>
            <input
              type="text"
              value={spaceComplexity}
              onChange={(e) => setSpaceComplexity(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground">Core Idea</label>
          <textarea
            rows={2}
            value={coreIdea}
            onChange={(e) => setCoreIdea(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-foreground">Why It Works</label>
            <textarea
              rows={2}
              value={whyItWorks}
              onChange={(e) => setWhyItWorks(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground">When To Use</label>
            <textarea
              rows={2}
              value={whenToUse}
              onChange={(e) => setWhenToUse(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-foreground">Pros</label>
            <textarea
              rows={2}
              value={pros}
              onChange={(e) => setPros(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground">Cons</label>
            <textarea
              rows={2}
              value={cons}
              onChange={(e) => setCons(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground">
            Common Pitfalls / Mistakes
          </label>
          <input
            type="text"
            value={approachMistakes}
            onChange={(e) => setApproachMistakes(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* ── SOLUTION FIELDS ───────────────────────────────── */}
      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          2. Solution (Concrete Technique)
        </p>

        <div>
          <label className="text-xs font-medium text-foreground">
            Solution Name *
          </label>
          <input
            type="text"
            required
            value={solutionName}
            onChange={(e) => setSolutionName(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground">Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground">
            Algorithm Steps
          </label>
          <textarea
            rows={4}
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background font-mono px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* ── CODE FIELDS ──────────────────────────────────── */}
      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          3. Canonical Code
        </p>

        <div>
          <label className="text-xs font-medium text-foreground">Language *</label>
          <input
            type="text"
            required
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground">
            Implementation Code *
          </label>
          <textarea
            rows={8}
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background font-mono px-3 py-2 text-xs text-foreground outline-none focus:border-primary leading-relaxed"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground">Code Notes</label>
          <input
            type="text"
            value={codeNotes}
            onChange={(e) => setCodeNotes(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-2 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
        >
          <X className="size-3.5" />
          <span>Cancel</span>
        </Button>

        <Button type="submit" size="sm" disabled={isSaving} className="gap-1.5">
          <Check className="size-3.5" />
          <span>{isSaving ? "Saving..." : "Save to Knowledge"}</span>
        </Button>
      </div>
    </form>
  );
}
