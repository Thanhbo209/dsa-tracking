import { Button } from "@/components/ui/button";
import { DsaLogo } from "@/components/brand/DsaLogo";

interface AnalysisEmptyStateProps {
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export function AnalysisEmptyState({
  onAnalyze,
  isAnalyzing,
}: AnalysisEmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-[#4a4a4a] p-6 text-center bg-[#373737] text-white shadow-2xs">
      <div className="mx-auto mb-3 flex justify-center">
        <DsaLogo size="lg" className="h-10 w-auto" />
      </div>

      <h4 className="text-sm font-semibold text-white">
        No AI Analysis Yet
      </h4>

      <p className="mx-auto mt-1.5 max-w-md text-xs text-white leading-relaxed">
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
          className="gap-2 text-white"
        >
          <DsaLogo size="xs" className="h-3.5 w-auto inline-block" />
          <span>Analyze Submission</span>
        </Button>
      </div>
    </div>
  );
}
