import { z } from "zod";

export const linkSubmissionCodeSchema = z.object({
  codeId: z.string().min(1).nullable(),
});

export type LinkSubmissionCodeInput = z.infer<typeof linkSubmissionCodeSchema>;
