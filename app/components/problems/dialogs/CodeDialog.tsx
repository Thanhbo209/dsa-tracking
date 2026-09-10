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
import type { KnowledgeCode, KnowledgeSolution } from "../knowledge/types";
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Code2,
  FileCode,
  FileText,
} from "lucide-react";

interface BaseCodeDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement;
}

interface CodeDialogCreateProps extends BaseCodeDialogProps {
  mode: "create";
  solution: KnowledgeSolution;
  codeRecord?: never;
}

interface CodeDialogEditProps extends BaseCodeDialogProps {
  mode: "edit";
  solution: KnowledgeSolution;
  codeRecord: KnowledgeCode;
}

type CodeDialogProps = CodeDialogCreateProps | CodeDialogEditProps;

export function CodeDialog(props: CodeDialogProps) {
  const { mode, solution, trigger } = props;
  const router = useRouter();

  const [uncontrolledOpen, setUncontrolledOpen] = useState(props.defaultOpen ?? false);
  const open = props.open !== undefined ? props.open : uncontrolledOpen;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form field state
  const [language, setLanguage] = useState(() => (mode === "edit" && props.codeRecord ? props.codeRecord.language || "" : "typescript"));
  const [code, setCode] = useState(() => (mode === "edit" && props.codeRecord ? props.codeRecord.code || "" : ""));
  const [notes, setNotes] = useState(() => (mode === "edit" && props.codeRecord ? props.codeRecord.notes || "" : ""));

  function resetForm() {
    if (mode === "edit" && props.codeRecord) {
      setLanguage(props.codeRecord.language || "");
      setCode(props.codeRecord.code || "");
      setNotes(props.codeRecord.notes || "");
    } else {
      setLanguage("");
      setCode("");
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
  }, [open, mode === "edit" ? props.codeRecord?.id : undefined]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!language.trim()) {
      setError("Language is required");
      return;
    }
    if (!code.trim()) {
      setError("Code implementation is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      language: language.trim().toLowerCase(),
      code: code,
      notes: notes.trim() || undefined,
    };

    try {
      if (mode === "create") {
        const response = await fetch("/api/codes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            solutionId: solution.id,
            ...payload,
          }),
        });

        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.error ?? "Failed to create code");
        }
      } else {
        const response = await fetch(`/api/codes/${props.codeRecord.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.error ?? "Failed to update code");
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
    if (mode !== "edit" || !props.codeRecord) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/codes/${props.codeRecord.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error ?? "Failed to delete code");
      }

      handleOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete code");
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
              <span>+ Add Code</span>
            </button>
          ) : (
            <Button variant="outline" size="xs" className="gap-1 text-xs h-7 border-[#555555] bg-[#2a2a2a] text-white hover:bg-[#333333]">
              <Pencil className="size-3 text-white" />
              <span>Edit Code</span>
            </Button>
          )
        }
      />

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              Solution: {solution.name}
            </span>
          </div>
          <DialogTitle className="mt-1">
            {mode === "create" ? "Add Implementation" : "Edit Implementation"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? `Record a canonical code implementation for "${solution.name}".`
              : `Update ${props.codeRecord?.language} code implementation.`}
          </DialogDescription>
        </DialogHeader>

        {/* Delete Confirmation Banner */}
        {showDeleteConfirm && (
          <div className="my-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-destructive">
                  Delete this implementation?
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  This action cannot be undone. This canonical code implementation
                  will be permanently removed.
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
          <div className="max-h-[65vh] overflow-y-auto pr-2 space-y-4 py-2">
            {/* Language Selection */}
            <div>
              <label htmlFor="code-language" className="mb-1 block text-xs font-medium">
                Language <span className="text-destructive">*</span>
              </label>
              <input
                id="code-language"
                name="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                required
                placeholder="e.g. typescript, python3, java, cpp, go"
                className="w-full rounded-md border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Code Textarea - Largest amount of space, Monospace */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="code-body" className="text-xs font-medium">
                  Implementation Code <span className="text-destructive">*</span>
                </label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Monospace · Paste-friendly
                </span>
              </div>
              <div className="rounded-lg border bg-zinc-950 dark:bg-zinc-900/90 text-zinc-100 p-2 shadow-xs">
                <textarea
                  id="code-body"
                  name="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  rows={12}
                  spellCheck={false}
                  placeholder="// Paste your clean, readable canonical implementation here..."
                  className="w-full bg-transparent p-2 font-mono text-xs text-zinc-100 outline-none leading-relaxed resize-y placeholder:text-zinc-500"
                />
              </div>
            </div>

            {/* Implementation Notes */}
            <div>
              <label htmlFor="code-notes" className="mb-1 block text-xs font-medium">
                Implementation Notes
              </label>
              <textarea
                id="code-notes"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Language-specific details, typing nuances, library dependencies..."
                className="w-full rounded-md border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary leading-relaxed"
              />
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
              {isSubmitting ? "Saving..." : mode === "create" ? "Save Code" : "Update Code"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
