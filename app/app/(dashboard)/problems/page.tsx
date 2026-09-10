import { prisma } from "@/lib/db/prisma";
import {
  ProblemsExplorer,
  type ProblemExplorerItem,
  type ProblemStatus,
} from "@/components/problems/ProblemsExplorer";

export default async function ProblemsPage() {
  const rawProblems = await prisma.problem.findMany({
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
        select: {
          status: true,
        },
      },
      approaches: {
        select: {
          id: true,
        },
      },
    },
  });

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

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Problems
        </h1>
        <p className="text-sm text-zinc-400">
          Practice library, historical attempts, and permanent algorithmic knowledge.
        </p>
      </div>

      <ProblemsExplorer problems={problems} />
    </main>
  );
}
