"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

interface CodeFormProps {
  solutionId: string;
}

export function CodeForm({ solutionId }: CodeFormProps) {
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
      solutionId,
      language: formData.get("language"),
      code: formData.get("code"),
      notes: formData.get("notes") || undefined,
    };

    try {
      const response = await fetch("/api/codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        throw new Error(result?.error ?? "Failed to create code");
      }

      form.reset();
      setIsOpen(false);

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create code",
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
        + Add Code
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-md border bg-background p-4"
    >
      <div className="mb-4">
        <h6 className="font-medium">Add Code</h6>
        <p className="mt-1 text-sm text-muted-foreground">
          Record a concrete implementation of this solution.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor={`code-language-${solutionId}`}
            className="mb-1 block text-sm font-medium"
          >
            Language *
          </label>

          <input
            id={`code-language-${solutionId}`}
            name="language"
            required
            placeholder="e.g. Python"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor={`code-source-${solutionId}`}
            className="mb-1 block text-sm font-medium"
          >
            Code *
          </label>

          <textarea
            id={`code-source-${solutionId}`}
            name="code"
            required
            rows={12}
            spellCheck={false}
            placeholder="Paste your implementation..."
            className="w-full rounded-md border bg-background px-3 py-2 font-mono text-sm outline-none focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor={`code-notes-${solutionId}`}
            className="mb-1 block text-sm font-medium"
          >
            Notes
          </label>

          <textarea
            id={`code-notes-${solutionId}`}
            name="notes"
            rows={3}
            placeholder="Implementation-specific notes..."
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
          {isSubmitting ? "Saving..." : "Save Code"}
        </button>
      </div>
    </form>
  );
}
