"use client";

import { useState } from "react";
import type { KnowledgeSolution } from "./types";
import { CodeForm } from "@/components/problems/CodeForm";
import { Copy, Check, Code2, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KnowledgeCodeBlockProps {
  solution: KnowledgeSolution;
}

export function KnowledgeCodeBlock({ solution }: KnowledgeCodeBlockProps) {
  const [selectedCodeIndex, setSelectedCodeIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const codes = solution.codes || [];
  const activeCode = codes[selectedCodeIndex] || codes[0];

  async function handleCopy() {
    if (!activeCode?.code) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(activeCode.code);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API fails
      setCopied(false);
    }
  }

  if (codes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center bg-muted/10">
        <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2">
          <Code2 className="size-4" />
        </div>
        <p className="text-xs font-semibold text-foreground">
          No Implementation Recorded
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add canonical code for this technique to complete your knowledge.
        </p>
        <div className="mt-3">
          <CodeForm solutionId={solution.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Code Header Bar: Title, Language Selector, Copy & Add Code */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Code2 className="size-3.5 text-primary" />
            Canonical Implementation
          </span>

          {/* Language Selector if multiple codes exist */}
          {codes.length > 1 && (
            <div
              role="tablist"
              aria-label="Code languages"
              className="flex items-center gap-1 ml-2"
            >
              {codes.map((item, idx) => (
                <button
                  key={item.id || idx}
                  type="button"
                  role="tab"
                  aria-selected={idx === selectedCodeIndex}
                  onClick={() => setSelectedCodeIndex(idx)}
                  className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                    idx === selectedCodeIndex
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {item.language}
                </button>
              ))}
            </div>
          )}

          {codes.length === 1 && activeCode && (
            <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground uppercase">
              {activeCode.language}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Code Action */}
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleCopy}
            disabled={!activeCode}
            className="gap-1 text-xs h-7"
          >
            {copied ? (
              <>
                <Check className="size-3 text-green-600 dark:text-green-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                <span>Copy Code</span>
              </>
            )}
          </Button>

          {/* Add Code action */}
          <CodeForm solutionId={solution.id} />
        </div>
      </div>

      {/* Code Block Container */}
      {activeCode && (
        <div className="rounded-lg border border-border bg-zinc-950 dark:bg-zinc-900/90 text-zinc-100 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <FileCode className="size-3" />
              {activeCode.language}
            </span>
            <span className="text-[10px] text-zinc-500">Reusable Knowledge</span>
          </div>

          <pre className="overflow-x-auto p-4 text-xs font-mono leading-relaxed">
            <code>{activeCode.code}</code>
          </pre>
        </div>
      )}

      {/* Code Notes */}
      {activeCode?.notes && (
        <div className="rounded-md border bg-muted/20 px-3 py-2 text-xs">
          <span className="font-semibold text-foreground">
            Implementation Notes:{" "}
          </span>
          <span className="text-muted-foreground">{activeCode.notes}</span>
        </div>
      )}
    </div>
  );
}
