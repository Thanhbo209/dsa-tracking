"use client";

import { useState } from "react";
import { Check, ChevronDown, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { highlightCodeLine } from "./syntaxHighlighter";

export interface CodeViewerProps {
  code: string;
  language?: string;
  badge?: string;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeViewer({
  code,
  language = "code",
  badge,
  headerLeft,
  headerRight,
  showLineNumbers = true,
  className,
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!code) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const lines = code ? code.split("\n") : [];

  return (
    <div
      className={cn(
        "w-full rounded-lg border border-[#333333] bg-[#262626] text-white shadow-2xs overflow-hidden",
        className,
      )}
    >
      {/* ── Editor Header Bar (Exact LeetCode style) ─────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#333333] bg-[#262626] px-4 py-2.5 text-xs sm:text-[13px] font-mono text-white">
        <div className="flex items-center gap-2.5">
          {headerLeft ?? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded bg-[#333333] px-2.5 py-1 text-xs font-semibold text-white border border-[#444444]/60">
                <span>{language.toUpperCase()}</span>
                <ChevronDown className="size-3.5 text-zinc-400" />
              </span>
              <span className="rounded bg-[#333333]/60 px-2 py-0.5 text-[11px] text-zinc-400 border border-[#444444]/40 font-sans">
                Auto
              </span>
            </div>
          )}
          {badge && (
            <span className="rounded bg-[#333333] px-2.5 py-0.5 text-xs text-zinc-200 border border-[#444444]">
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {headerRight}

          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleCopy}
            className="h-7 gap-1.5 px-2.5 text-xs sm:text-[13px] text-zinc-300 hover:text-white hover:bg-[#333333]"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-green-400" />
                <span className="text-green-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-zinc-300" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Code Display with Line Numbers (LeetCode style) ── */}
      <div className="w-full overflow-x-auto py-3 bg-[#262626]">
        {showLineNumbers && lines.length > 0 ? (
          <table className="w-full border-collapse font-mono text-[13.5px] sm:text-sm leading-relaxed">
            <tbody>
              {lines.map((line, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-white/[0.04] transition-colors"
                >
                  <td className="w-11 min-w-[2.75rem] select-none py-0.5 pr-4 pl-3.5 text-right text-[13px] sm:text-sm text-[#707070] font-mono align-top">
                    {idx + 1}
                  </td>
                  <td className="py-0.5 px-3 text-zinc-100 whitespace-pre font-mono align-top">
                    <span className="sr-only">{line}</span>
                    <span aria-hidden="true">{highlightCodeLine(line)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre className="p-4 text-[13.5px] sm:text-sm font-mono leading-relaxed text-zinc-100">
            <span className="sr-only">{code}</span>
            <div aria-hidden="true">
              {lines.map((line, idx) => (
                <div key={idx} className="whitespace-pre">
                  {highlightCodeLine(line)}
                </div>
              ))}
            </div>
          </pre>
        )}
      </div>
    </div>
  );
}
