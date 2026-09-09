import { prisma } from "@/lib/db/prisma";
import {
  createApproachSchema,
  updateApproachSchema,
} from "@/lib/validation/approaches";

export async function createApproach(input: unknown) {
  const data = createApproachSchema.parse(input);

  return prisma.approach.create({
    data,
  });
}

export async function getApproaches(problemId: string) {
  return prisma.approach.findMany({
    where: {
      problemId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getApproach(id: string) {
  return prisma.approach.findUnique({
    where: {
      id,
    },
  });
}

export async function updateApproach(id: string, input: unknown) {
  const data = updateApproachSchema.parse(input);

  return prisma.approach.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteApproach(id: string) {
  return prisma.approach.delete({
    where: {
      id,
    },
  });
}
