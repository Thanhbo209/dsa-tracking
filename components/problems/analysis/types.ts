import type { AiReview, AiDraft, AiRecommendation } from "@/lib/validation/analysis";

export type AnalysisStatus =
  | "GENERATING"
  | "DRAFT_READY"
  | "ACCEPTED"
  | "REJECTED"
  | "FAILED";

export interface SerializedSubmissionAnalysis {
  id: string;
  submissionId: string;
  status: AnalysisStatus;
  modelName: string | null;
  review: AiReview | null;
  draft: (AiRecommendation & Partial<AiDraft>) | AiDraft | null;
  errorMessage: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}
