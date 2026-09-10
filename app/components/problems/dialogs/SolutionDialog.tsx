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
import type { KnowledgeApproach, KnowledgeSolution } from "../knowledge/types";
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  ListOrdered,
  FileText,
  Layers,
} from "lucide-react";

interface BaseSolutionDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement;
}

interface SolutionDialogCreateProps extends BaseSolutionDialogProps {
  mode: "create";
  approach: KnowledgeApproach;
  solution?: never;
}

interface SolutionDialogEditProps extends BaseSolutionDialogProps {
  mode: "edit";
  approach: KnowledgeApproach;
  solution: KnowledgeSolution;
}

type SolutionDialogProps = SolutionDialogCreateProps | SolutionDialogEditProps;

export function SolutionDialog(props: SolutionDialogProps) {
  const { mode, approach, trigger } = props;
  const router = useRouter();

  const [uncontrolledOpen, setUncontrolledOpen] = useState(props.defaultOpen ?? false);
  const open = props.open !== undefined ? props.open : uncontrolledOpen;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form field state
  const [name, setName] = useState(() => (mode === "edit" && props.solution ? props.solution.name || "" : ""));
  const [description, setDescription] = useState(() => (mode === "edit" && props.solution ? props.solution.description || "" : ""));
  const [algorithm, setAlgorithm] = useState(() => (mode === "edit" && props.solution ? props.solution.algorithm || "" : ""));
  const [notes, setNotes] = useState(() => (mode === "edit" && props.solution ? props.solution.notes || "" : ""));

  function resetForm() {
    if (mode === "edit" && props.solution) {
      setName(props.solution.name || "");
      setDescription(props.solution.description || "");
      setAlgorithm(props.solution.algorithm || "");
      setNotes(props.solution.notes || "");
    } else {
      setName("");
      setDescription("");
      setAlgorithm("");
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

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, mode === "edit" ? props.solution?.id : undefined]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Solution name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      algorithm: algorithm.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      if (mode === "create") {
        const response = await fetch("/api/solutions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            approachId: approach.id,
            ...payload,
          }),
        });

        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.error ?? "Failed to create solution");
        }
      } else {
        const response = await fetch(`/api/solutions/${props.solution.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.error ?? "Failed to update solution");
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
    if (mode !== "edit" || !props.solution) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/solutions/${props.solution.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error ?? "Failed to delete solution");
      }

      handleOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete solution");
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
              className="inline-flex items-center gap-1 rounded-md border border-[#4a4a4a] bg-[#2a2a2a] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#333333]"
            >
              <Plus className="size-3 text-white" />
              <span>+ Add Solution</span>
            </button>
          ) : (
            <Button variant="outline" size="xs" className="gap-1 text-xs h-7 border-[#555555] bg-[#2a2a2a] text-white hover:bg-[#333333]">
              <Pencil className="size-3 text-white" />
              <span>Edit Solution</span>
            </Button>
          )
        }
      />

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              Approach: {approach.name}
            </span>
          </div>
          <DialogTitle className="mt-1">
            {mode === "create" ? "Add Solution" : "Edit Solution"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? `Record an algorithmic technique under ${approach.name}.`
              : `Update "${props.solution?.name}".`}
          </DialogDescription>
        </DialogHeader>

        {/* Delete Confirmation Banner */}
        {showDeleteConfirm && (
          <div className="my-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-destructive">
                  Delete this solution?
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  This action cannot be undone. Deleting this solution will also
                  permanently delete all of its associated code implementations.
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-5 py-2">
            {/* 1. Technique Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
                <Layers className="size-3.5 text-primary" />
                <span>Technique</span>
              </div>

              <div>
                <label htmlFor="solution-name" className="mb-1 block text-xs font-medium">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  id="solution-name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. One-Pass Complement Lookup"
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="solution-description" className="mb-1 block text-xs font-medium">
                  Description
                </label>
                <textarea
                  id="solution-description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="What does this technique or algorithm do?"
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                />
              </div>
            </div>

            {/* 2. Algorithm Section (Readable Multiline, Not Monospace) */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
                <ListOrdered className="size-3.5 text-primary" />
                <span>Algorithm Steps</span>
              </div>

              <div>
                <label htmlFor="solution-algorithm" className="mb-1 block text-xs font-medium">
                  Step-by-Step Procedure
                </label>
                <textarea
                  id="solution-algorithm"
                  name="algorithm"
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  rows={4}
                  placeholder="1. Initialize hash map&#10;2. For each num, calculate complement&#10;3. Check if complement exists in map"
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                />
              </div>
            </div>

            {/* 3. Notes Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wider">
                <FileText className="size-3.5 text-primary" />
                <span>Notes</span>
              </div>

              <div>
                <label htmlFor="solution-notes" className="mb-1 block text-xs font-medium">
                  Technique Notes
                </label>
                <textarea
                  id="solution-notes"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Edge cases handled, performance observations..."
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
              {isSubmitting ? "Saving..." : mode === "create" ? "Save Solution" : "Update Solution"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
