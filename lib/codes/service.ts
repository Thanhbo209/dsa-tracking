import { prisma } from "@/lib/db/prisma";
import { createCodeSchema, updateCodeSchema } from "@/lib/validation/codes";

export async function createCode(userId: string, input: unknown) {
  const data = createCodeSchema.parse(input);

  const solution = await prisma.solution.findFirst({
    where: {
      id: data.solutionId,
      approach: {
        userId,
      },
    },
  });

  if (!solution) {
    throw new Error("Solution not found or unauthorized");
  }

  return prisma.code.create({
    data,
  });
}

export async function getCodes(userId: string, solutionId: string) {
  const solution = await prisma.solution.findFirst({
    where: {
      id: solutionId,
      approach: {
        userId,
      },
    },
  });

  if (!solution) {
    return [];
  }

  return prisma.code.findMany({
    where: { solutionId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getCode(userId: string, id: string) {
  return prisma.code.findFirst({
    where: {
      id,
      solution: {
        approach: {
          userId,
        },
      },
    },
  });
}

export async function updateCode(userId: string, id: string, input: unknown) {
  const data = updateCodeSchema.parse(input);

  const existing = await prisma.code.findFirst({
    where: {
      id,
      solution: {
        approach: {
          userId,
        },
      },
    },
  });

  if (!existing) {
    throw new Error("Code not found or unauthorized");
  }

  return prisma.code.update({
    where: { id },
    data,
  });
}

export async function deleteCode(userId: string, id: string) {
  const existing = await prisma.code.findFirst({
    where: {
      id,
      solution: {
        approach: {
          userId,
        },
      },
    },
  });

  if (!existing) {
    throw new Error("Code not found or unauthorized");
  }

  return prisma.code.delete({
    where: { id },
  });
}

