import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisFailedStateProps {
  errorMessage?: string | null;
  onRetry: () => void;
  isRetrying: boolean;
}

export function AnalysisFailedState({
  errorMessage,
  onRetry,
  isRetrying,
}: AnalysisFailedStateProps) {
  // Sanitize message to prevent leaking system paths, keys, or stack traces
  const displayMessage =
    errorMessage && !errorMessage.includes("key") && !errorMessage.includes("at ")
      ? errorMessage
      : "The AI analysis could not be completed. Please verify your connection or try again.";

  return (
    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-center">
      <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400 mb-3">
        <AlertTriangle className="size-5" />
      </div>

      <h4 className="text-sm font-semibold text-foreground">
        Analysis Failed
      </h4>

      <p className="mx-auto mt-1.5 max-w-md text-xs text-muted-foreground leading-relaxed">
        {displayMessage}
      </p>

      <div className="mt-4">
        <Button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          variant="outline"
          size="sm"
          className="gap-2 border-red-500/30 hover:bg-red-500/10 text-red-700 dark:text-red-400"
        >
          <RotateCcw className="size-3.5" />
          <span>{isRetrying ? "Retrying..." : "Retry Analysis"}</span>
        </Button>
      </div>
    </div>
  );
}
