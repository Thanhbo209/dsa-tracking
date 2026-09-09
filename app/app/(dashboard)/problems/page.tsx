import Link from "next/link";

import { prisma } from "@/lib/db/prisma";

export default async function ProblemsPage() {
  const problems = await prisma.problem.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Problems</h1>
        <p className="mt-2 text-muted-foreground">
          {problems.length} problems tracked
        </p>
      </div>

      <div className="space-y-3">
        {problems.map((problem) => (
          <Link
            key={problem.id}
            href={`/problems/${problem.slug}`}
            className="block rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  LeetCode #{problem.leetcodeId}
                </p>

                <h2 className="mt-1 font-semibold">{problem.title}</h2>
              </div>

              {problem.difficulty && (
                <span className="rounded-full border px-3 py-1 text-sm">
                  {problem.difficulty}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
