import { prisma } from "@/lib/db/prisma";
import {
  createApproachSchema,
  updateApproachSchema,
} from "@/lib/validation/approaches";

export async function createApproach(userId: string, input: unknown) {
  const data = createApproachSchema.parse(input);

  return prisma.approach.create({
    data: {
      ...data,
      userId,
    },
  });
}

export async function getApproaches(userId: string, problemId: string) {
  return prisma.approach.findMany({
    where: {
      problemId,
      userId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getApproach(userId: string, id: string) {
  return prisma.approach.findFirst({
    where: {
      id,
      userId,
    },
  });
}

export async function updateApproach(
  userId: string,
  id: string,
  input: unknown,
) {
  const data = updateApproachSchema.parse(input);

  const existing = await prisma.approach.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!existing) {
    throw new Error("Approach not found or unauthorized");
  }

  return prisma.approach.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteApproach(userId: string, id: string) {
  const existing = await prisma.approach.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!existing) {
    throw new Error("Approach not found or unauthorized");
  }

  return prisma.approach.delete({
    where: {
      id,
    },
  });
}

