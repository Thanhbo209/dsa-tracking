import { z } from "zod";

export const createCodeSchema = z.object({
  solutionId: z.string().min(1),
  language: z.string().trim().min(1),
  code: z.string().min(1),
  notes: z.string().optional(),
});

export const updateCodeSchema = createCodeSchema
  .omit({
    solutionId: true,
  })
  .partial()
  .extend({
    language: z.string().trim().min(1).optional(),
    code: z.string().min(1).optional(),
  });

export type CreateCodeInput = z.infer<typeof createCodeSchema>;
export type UpdateCodeInput = z.infer<typeof updateCodeSchema>;
