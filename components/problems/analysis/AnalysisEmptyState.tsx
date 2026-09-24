import { Button } from "@/components/ui/button";
import { DsaLogo } from "@/components/brand/DsaLogo";
import { ModelSelector } from "./ModelSelector";
import { DEFAULT_PRIMARY_MODEL } from "@/lib/analysis/models";

interface AnalysisEmptyStateProps {
  onAnalyze: (modelName?: string) => void;
  isAnalyzing: boolean;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
}

export function AnalysisEmptyState({
  onAnalyze,
  isAnalyzing,
  selectedModel = DEFAULT_PRIMARY_MODEL,
  onModelChange,
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

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {onModelChange && (
          <ModelSelector
            value={selectedModel}
            onChange={onModelChange}
            disabled={isAnalyzing}
            id="empty-state-model-select"
            label="Model:"
          />
        )}

        <Button
          type="button"
          onClick={() => onAnalyze(selectedModel)}
          disabled={isAnalyzing}
          size="sm"
          className="bg-black hover:bg-zinc-900 active:bg-zinc-950 text-white border border-[#444444] transition-colors"
        >
          <span>Analyze Submission</span>
        </Button>
      </div>
    </div>
  );
}
