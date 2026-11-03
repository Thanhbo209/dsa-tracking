import { SerializedSubmissionAnalysis } from "./analysis";

export interface WorkspaceSubmission {
  id: string;
  externalId?: string | null;
  status: string;
  language: string;
  runtimeMs: number | null;
  memoryBytes: bigint | number | null;
  submittedAt: Date | string | null;
  code: string | null;
  analyses: SerializedSubmissionAnalysis[];
}

export type WorkspaceTab = "knowledge" | "analysis" | "submissions";
