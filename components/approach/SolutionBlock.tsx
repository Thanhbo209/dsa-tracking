import { CodeViewer } from "@/components/code/CodeViewer";
import { FormatText } from "@/components/ui/text";
import { Solution } from "@/types/approach";
import { extractLanguage } from "@/utils/approaches/helper";
import { Code2, FileText, ListOrdered } from "lucide-react";

export function SolutionBlock({ solution }: { solution: Solution }) {
  const codes = solution.codes ?? [];

  return (
    <div className="space-y-5">
      {/* Solution name */}
      <div className="flex items-center gap-2">
        <span className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
          <ListOrdered className="size-5 text-sky-400 shrink-0" />
          Methods & Algorithms - {solution.name}
        </span>
      </div>

      {/* Description */}
      {solution.description && (
        <p className="text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
          {FormatText(solution.description)}
        </p>
      )}

      {/* Algorithm steps — plain readable text, NOT font-mono */}
      {solution.algorithm && (
        <div className=" border border-[#4a4a4a] bg-card p-5 text-white shadow-2xs">
          <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-zinc-100 mb-2.5">
            <ListOrdered className="size-5 text-amber-400 shrink-0" />
            <span>Step-by-Step Guide</span>
          </div>
          <div className=" bg-[#222222] border border-[#4a4a4a] p-4 text-zinc-300">
            <p className="whitespace-pre-wrap text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {FormatText(solution.algorithm)}
            </p>
          </div>
        </div>
      )}

      {/* Solution notes */}
      {solution.notes && (
        <div className=" border border-[#4a4a4a] bg-[#2a2a2a] p-5 text-zinc-300 shadow-2xs">
          <div className="flex items-center gap-2.5 text-base font-bold text-zinc-100 mb-2">
            <FileText className="size-5 text-blue-400 shrink-0" />
            <span>Method Notes</span>
          </div>
          <p className="whitespace-pre-wrap text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-normal">
            {FormatText(solution.notes)}
          </p>
        </div>
      )}

      {/* Code blocks — using the same CodeViewer as the internal workspace */}
      {codes.length > 0 && (
        <div className="border-t border-[#4a4a4a] pt-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Code2 className="size-5 text-emerald-400 shrink-0" />
              <span>Implementation</span>
            </span>
            {/* Language chip(s) */}
            {codes.map((c) => (
              <span
                key={c.id}
                className=" bg-[#2a2a2a] border border-[#4a4a4a] px-2 py-0.5 text-[10px] font-mono text-white uppercase"
              >
                {extractLanguage(c.language)}
              </span>
            ))}
          </div>

          {codes.map((codeItem) => (
            <div key={codeItem.id} className="space-y-2">
              <CodeViewer
                code={codeItem.code}
                language={extractLanguage(codeItem.language)}
                showLineNumbers={true}
              />
              {codeItem.notes && (
                <div className=" border border-[#4a4a4a] bg-[#2a2a2a] px-3 py-2 text-xs text-white shadow-2xs">
                  <span className="font-semibold text-white">
                    Implementation Notes:{" "}
                  </span>
                  <span className="text-zinc-300">{codeItem.notes}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
