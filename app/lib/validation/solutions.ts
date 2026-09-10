import { z } from "zod";

export const createSolutionSchema = z.object({
  approachId: z.string().min(1),
  name: z.string().trim().min(1),
  description: z.string().optional(),
  algorithm: z.string().optional(),
  notes: z.string().optional(),
});

export const updateSolutionSchema = createSolutionSchema
  .omit({
    approachId: true,
  })
  .partial()
  .extend({
    name: z.string().trim().min(1).optional(),
  });

export type CreateSolutionInput = z.infer<typeof createSolutionSchema>;

export type UpdateSolutionInput = z.infer<typeof updateSolutionSchema>;
