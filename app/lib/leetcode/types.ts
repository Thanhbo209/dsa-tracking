export interface LeetCodeTopic {
  id: string;
  name: string;
  slug: string;
}

export interface LeetCodeProblem {
  leetcodeId: number;
  slug: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  url: string;
  description?: string;
  topics: LeetCodeTopic[];
}

export interface LeetCodeProblemResponse {
  question: {
    questionId: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    titleSlug: string;
    content: string | null;
    topicTags: LeetCodeTopic[];
  } | null;
}

export type LeetCodeSubmissionStatus =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "MEMORY_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "COMPILE_ERROR"
  | "UNKNOWN";

export interface LeetCodeSubmission {
  externalId: string;
  problem: LeetCodeProblem;
  status: LeetCodeSubmissionStatus;
  language: string;
  code?: string;
  runtimeMs?: number;
  memoryBytes?: number;
  submittedAt?: Date;
}

export class LeetCodeRateLimitError extends Error {
  public statusCode: number;
  public retryAfterMs?: number;

  constructor(message = "LeetCode rate limit reached. Please wait a few moments before trying again.", retryAfterMs?: number) {
    super(message);
    this.name = "LeetCodeRateLimitError";
    this.statusCode = 429;
    this.retryAfterMs = retryAfterMs;
  }
}

