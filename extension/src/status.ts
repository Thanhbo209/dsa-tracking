export type SubmissionStatus =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "MEMORY_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "COMPILE_ERROR"
  | "UNKNOWN";

export function mapSubmissionStatus(statusCode: number): SubmissionStatus {
  switch (statusCode) {
    case 10:
      return "ACCEPTED";

    case 11:
      return "WRONG_ANSWER";

    case 14:
      return "TIME_LIMIT_EXCEEDED";

    case 12:
      return "MEMORY_LIMIT_EXCEEDED";

    case 13:
      return "RUNTIME_ERROR";

    case 20:
      return "COMPILE_ERROR";

    default:
      return "UNKNOWN";
  }
}
