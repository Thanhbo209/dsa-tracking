import { Loader2 } from "lucide-react";

export function AnalysisGeneratingState() {
  return (
    <div className="rounded-lg border border-[#4a4a4a] bg-[#373737] p-8 text-center text-white shadow-2xs">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/20 text-primary mb-3 animate-pulse">
        <Loader2 className="size-6 animate-spin" />
      </div>

      <h4 className="text-sm font-semibold text-white">
        Analyzing your submission...
      </h4>

      <p className="mx-auto mt-1.5 max-w-sm text-xs text-white leading-relaxed">
        The AI is reviewing your code, complexity, mistakes, and learning
        opportunities. This may take a few seconds.
      </p>
    </div>
  );
}
