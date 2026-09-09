export interface CapturedSubmission {
  externalId: string;
  problemSlug: string;
  status:
    | "ACCEPTED"
    | "WRONG_ANSWER"
    | "TIME_LIMIT_EXCEEDED"
    | "MEMORY_LIMIT_EXCEEDED"
    | "RUNTIME_ERROR"
    | "COMPILE_ERROR"
    | "UNKNOWN";
  language: string;
  code?: string;
  runtimeMs?: number;
  memoryBytes?: number;
  submittedAt?: string;
}
