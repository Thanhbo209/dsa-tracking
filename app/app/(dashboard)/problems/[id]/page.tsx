import { notFound } from "next/navigation";
import { SubmissionCard } from "@/components/problems/SubmissionCard";
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
            <SubmissionCard
              key={submission.id}
              status={submission.status}
              language={submission.language}
              runtimeMs={submission.runtimeMs}
              memoryBytes={submission.memoryBytes}
              submittedAt={submission.submittedAt}
              code={submission.code}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
