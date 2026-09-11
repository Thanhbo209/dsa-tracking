import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { aggregateDailyActivities } from "@/lib/activity/streak";
import {
  ProblemsExplorer,
  type ProblemExplorerItem,
  type ProblemStatus,
} from "@/components/problems/ProblemsExplorer";

export const metadata: Metadata = {
  title: "Problems",
  description: "Explore, practice, and master Data Structures and Algorithms.",
};

export default async function ProblemsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/problems");
  }

  const [rawProblems, userSubmissions, userApproaches, dailyActivities, dbUser] =
    await Promise.all([
      prisma.problem.findMany({
        orderBy: {
          leetcodeId: "asc",
        },
        include: {
          topics: {
            include: {
              topic: true,
            },
          },
          submissions: {
            where: {
              userId: user.id,
            },
            select: {
              status: true,
            },
          },
          approaches: {
            where: {
              userId: user.id,
            },
            select: {
              id: true,
            },
          },
        },
      }),
      prisma.submission.findMany({
        where: {
          userId: user.id,
          status: "ACCEPTED",
        },
        select: {
          submittedAt: true,
          createdAt: true,
        },
      }),
      prisma.approach.findMany({
        where: {
          userId: user.id,
        },
        select: {
          createdAt: true,
        },
      }),
      prisma.dailyActivity.findMany({
        where: {
          userId: user.id,
        },
        select: {
          date: true,
          count: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          lastSyncedAt: true,
          leetcodeUsername: true,
        },
      }),
    ]);

  const localSubmissionActivities = aggregateDailyActivities(
    userSubmissions.map((s) => s.submittedAt || s.createdAt),
  );

  // Merge calendar daily activities with local submission activity (monotonic max)
  const submissionActivities: Record<string, number> = {
    ...localSubmissionActivities,
  };
  for (const act of dailyActivities) {
    submissionActivities[act.date] = Math.max(
      submissionActivities[act.date] || 0,
      act.count,
    );
  }

  const approachActivities = aggregateDailyActivities(
    userApproaches.map((a) => a.createdAt),
  );

  const problems: ProblemExplorerItem[] = rawProblems.map((p) => {
    const isSolved = p.submissions.some((s) => s.status === "ACCEPTED");
    const isAttempted = !isSolved && p.submissions.length > 0;
    const status: ProblemStatus = isSolved
      ? "SOLVED"
      : isAttempted
        ? "ATTEMPTED"
        : "TODO";

    return {
      id: p.id,
      slug: p.slug,
      leetcodeId: p.leetcodeId,
      title: p.title,
      difficulty: p.difficulty,
      topics: p.topics.map((t) => t.topic.name),
      status,
      approachCount: p.approaches.length,
      updatedAt: p.updatedAt.toISOString(),
    };
  });

  // Distinct topics solved by the user with problem count, sorted by count desc
  const topicSolvedCounts = new Map<string, number>();
  for (const p of problems) {
    if (p.status === "SOLVED") {
      for (const topicName of p.topics) {
        topicSolvedCounts.set(
          topicName,
          (topicSolvedCounts.get(topicName) ?? 0) + 1,
        );
      }
    }
  }

  const solvedTopics = Array.from(topicSolvedCounts.entries())
    .map(([topicName, solvedCount]) => ({ topicName, solvedCount }))
    .sort((a, b) =>
      b.solvedCount !== a.solvedCount
        ? b.solvedCount - a.solvedCount
        : a.topicName.localeCompare(b.topicName),
    );

  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Problems
        </h1>
        <p className="text-sm text-zinc-400">
          Practice library, historical attempts, and permanent algorithmic knowledge.
        </p>
      </div>

      <ProblemsExplorer
        problems={problems}
        submissionActivities={submissionActivities}
        approachActivities={approachActivities}
        solvedTopics={solvedTopics}
        lastSyncedAt={dbUser?.lastSyncedAt?.toISOString() ?? null}
        leetcodeUsername={dbUser?.leetcodeUsername ?? null}
      />
    </main>
  );
}

