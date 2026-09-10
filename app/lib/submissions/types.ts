import { SubmissionStatus } from "../generated/prisma/enums";

export interface SubmissionImportInput {
  externalId: string;
  problemSlug: string;
  status: SubmissionStatus;
  language: string;
  code?: string;
  runtimeMs?: number;
  memoryBytes?: number;
  submittedAt?: Date;
}

export interface SubmissionImportResult {
  submissionId: string;
  created: boolean;
}
