"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

interface ApproachFormProps {
  problemId: string;
}

export function ApproachForm({ problemId }: ApproachFormProps) {
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
      problemId,
      name: formData.get("name"),
      coreIdea: formData.get("coreIdea") || undefined,
      algorithm: formData.get("algorithm") || undefined,
      whyItWorks: formData.get("whyItWorks") || undefined,
      whenToUse: formData.get("whenToUse") || undefined,
      timeComplexity: formData.get("timeComplexity") || undefined,
      spaceComplexity: formData.get("spaceComplexity") || undefined,
      pros: formData.get("pros") || undefined,
      cons: formData.get("cons") || undefined,
      notes: formData.get("notes") || undefined,
      mistakes: formData.get("mistakes") || undefined,
    };

    try {
      const response = await fetch("/api/approaches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        throw new Error(result?.error ?? "Failed to create approach");
      }

      form.reset();
      setIsOpen(false);

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create approach",
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
        className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
      >
        + Add Approach
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border p-5">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Add Approach</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Record the algorithmic strategy you used or could use to solve this
          problem.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Name *
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="e.g. Hash Map"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="coreIdea" className="mb-1 block text-sm font-medium">
            Core Idea
          </label>
          <textarea
            id="coreIdea"
            name="coreIdea"
            rows={3}
            placeholder="What is the main idea behind this approach?"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="algorithm" className="mb-1 block text-sm font-medium">
            Algorithm
          </label>
          <textarea
            id="algorithm"
            name="algorithm"
            rows={5}
            placeholder="Describe the steps of the algorithm..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="whyItWorks"
            className="mb-1 block text-sm font-medium"
          >
            Why It Works
          </label>
          <textarea
            id="whyItWorks"
            name="whyItWorks"
            rows={4}
            placeholder="Explain the reasoning or invariant that makes this work."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="whenToUse" className="mb-1 block text-sm font-medium">
            When To Use
          </label>
          <textarea
            id="whenToUse"
            name="whenToUse"
            rows={3}
            placeholder="What signals or problem characteristics suggest this approach?"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="timeComplexity"
              className="mb-1 block text-sm font-medium"
            >
              Time Complexity
            </label>
            <input
              id="timeComplexity"
              name="timeComplexity"
              placeholder="e.g. O(n), O(m + n)"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>

          <div>
            <label
              htmlFor="spaceComplexity"
              className="mb-1 block text-sm font-medium"
            >
              Space Complexity
            </label>
            <input
              id="spaceComplexity"
              name="spaceComplexity"
              placeholder="e.g. O(1), O(n)"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pros" className="mb-1 block text-sm font-medium">
              Pros
            </label>
            <textarea
              id="pros"
              name="pros"
              rows={3}
              placeholder="Advantages of this approach..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="cons" className="mb-1 block text-sm font-medium">
              Cons
            </label>
            <textarea
              id="cons"
              name="cons"
              rows={3}
              placeholder="Limitations or trade-offs..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-medium">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Anything else worth remembering..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="mistakes" className="mb-1 block text-sm font-medium">
            Mistakes
          </label>
          <textarea
            id="mistakes"
            name="mistakes"
            rows={3}
            placeholder="Mistakes, edge cases, or things to avoid..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={closeForm}
          disabled={isSubmitting}
          className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Approach"}
        </button>
      </div>
    </form>
  );
}
