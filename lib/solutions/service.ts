import { prisma } from "@/lib/db/prisma";
import {
  createSolutionSchema,
  updateSolutionSchema,
} from "@/lib/validation/solutions";

export async function createSolution(userId: string, input: unknown) {
  const data = createSolutionSchema.parse(input);

  const approach = await prisma.approach.findFirst({
    where: {
      id: data.approachId,
      userId,
    },
  });

  if (!approach) {
    throw new Error("Approach not found or unauthorized");
  }

  return prisma.solution.create({
    data,
  });
}

export async function getSolutions(userId: string, approachId: string) {
  const approach = await prisma.approach.findFirst({
    where: {
      id: approachId,
      userId,
    },
  });

  if (!approach) {
    return [];
  }

  return prisma.solution.findMany({
    where: {
      approachId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getSolution(userId: string, id: string) {
  return prisma.solution.findFirst({
    where: {
      id,
      approach: {
        userId,
      },
    },
  });
}

export async function updateSolution(
  userId: string,
  id: string,
  input: unknown,
) {
  const data = updateSolutionSchema.parse(input);

  const existing = await prisma.solution.findFirst({
    where: {
      id,
      approach: {
        userId,
      },
    },
  });

  if (!existing) {
    throw new Error("Solution not found or unauthorized");
  }

  return prisma.solution.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteSolution(userId: string, id: string) {
  const existing = await prisma.solution.findFirst({
    where: {
      id,
      approach: {
        userId,
      },
    },
  });

  if (!existing) {
    throw new Error("Solution not found or unauthorized");
  }

  return prisma.solution.delete({
    where: {
      id,
    },
  });
}

