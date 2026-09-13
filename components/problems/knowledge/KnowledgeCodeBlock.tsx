"use client";

import { useState } from "react";
import type { KnowledgeSolution } from "./types";
import { CodeDialog } from "@/components/problems/dialogs/CodeDialog";
import { Copy, Check, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeViewer } from "../CodeViewer";

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
      setCopied(false);
    }
  }

  if (codes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#4a4a4a] p-6 text-center bg-[#2a2a2a] text-white shadow-2xs">
        <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-[#333333] text-white mb-2 border border-[#4a4a4a]">
          <Code2 className="size-4 text-primary" />
        </div>
        <p className="text-xs font-semibold text-white">
          No Implementation Recorded
        </p>
        <p className="mt-1 text-xs text-white">
          Add an optimized implementation for this method to complete your knowledge.
        </p>
        <div className="mt-3">
          <CodeDialog mode="create" solution={solution} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-white">
      {/* Code Header Bar: Title, Language Selector, Copy & Add Code */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Code2 className="size-5 text-emerald-400 shrink-0" />
            <span>Optimized Implementation</span>
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
                      ? "bg-primary text-white font-semibold"
                      : "bg-[#2a2a2a] text-white border border-[#4a4a4a] hover:bg-[#333333]"
                  }`}
                >
                  {item.language}
                </button>
              ))}
            </div>
          )}

          {codes.length === 1 && activeCode && (
            <span className="rounded bg-[#2a2a2a] border border-[#4a4a4a] px-2 py-0.5 text-[10px] font-mono text-white uppercase">
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
            className="gap-1 text-xs h-7 border-[#555555] bg-[#2a2a2a] text-white hover:bg-[#333333]"
          >
            {copied ? (
              <>
                <Check className="size-3 text-green-400" />
                <span className="text-green-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                <span>Copy Code</span>
              </>
            )}
          </Button>

          {/* Edit Code Action */}
          {activeCode && (
            <CodeDialog
              mode="edit"
              solution={solution}
              codeRecord={activeCode}
            />
          )}

          {/* Add Code action */}
          <CodeDialog mode="create" solution={solution} />
        </div>
      </div>

      {/* Code Block Container */}
      {activeCode && (
        <CodeViewer
          code={activeCode.code}
          language={activeCode.language}
          badge="Reusable Knowledge"
        />
      )}

      {/* Code Notes */}
      {activeCode?.notes && (
        <div className="rounded-md border border-[#4a4a4a] bg-[#2a2a2a] px-3 py-2 text-xs text-white shadow-2xs">
          <span className="font-semibold text-white">
            Implementation Notes:{" "}
          </span>
          <span className="text-white">{activeCode.notes}</span>
        </div>
      )}
    </div>
  );
}
