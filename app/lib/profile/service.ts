import { prisma } from "@/lib/db/prisma";

export interface PublicUserProfile {
  user: {
    name: string;
    username: string;
    displayUsername: string | null;
    bio: string | null;
    image: string | null;
    createdAt: string;
  };
  stats: {
    approachCount: number;
    solutionCount: number;
    codeCount: number;
    problemCount: number;
  };
  approaches: Array<{
    id: string;
    name: string;
    coreIdea: string | null;
    whyItWorks: string | null;
    whenToUse: string | null;
    timeComplexity: string | null;
    spaceComplexity: string | null;
    pros: string | null;
    cons: string | null;
    notes: string | null;
    mistakes: string | null;
    createdAt: string;
    problem: {
      slug: string;
      title: string;
      leetcodeId: number | null;
      difficulty: string | null;
      topics: string[];
    };
    solutions: Array<{
      id: string;
      name: string;
      description: string | null;
      algorithm: string | null;
      notes: string | null;
      codes: Array<{
        id: string;
        language: string;
        code: string;
        notes: string | null;
      }>;
    }>;
  }>;
}

/**
 * Isolated query for public profile knowledge.
 * Strictest privacy boundary:
 * NEVER queries or returns Submission, SubmissionAnalysis, runtime, memory, or draft data.
 */
export async function getPublicUserProfile(
  username: string,
): Promise<PublicUserProfile | null> {
  const normalizedUsername = username.trim().toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: normalizedUsername },
        { username: username.trim() },
      ],
    },
    select: {
      id: true,
      name: true,
      username: true,
      displayUsername: true,
      bio: true,
      image: true,
      createdAt: true,
    },
  });

  if (!user || !user.username) {
    return null;
  }

  const approaches = await prisma.approach.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      coreIdea: true,
      whyItWorks: true,
      whenToUse: true,
      timeComplexity: true,
      spaceComplexity: true,
      pros: true,
      cons: true,
      notes: true,
      mistakes: true,
      createdAt: true,
      problem: {
        select: {
          slug: true,
          title: true,
          leetcodeId: true,
          difficulty: true,
          topics: {
            select: {
              topic: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      solutions: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          name: true,
          description: true,
          algorithm: true,
          notes: true,
          codes: {
            orderBy: {
              createdAt: "asc",
            },
            select: {
              id: true,
              language: true,
              code: true,
              notes: true,
            },
          },
        },
      },
    },
  });

  const solutionCount = approaches.reduce(
    (acc, a) => acc + a.solutions.length,
    0,
  );
  const codeCount = approaches.reduce(
    (acc, a) =>
      acc + a.solutions.reduce((sub, s) => sub + s.codes.length, 0),
    0,
  );
  const uniqueProblems = new Set(approaches.map((a) => a.problem.slug));

  return {
    user: {
      name: user.name,
      username: user.username,
      displayUsername: user.displayUsername,
      bio: user.bio,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
    },
    stats: {
      approachCount: approaches.length,
      solutionCount,
      codeCount,
      problemCount: uniqueProblems.size,
    },
    approaches: approaches.map((a) => ({
      id: a.id,
      name: a.name,
      coreIdea: a.coreIdea,
      whyItWorks: a.whyItWorks,
      whenToUse: a.whenToUse,
      timeComplexity: a.timeComplexity,
      spaceComplexity: a.spaceComplexity,
      pros: a.pros,
      cons: a.cons,
      notes: a.notes,
      mistakes: a.mistakes,
      createdAt: a.createdAt.toISOString(),
      problem: {
        slug: a.problem.slug,
        title: a.problem.title,
        leetcodeId: a.problem.leetcodeId,
        difficulty: a.problem.difficulty,
        topics: a.problem.topics.map((t) => t.topic.name),
      },
      solutions: a.solutions.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        algorithm: s.algorithm,
        notes: s.notes,
        codes: s.codes,
      })),
    })),
  };
}
