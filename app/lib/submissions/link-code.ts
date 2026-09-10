import { prisma } from "@/lib/db/prisma";

export async function linkSubmissionToCode(
  submissionId: string,
  codeId: string | null,
) {
  if (codeId) {
    const code = await prisma.code.findUnique({
      where: {
        id: codeId,
      },
      select: {
        id: true,
        solution: {
          select: {
            approach: {
              select: {
                problemId: true,
              },
            },
          },
        },
      },
    });

    if (!code) {
      throw new Error("Code not found");
    }

    const submission = await prisma.submission.findUnique({
      where: {
        id: submissionId,
      },
      select: {
        problemId: true,
      },
    });

    if (!submission) {
      throw new Error("Submission not found");
    }

    if (code.solution.approach.problemId !== submission.problemId) {
      throw new Error("Code does not belong to the submission's problem");
    }
  }

  return prisma.submission.update({
    where: {
      id: submissionId,
    },
    data: {
      codeId,
    },
  });
}
