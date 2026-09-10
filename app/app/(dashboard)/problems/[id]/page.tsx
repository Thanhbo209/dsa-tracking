import { notFound } from "next/navigation";
import { SubmissionCard } from "@/components/problems/SubmissionCard";
import { KnowledgeWorkspace } from "@/components/problems/knowledge/KnowledgeWorkspace";
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
        include: {
          analyses: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
      approaches: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          solutions: {
            orderBy: {
              createdAt: "asc",
            },
            include: {
              codes: {
                orderBy: {
                  createdAt: "asc",
                },
              },
            },
          },
        },
      },
    },
  });

  if (!problem) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      {/* ── Problem Header ──────────────────────────────────────── */}
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

      {/* ── Description ─────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold">Description</h2>

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: problem.description ?? "No description available.",
          }}
        />
      </section>

      {/* ══ YOUR KNOWLEDGE ══════════════════════════════════════════ */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Your Knowledge</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Approaches, solutions, and canonical code you have intentionally
            organized and understood.
          </p>
        </div>

        <KnowledgeWorkspace
          problemId={problem.id}
          approaches={problem.approaches as any}
        />
      </section>

      {/* ══ SUBMISSION HISTORY ══════════════════════════════════════ */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Submission History
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Historical attempts imported from LeetCode. Expand a submission to
            see its original code.
          </p>
        </div>

        {problem.submissions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No submissions imported yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {problem.submissions.map((submission) => (
              <SubmissionCard
                key={submission.id}
                id={submission.id}
                status={submission.status}
                language={submission.language}
                runtimeMs={submission.runtimeMs}
                memoryBytes={submission.memoryBytes}
                submittedAt={submission.submittedAt}
                code={submission.code}
                analyses={submission.analyses.map((a) => ({
                  id: a.id,
                  submissionId: a.submissionId,
                  status: a.status,
                  modelName: a.modelName,
                  review: a.review as any,
                  draft: a.draft as any,
                  errorMessage: a.errorMessage,
                  createdAt: a.createdAt.toISOString(),
                  updatedAt: a.updatedAt.toISOString(),
                }))}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
