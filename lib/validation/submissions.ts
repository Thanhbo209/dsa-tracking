import { z } from "zod";

const submissionStatuses = [
  "ACCEPTED",
  "WRONG_ANSWER",
  "TIME_LIMIT_EXCEEDED",
  "MEMORY_LIMIT_EXCEEDED",
  "RUNTIME_ERROR",
  "COMPILE_ERROR",
  "UNKNOWN",
] as const;

export const submissionImportSchema = z.object({
  externalId: z.string().min(1),
  problemSlug: z.string().min(1),
  status: z.enum(submissionStatuses),
  language: z.string().min(1),
  code: z.string().optional(),
  runtimeMs: z.number().int().nonnegative().optional(),
  memoryBytes: z.number().int().nonnegative().optional(),
  submittedAt: z.coerce.date().optional(),
});

export type SubmissionImportInput = z.infer<typeof submissionImportSchema>;
