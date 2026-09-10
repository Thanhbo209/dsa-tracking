import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisEmptyStateProps {
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export function AnalysisEmptyState({
  onAnalyze,
  isAnalyzing,
}: AnalysisEmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-center bg-muted/10">
      <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
        <Sparkles className="size-5" />
      </div>

      <h4 className="text-sm font-semibold text-foreground">
        No AI Analysis Yet
      </h4>

      <p className="mx-auto mt-1.5 max-w-md text-xs text-muted-foreground leading-relaxed">
        Analyze this submission to evaluate your code, dissect Big-O time and
        space complexity reasoning, diagnose bugs or missed edge cases, and
        generate a candidate knowledge draft.
      </p>

      <div className="mt-4">
        <Button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing}
          size="sm"
          className="gap-2"
        >
          <Sparkles className="size-3.5" />
          <span>Analyze Submission</span>
        </Button>
      </div>
    </div>
  );
}
