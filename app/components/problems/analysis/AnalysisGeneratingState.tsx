import { Loader2 } from "lucide-react";

export function AnalysisGeneratingState() {
  return (
    <div className="rounded-lg border bg-muted/20 p-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3 animate-pulse">
        <Loader2 className="size-6 animate-spin" />
      </div>

      <h4 className="text-sm font-semibold text-foreground">
        Analyzing your submission...
      </h4>

      <p className="mx-auto mt-1.5 max-w-sm text-xs text-muted-foreground leading-relaxed">
        The AI is reviewing your code, complexity, mistakes, and learning
        opportunities. This may take a few seconds.
      </p>
    </div>
  );
}
