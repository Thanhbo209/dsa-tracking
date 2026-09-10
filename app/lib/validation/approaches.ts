import { z } from "zod";

export const createApproachSchema = z.object({
  problemId: z.string().min(1),
  name: z.string().trim().min(1),
  coreIdea: z.string().optional(),
  whyItWorks: z.string().optional(),
  whenToUse: z.string().optional(),
  timeComplexity: z.string().trim().optional(),
  spaceComplexity: z.string().trim().optional(),
  pros: z.string().optional(),
  cons: z.string().optional(),
  notes: z.string().optional(),
  mistakes: z.string().optional(),
});

export const updateApproachSchema = createApproachSchema
  .omit({
    problemId: true,
  })
  .partial()
  .extend({
    name: z.string().trim().min(1).optional(),
  });

export type CreateApproachInput = z.infer<typeof createApproachSchema>;

export type UpdateApproachInput = z.infer<typeof updateApproachSchema>;
