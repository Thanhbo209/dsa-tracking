import { prisma } from "@/lib/db/prisma";
import type { CreateApproachInput, UpdateApproachInput } from "./types";

export async function createApproach(input: CreateApproachInput) {
  return prisma.approach.create({
    data: {
      problemId: input.problemId,
      name: input.name,
      coreIdea: input.coreIdea,
      algorithm: input.algorithm,
      whyItWorks: input.whyItWorks,
      whenToUse: input.whenToUse,
      timeComplexity: input.timeComplexity,
      spaceComplexity: input.spaceComplexity,
      pros: input.pros,
      cons: input.cons,
      notes: input.notes,
      mistakes: input.mistakes,
    },
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

export async function updateApproach(id: string, input: UpdateApproachInput) {
  return prisma.approach.update({
    where: {
      id,
    },
    data: input,
  });
}

export async function deleteApproach(id: string) {
  return prisma.approach.delete({
    where: {
      id,
    },
  });
}
