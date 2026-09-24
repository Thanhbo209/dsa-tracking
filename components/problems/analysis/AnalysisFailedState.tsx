import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModelSelector } from "./ModelSelector";
import { DEFAULT_PRIMARY_MODEL, formatModelDisplayName } from "@/lib/analysis/models";

interface AnalysisFailedStateProps {
  errorMessage?: string | null;
  onRetry: (modelName?: string) => void;
  isRetrying: boolean;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  failedModel?: string | null;
}

export function AnalysisFailedState({
  errorMessage,
  onRetry,
  isRetrying,
  selectedModel = DEFAULT_PRIMARY_MODEL,
  onModelChange,
  failedModel,
}: AnalysisFailedStateProps) {
  // Sanitize message to prevent leaking system paths, keys, or stack traces
  const displayMessage =
    errorMessage && !errorMessage.includes("key") && !errorMessage.includes("at ")
      ? errorMessage
      : "The AI analysis could not be completed. Please verify your connection or try again.";

  const failedDisplay = formatModelDisplayName(failedModel);

  return (
    <div className="rounded-lg border border-red-500/30 bg-[#373737] p-6 text-center text-white shadow-2xs">
      <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-red-500/20 text-red-400 mb-3">
        <AlertTriangle className="size-5" />
      </div>

      <div className="flex items-center justify-center gap-2">
        <h4 className="text-sm font-semibold text-white">
          Analysis Failed
        </h4>
        {failedDisplay && (
          <span className="rounded bg-red-500/20 border border-red-500/40 px-1.5 py-0.2 text-[10px] font-mono text-red-300">
            {failedDisplay}
          </span>
        )}
      </div>

      <p className="mx-auto mt-1.5 max-w-md text-xs text-white leading-relaxed">
        {displayMessage}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {onModelChange && (
          <ModelSelector
            value={selectedModel}
            onChange={onModelChange}
            disabled={isRetrying}
            id="failed-state-model-select"
            label="Switch Model:"
          />
        )}

        <Button
          type="button"
          onClick={() => onRetry(selectedModel)}
          disabled={isRetrying}
          variant="outline"
          size="sm"
          className="gap-2 border-red-500/40 hover:bg-red-500/20 text-white"
        >
          <RotateCcw className="size-3.5" />
          <span>{isRetrying ? "Retrying..." : "Retry Analysis"}</span>
        </Button>
      </div>
    </div>
  );
}
