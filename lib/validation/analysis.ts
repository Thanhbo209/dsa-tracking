import { z } from "zod";

export const problemDifficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);

export const submissionStatusEnum = z.enum([
  "ACCEPTED",
  "WRONG_ANSWER",
  "TIME_LIMIT_EXCEEDED",
  "MEMORY_LIMIT_EXCEEDED",
  "RUNTIME_ERROR",
  "COMPILE_ERROR",
  "UNKNOWN",
]);

// ── AI Analysis Input Contract ──────────────────────────────────────────

export const aiProblemInputSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  difficulty: problemDifficultyEnum.nullable(),
  description: z.string().nullable(),
  topics: z.array(z.string().trim().min(1)),
});

export const aiSubmissionInputSchema = z.object({
  id: z.string().min(1),
  status: submissionStatusEnum,
  language: z.string().trim().min(1),
  code: z.string().min(1), // Primary evidence for the AI
  runtimeMs: z.number().int().nonnegative().nullable(),
  memoryBytes: z.number().int().nonnegative().nullable(),
  submittedAt: z.coerce.date().nullable(),
});

export const aiExistingKnowledgeSummarySchema = z.object({
  approaches: z.array(
    z.object({
      name: z.string().trim().min(1),
      solutions: z.array(z.string().trim().min(1)),
    }),
  ),
});

export const aiAnalysisInputSchema = z.object({
  problem: aiProblemInputSchema,
  submission: aiSubmissionInputSchema,
  existingKnowledgeSummary: aiExistingKnowledgeSummarySchema.optional(),
});

// ── AI Analysis Output Contract ─────────────────────────────────────────

export const complexityAnalysisSchema = z.object({
  value: z.string().trim().min(1),
  explanation: z.string().trim().min(1),
  reasoning: z.array(z.string().trim().min(1)).min(1),
});

export const actualApproachSchema = z.object({
  name: z.string().trim().min(1),
  coreIdea: z.string().trim().min(1),
  explanation: z.string().trim().min(1),
});

export const actualSolutionSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  algorithm: z.string().trim().min(1),
});

export const aiReviewSchema = z.object({
  actualApproach: actualApproachSchema,
  actualSolution: actualSolutionSchema,
  summary: z.string().trim().min(1),
  isCorrect: z.boolean(),
  timeComplexity: complexityAnalysisSchema,
  spaceComplexity: complexityAnalysisSchema,
  strengths: z.array(z.string().trim().min(1)),
  mistakes: z.array(z.string().trim().min(1)),
  conceptGaps: z.array(z.string().trim().min(1)),
  missedEdgeCases: z.array(z.string().trim().min(1)),
  improvementSuggestions: z.array(z.string().trim().min(1)),
  learningTakeaways: z.array(z.string().trim().min(1)),
});

export const aiDraftApproachSchema = z.object({
  name: z.string().trim().min(1),
  coreIdea: z.string().trim().min(1),
  whyItWorks: z.string().optional().or(z.literal("")),
  whenToUse: z.string().optional().or(z.literal("")),
  timeComplexity: z.string().trim().min(1),
  spaceComplexity: z.string().trim().min(1),
  pros: z.string().optional().or(z.literal("")),
  cons: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
  mistakes: z.string().optional(),
});

export const aiDraftSolutionSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().optional().or(z.literal("")),
  algorithm: z.string(),
  notes: z.string().optional(),
});

export const aiDraftCodeSchema = z.object({
  language: z.string().trim().min(1),
  code: z.string().min(1),
  notes: z.string().optional(),
});

export const aiDraftSchema = z.object({
  approach: aiDraftApproachSchema,
  solution: aiDraftSolutionSchema,
  code: aiDraftCodeSchema,
});

export const aiRecommendationSchema = z.object({
  available: z.boolean(),
  reason: z.string().optional(),
  approach: aiDraftApproachSchema.optional(),
  solution: aiDraftSolutionSchema.optional(),
  code: aiDraftCodeSchema.optional(),
});

export const aiAnalysisOutputSchema = z.object({
  review: aiReviewSchema,
  recommendation: aiRecommendationSchema,
  // Optional draft field for backward compatibility with older callers/tests
  draft: aiDraftSchema.optional(),
});

// ── Inferred TypeScript Types ───────────────────────────────────────────

export type ProblemDifficulty = z.infer<typeof problemDifficultyEnum>;
export type SubmissionStatus = z.infer<typeof submissionStatusEnum>;

export type AiProblemInput = z.infer<typeof aiProblemInputSchema>;
export type AiSubmissionInput = z.infer<typeof aiSubmissionInputSchema>;
export type AiExistingKnowledgeSummary = z.infer<
  typeof aiExistingKnowledgeSummarySchema
>;
export type AiAnalysisInput = z.infer<typeof aiAnalysisInputSchema>;

export type ComplexityAnalysis = z.infer<typeof complexityAnalysisSchema>;
export type ActualApproach = z.infer<typeof actualApproachSchema>;
export type ActualSolution = z.infer<typeof actualSolutionSchema>;
export type AiReview = z.infer<typeof aiReviewSchema>;
export type AiDraftApproach = z.infer<typeof aiDraftApproachSchema>;
export type AiDraftSolution = z.infer<typeof aiDraftSolutionSchema>;
export type AiDraftCode = z.infer<typeof aiDraftCodeSchema>;
export type AiDraft = z.infer<typeof aiDraftSchema>;
export type AiRecommendation = z.infer<typeof aiRecommendationSchema>;
export type AiAnalysisOutput = z.infer<typeof aiAnalysisOutputSchema>;
