export interface CapturedSubmission {
  externalId: string;
  problemSlug: string;
  problemTitle?: string;
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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
}

export type ExtensionMessage =
  | { type: "SUBMISSION_CAPTURED"; payload: CapturedSubmission }
  | { type: "GET_SUBMISSIONS" }
  | { type: "CHECK_AUTH" }
  | { type: "LOGIN"; payload: { email: string; password: string } }
  | { type: "LOGOUT" }
  | { type: "IMPORT_SUBMISSION"; payload: CapturedSubmission }
  | { type: "CLEAR_SUBMISSIONS" };

