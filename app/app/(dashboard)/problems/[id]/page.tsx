import { notFound } from "next/navigation";

import { prisma } from "@/lib/db/prisma";

interface ProblemPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { id } = await params;

  const problem = await prisma.problem.findUnique({
    where: {
      slug: id,
    },
    include: {
      topics: {
        include: {
          topic: true,
        },
      },
      submissions: {
        orderBy: {
          submittedAt: "desc",
        },
      },
    },
  });

  if (!problem) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">
          LeetCode #{problem.leetcodeId}
        </p>

        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-3xl font-bold">{problem.title}</h1>

          {problem.difficulty && (
            <span className="rounded-full border px-3 py-1 text-sm">
              {problem.difficulty}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {problem.topics.map(({ topic }) => (
            <span
              key={topic.id}
              className="rounded-full bg-muted px-3 py-1 text-sm"
            >
              {topic.name}
            </span>
          ))}
        </div>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold">Description</h2>

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: problem.description ?? "No description available.",
          }}
        />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Submissions</h2>

          <span className="text-sm text-muted-foreground">
            {problem.submissions.length} total
          </span>
        </div>

        <div className="space-y-3">
          {problem.submissions.map((submission) => (
            <div key={submission.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {submission.status.replaceAll("_", " ")}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {submission.language}
                  </p>
                </div>

                <div className="text-right text-sm text-muted-foreground">
                  <p>
                    {submission.runtimeMs != null
                      ? `${submission.runtimeMs} ms`
                      : "N/A"}
                  </p>

                  <p>
                    {submission.memoryBytes != null
                      ? `${Math.round(
                          Number(submission.memoryBytes) / 1024 / 1024,
                        )} MB`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
