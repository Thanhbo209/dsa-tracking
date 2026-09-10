"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { KnowledgeApproach } from "../knowledge/types";
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Lightbulb,
  Compass,
  Scale,
  FileText,
} from "lucide-react";

interface BaseApproachDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement;
}

interface ApproachDialogCreateProps extends BaseApproachDialogProps {
  mode: "create";
  problemId: string;
  approach?: never;
}

interface ApproachDialogEditProps extends BaseApproachDialogProps {
  mode: "edit";
  problemId?: string;
  approach: KnowledgeApproach;
}

type ApproachDialogProps = ApproachDialogCreateProps | ApproachDialogEditProps;

export function ApproachDialog(props: ApproachDialogProps) {
  const { mode, trigger } = props;
  const router = useRouter();

  const [uncontrolledOpen, setUncontrolledOpen] = useState(props.defaultOpen ?? false);
  const open = props.open !== undefined ? props.open : uncontrolledOpen;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form field state
  const [name, setName] = useState(() => (mode === "edit" && props.approach ? props.approach.name || "" : ""));
  const [coreIdea, setCoreIdea] = useState(() => (mode === "edit" && props.approach ? props.approach.coreIdea || "" : ""));
  const [whyItWorks, setWhyItWorks] = useState(() => (mode === "edit" && props.approach ? props.approach.whyItWorks || "" : ""));
  const [whenToUse, setWhenToUse] = useState(() => (mode === "edit" && props.approach ? props.approach.whenToUse || "" : ""));
  const [timeComplexity, setTimeComplexity] = useState(() => (mode === "edit" && props.approach ? props.approach.timeComplexity || "" : ""));
  const [spaceComplexity, setSpaceComplexity] = useState(() => (mode === "edit" && props.approach ? props.approach.spaceComplexity || "" : ""));
  const [pros, setPros] = useState(() => (mode === "edit" && props.approach ? props.approach.pros || "" : ""));
  const [cons, setCons] = useState(() => (mode === "edit" && props.approach ? props.approach.cons || "" : ""));
  const [mistakes, setMistakes] = useState(() => (mode === "edit" && props.approach ? props.approach.mistakes || "" : ""));
  const [notes, setNotes] = useState(() => (mode === "edit" && props.approach ? props.approach.notes || "" : ""));

  // Populate/reset fields when dialog opens or approach changes
  function resetForm() {
    if (mode === "edit" && props.approach) {
      setName(props.approach.name || "");
      setCoreIdea(props.approach.coreIdea || "");
      setWhyItWorks(props.approach.whyItWorks || "");
      setWhenToUse(props.approach.whenToUse || "");
      setTimeComplexity(props.approach.timeComplexity || "");
      setSpaceComplexity(props.approach.spaceComplexity || "");
      setPros(props.approach.pros || "");
      setCons(props.approach.cons || "");
      setMistakes(props.approach.mistakes || "");
      setNotes(props.approach.notes || "");
    } else {
      setName("");
      setCoreIdea("");
      setWhyItWorks("");
      setWhenToUse("");
      setTimeComplexity("");
      setSpaceComplexity("");
      setPros("");
      setCons("");
      setMistakes("");
      setNotes("");
    }
    setError(null);
    setShowDeleteConfirm(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting || isDeleting) return;
    if (nextOpen) {
      resetForm();
    }
    if (props.open === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    props.onOpenChange?.(nextOpen);
  }

  // Update fields if editing approach changes
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, mode === "edit" ? props.approach?.id : undefined]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Approach name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: name.trim(),
      coreIdea: coreIdea.trim() || undefined,
      whyItWorks: whyItWorks.trim() || undefined,
      whenToUse: whenToUse.trim() || undefined,
      timeComplexity: timeComplexity.trim() || undefined,
      spaceComplexity: spaceComplexity.trim() || undefined,
      pros: pros.trim() || undefined,
      cons: cons.trim() || undefined,
      mistakes: mistakes.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      if (mode === "create") {
        const response = await fetch("/api/approaches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problemId: props.problemId,
            ...payload,
          }),
        });

        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.error ?? "Failed to create approach");
        }
      } else {
        const response = await fetch(`/api/approaches/${props.approach.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.error ?? "Failed to update approach");
        }
      }

      handleOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (mode !== "edit" || !props.approach) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/approaches/${props.approach.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error ?? "Failed to delete approach");
      }

      handleOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete approach");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ? (
            trigger
          ) : mode === "create" ? (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
            >
              <Plus className="size-3.5" />
              <span>+ Add Approach</span>
            </button>
          ) : (
            <Button variant="outline" size="xs" className="gap-1 text-xs">
              <Pencil className="size-3" />
              <span>Edit Approach</span>
            </Button>
          )
        }
      />

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Approach" : "Edit Approach"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Record an algorithmic strategy and intuition for solving this problem."
              : `Update "${props.approach?.name}" and its reasoning.`}
          </DialogDescription>
        </DialogHeader>

        {/* Delete Confirmation Banner */}
        {showDeleteConfirm && (
          <div className="my-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-destructive">
                  Delete this approach?
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  This action cannot be undone. Deleting this approach will also
                  permanently delete all of its associated solutions and code
                  implementations.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="xs"
                    disabled={isDeleting}
                    onClick={handleDelete}
                  >
                    {isDeleting ? "Deleting..." : "Permanently Delete"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={isDeleting}
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form id="approach-form" onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6 py-2">
            {/* 1. Strategy Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
                <Lightbulb className="size-3.5 text-primary" />
                <span>Strategy</span>
              </div>

              <div>
                <label htmlFor="approach-name" className="mb-1 block text-xs font-medium">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  id="approach-name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Hash Map Strategy"
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="approach-coreIdea" className="mb-1 block text-xs font-medium">
                  Core Intuition
                </label>
                <textarea
                  id="approach-coreIdea"
                  name="coreIdea"
                  value={coreIdea}
                  onChange={(e) => setCoreIdea(e.target.value)}
                  rows={2}
                  placeholder="The central insight or high-level strategy..."
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                />
              </div>
            </div>

            {/* 2. Reasoning Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
                <Compass className="size-3.5 text-primary" />
                <span>Reasoning</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="approach-whyItWorks" className="mb-1 block text-xs font-medium">
                    Why It Works / Invariant
                  </label>
                  <textarea
                    id="approach-whyItWorks"
                    name="whyItWorks"
                    value={whyItWorks}
                    onChange={(e) => setWhyItWorks(e.target.value)}
                    rows={3}
                    placeholder="Mathematical or logical invariant..."
                    className="w-full rounded-md border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                  />
                </div>

                <div>
                  <label htmlFor="approach-whenToUse" className="mb-1 block text-xs font-medium">
                    When To Use / Signals
                  </label>
                  <textarea
                    id="approach-whenToUse"
                    name="whenToUse"
                    value={whenToUse}
                    onChange={(e) => setWhenToUse(e.target.value)}
                    rows={3}
                    placeholder="Problem characteristics that trigger this approach..."
                    className="w-full rounded-md border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* 3. Complexity Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
                <Scale className="size-3.5 text-primary" />
                <span>Complexity</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="approach-timeComplexity" className="mb-1 block text-xs font-medium">
                    Time Complexity
                  </label>
                  <input
                    id="approach-timeComplexity"
                    name="timeComplexity"
                    value={timeComplexity}
                    onChange={(e) => setTimeComplexity(e.target.value)}
                    placeholder="e.g. O(n), O(n log n)"
                    className="w-full rounded-md border bg-background px-3 py-1.5 text-xs font-mono outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="approach-spaceComplexity" className="mb-1 block text-xs font-medium">
                    Space Complexity
                  </label>
                  <input
                    id="approach-spaceComplexity"
                    name="spaceComplexity"
                    value={spaceComplexity}
                    onChange={(e) => setSpaceComplexity(e.target.value)}
                    placeholder="e.g. O(1), O(n)"
                    className="w-full rounded-md border bg-background px-3 py-1.5 text-xs font-mono outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* 4. Trade-offs Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
                <Scale className="size-3.5 text-primary" />
                <span>Trade-offs</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="approach-pros" className="mb-1 block text-xs font-medium">
                    Advantages & Strengths
                  </label>
                  <textarea
                    id="approach-pros"
                    name="pros"
                    value={pros}
                    onChange={(e) => setPros(e.target.value)}
                    rows={2}
                    placeholder="What makes this strategy strong..."
                    className="w-full rounded-md border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                  />
                </div>

                <div>
                  <label htmlFor="approach-cons" className="mb-1 block text-xs font-medium">
                    Trade-offs & Limitations
                  </label>
                  <textarea
                    id="approach-cons"
                    name="cons"
                    value={cons}
                    onChange={(e) => setCons(e.target.value)}
                    rows={2}
                    placeholder="Memory overhead, sorting constraints..."
                    className="w-full rounded-md border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* 5. Learning Notes Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
                <FileText className="size-3.5 text-primary" />
                <span>Learning Notes</span>
              </div>

              <div>
                <label htmlFor="approach-mistakes" className="mb-1 block text-xs font-medium">
                  Common Pitfalls to Avoid
                </label>
                <textarea
                  id="approach-mistakes"
                  name="mistakes"
                  value={mistakes}
                  onChange={(e) => setMistakes(e.target.value)}
                  rows={2}
                  placeholder="Edge cases, off-by-one errors, common bugs..."
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                />
              </div>

              <div>
                <label htmlFor="approach-notes" className="mb-1 block text-xs font-medium">
                  Additional Notes
                </label>
                <textarea
                  id="approach-notes"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Follow-up variations, interview remarks..."
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-md border border-destructive/50 bg-destructive/10 p-2.5 text-xs text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            {mode === "edit" && !showDeleteConfirm && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="sm:mr-auto gap-1"
                disabled={isSubmitting || isDeleting}
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="size-3.5" />
                <span>Delete</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting || isDeleting}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || isDeleting}
            >
              {isSubmitting ? "Saving..." : mode === "create" ? "Save Approach" : "Update Approach"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
