import { prisma } from "@/lib/db/prisma";
import { submissionImportSchema } from "@/lib/validation/submissions";
import type { SubmissionImportResult } from "./types";
import { syncProblem } from "@/lib/leetcode/sync";

export async function importSubmission(
  input: unknown,
): Promise<SubmissionImportResult> {
  const data = submissionImportSchema.parse(input);

  let problem = await prisma.problem.findUnique({
    where: {
      slug: data.problemSlug,
    },
    select: {
      id: true,
    },
  });

  if (!problem) {
    const syncedProblem = await syncProblem(data.problemSlug);

    problem = {
      id: syncedProblem.id,
    };
  }

  const existing = await prisma.submission.findUnique({
    where: {
      source_externalId: {
        source: "LEETCODE",
        externalId: data.externalId,
      },
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    return {
      submissionId: existing.id,
      created: false,
    };
  }

  const submission = await prisma.submission.create({
    data: {
      problemId: problem.id,
      source: "LEETCODE",
      externalId: data.externalId,
      status: data.status,
      language: data.language,
      code: data.code,
      runtimeMs: data.runtimeMs,
      memoryBytes: data.memoryBytes,
      submittedAt: data.submittedAt,
    },
    select: {
      id: true,
    },
  });

  return {
    submissionId: submission.id,
    created: true,
  };
}
