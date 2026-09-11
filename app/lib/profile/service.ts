import { prisma } from "@/lib/db/prisma";

// ── Shared user shape used by both queries ────────────────────────────────────

export interface PublicUserBasic {
  name: string;
  username: string;
  displayUsername: string | null;
  bio: string | null;
  image: string | null;
  createdAt: string;
}

// ── List-page types ───────────────────────────────────────────────────────────

export interface PublicVaultProblem {
  slug: string;
  title: string;
  leetcodeId: number | null;
  difficulty: string | null;
  topics: string[];
  /** Number of approaches this user has for this problem */
  approachCount: number;
}

export interface PublicUserProfile {
  user: PublicUserBasic;
  stats: {
    approachCount: number;
    solutionCount: number;
    codeCount: number;
    problemCount: number;
  };
  /** Lean problem list — NO approach/solution/code data */
  problems: PublicVaultProblem[];
}

// ── Detail-page types ─────────────────────────────────────────────────────────

export interface PublicProblemDetail {
  user: Pick<PublicUserBasic, "name" | "username" | "displayUsername">;
  problem: {
    slug: string;
    title: string;
    leetcodeId: number | null;
    difficulty: string | null;
    url: string | null;
    description: string | null;
    topics: string[];
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

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Lightweight query for the list page.
 * Returns user + stats + distinct problem previews.
 * Does NOT eager-join solutions or codes — those are fetched on the detail page.
 *
 * Privacy note: NEVER returns Submission, SubmissionAnalysis, runtime, memory,
 * or draft data.
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

  // Fetch all approaches for stats, but only the minimum fields needed for
  // the problem list (no solutions/codes joined here).
  const approaches = await prisma.approach.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      solutions: {
        select: {
          id: true,
          codes: { select: { id: true } },
        },
      },
      problem: {
        select: {
          slug: true,
          title: true,
          leetcodeId: true,
          difficulty: true,
          topics: {
            select: { topic: { select: { name: true } } },
          },
        },
      },
    },
  });

  // Aggregate stats
  const solutionCount = approaches.reduce(
    (acc, a) => acc + a.solutions.length,
    0,
  );
  const codeCount = approaches.reduce(
    (acc, a) =>
      acc + a.solutions.reduce((sub, s) => sub + s.codes.length, 0),
    0,
  );

  // Build lean problem list: one entry per distinct problem, preserving
  // insertion order of first encounter (approaches are ordered newest-first).
  const problemMap = new Map<string, PublicVaultProblem>();
  for (const a of approaches) {
    const { slug, title, leetcodeId, difficulty, topics } = a.problem;
    const existing = problemMap.get(slug);
    if (existing) {
      existing.approachCount += 1;
    } else {
      problemMap.set(slug, {
        slug,
        title,
        leetcodeId,
        difficulty,
        topics: topics.map((t) => t.topic.name),
        approachCount: 1,
      });
    }
  }

  const problems = Array.from(problemMap.values());

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
      problemCount: problems.length,
    },
    problems,
  };
}

/**
 * Full nested query for the detail page — ONE problem, ONE user.
 *
 * Returns null if:
 *  - the user doesn't exist, OR
 *  - the problem slug doesn't exist, OR
 *  - THIS USER has no Approach linked to this problem
 *    (even if the Problem row exists globally in the DB).
 *
 * The caller must call notFound() on null to avoid leaking the existence
 * of problems that this user hasn't added to their vault.
 */
export async function getPublicProblemDetail(
  username: string,
  problemSlug: string,
): Promise<PublicProblemDetail | null> {
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
    },
  });

  if (!user || !user.username) {
    return null;
  }

  // Scope the problem lookup to only problems this user has approaches for.
  // We join through Approach so that a problem slug that exists globally but
  // has no user-owned approach returns zero rows → 404.
  const approaches = await prisma.approach.findMany({
    where: {
      userId: user.id,
      problem: { slug: problemSlug },
    },
    orderBy: { createdAt: "asc" },
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
      problem: {
        select: {
          slug: true,
          title: true,
          leetcodeId: true,
          difficulty: true,
          url: true,
          description: true,
          topics: {
            select: { topic: { select: { name: true } } },
          },
        },
      },
      solutions: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          algorithm: true,
          notes: true,
          codes: {
            orderBy: { createdAt: "asc" },
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

  // If no approaches → this user has no vault entry for this slug → 404
  if (approaches.length === 0) {
    return null;
  }

  // All approaches share the same problem (same slug), take metadata from first
  const problemMeta = approaches[0].problem;

  return {
    user: {
      name: user.name,
      username: user.username,
      displayUsername: user.displayUsername,
    },
    problem: {
      slug: problemMeta.slug,
      title: problemMeta.title,
      leetcodeId: problemMeta.leetcodeId,
      difficulty: problemMeta.difficulty,
      url: problemMeta.url,
      description: problemMeta.description,
      topics: problemMeta.topics.map((t) => t.topic.name),
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
