"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

interface SolutionFormProps {
  approachId: string;
}

export function SolutionForm({ approachId }: SolutionFormProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function closeForm() {
    if (isSubmitting) {
      return;
    }

    setIsOpen(false);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSubmitting(true);
    setError(null);

    const body = {
      approachId,
      name: formData.get("name"),
      description: formData.get("description") || undefined,
      algorithm: formData.get("algorithm") || undefined,
      notes: formData.get("notes") || undefined,
    };

    try {
      const response = await fetch("/api/solutions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        throw new Error(result?.error ?? "Failed to create solution");
      }

      form.reset();
      setIsOpen(false);

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create solution",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
      >
        + Add Solution
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-lg border bg-muted/30 p-4"
    >
      <div className="mb-4">
        <h4 className="font-semibold">Add Solution</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Record the concrete algorithm or technique used within this approach.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor={`solution-name-${approachId}`}
            className="mb-1 block text-sm font-medium"
          >
            Name *
          </label>

          <input
            id={`solution-name-${approachId}`}
            name="name"
            required
            placeholder="e.g. One-pass complement lookup"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor={`solution-description-${approachId}`}
            className="mb-1 block text-sm font-medium"
          >
            Description
          </label>

          <textarea
            id={`solution-description-${approachId}`}
            name="description"
            rows={3}
            placeholder="What does this solution do?"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor={`solution-algorithm-${approachId}`}
            className="mb-1 block text-sm font-medium"
          >
            Algorithm
          </label>

          <textarea
            id={`solution-algorithm-${approachId}`}
            name="algorithm"
            rows={4}
            placeholder="Describe the algorithm step by step..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor={`solution-notes-${approachId}`}
            className="mb-1 block text-sm font-medium"
          >
            Notes
          </label>

          <textarea
            id={`solution-notes-${approachId}`}
            name="notes"
            rows={3}
            placeholder="Additional notes..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={closeForm}
          disabled={isSubmitting}
          className="rounded-md border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Solution"}
        </button>
      </div>
    </form>
  );
}
