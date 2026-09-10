import { prisma } from "@/lib/db/prisma";
import {
  createSolutionSchema,
  updateSolutionSchema,
} from "@/lib/validation/solutions";

export async function createSolution(input: unknown) {
  const data = createSolutionSchema.parse(input);

  return prisma.solution.create({
    data,
  });
}

export async function getSolutions(approachId: string) {
  return prisma.solution.findMany({
    where: {
      approachId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getSolution(id: string) {
  return prisma.solution.findUnique({
    where: {
      id,
    },
  });
}

export async function updateSolution(id: string, input: unknown) {
  const data = updateSolutionSchema.parse(input);

  return prisma.solution.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteSolution(id: string) {
  return prisma.solution.delete({
    where: {
      id,
    },
  });
}
