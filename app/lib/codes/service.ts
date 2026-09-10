import { prisma } from "@/lib/db/prisma";
import { createCodeSchema, updateCodeSchema } from "@/lib/validation/codes";

export async function createCode(input: unknown) {
  const data = createCodeSchema.parse(input);

  return prisma.code.create({
    data,
  });
}

export async function getCodes(solutionId: string) {
  return prisma.code.findMany({
    where: { solutionId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getCode(id: string) {
  return prisma.code.findUnique({
    where: { id },
  });
}

export async function updateCode(id: string, input: unknown) {
  const data = updateCodeSchema.parse(input);

  return prisma.code.update({
    where: { id },
    data,
  });
}

export async function deleteCode(id: string) {
  return prisma.code.delete({
    where: { id },
  });
}
