import { prisma } from "@/lib/db/prisma";
import { getProblemBySlug } from "./client";
import { normalizeProblem } from "./normalizer";

export async function syncProblem(slug: string) {
  const response = await getProblemBySlug(slug);
  const problem = normalizeProblem(response);

  return prisma.problem.upsert({
    where: {
      slug: problem.slug,
    },
    create: {
      leetcodeId: problem.leetcodeId,
      slug: problem.slug,
      title: problem.title,
      difficulty: problem.difficulty,
      url: problem.url,
      description: problem.description,
      topics: {
        create: problem.topics.map((topic) => ({
          topic: {
            connectOrCreate: {
              where: {
                slug: topic.slug,
              },
              create: {
                name: topic.name,
                slug: topic.slug,
              },
            },
          },
        })),
      },
    },
    update: {
      title: problem.title,
      difficulty: problem.difficulty,
      url: problem.url,
      description: problem.description,
      topics: {
        deleteMany: {},
        create: problem.topics.map((topic) => ({
          topic: {
            connectOrCreate: {
              where: {
                slug: topic.slug,
              },
              create: {
                name: topic.name,
                slug: topic.slug,
              },
            },
          },
        })),
      },
    },
    include: {
      topics: {
        include: {
          topic: true,
        },
      },
    },
  });
}
