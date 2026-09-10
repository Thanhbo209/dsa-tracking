import { notFound } from "next/navigation";
import { SubmissionCard } from "@/components/problems/SubmissionCard";
import { ApproachForm } from "@/components/problems/ApproachForm";
import { prisma } from "@/lib/db/prisma";
import { SolutionForm } from "@/components/problems/SolutionForm";
import { CodeForm } from "@/components/problems/CodeForm";

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
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Your Knowledge
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Approaches, solutions, and canonical code you have intentionally
              organised and understood.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 pt-1">
            <span className="text-sm text-muted-foreground">
              {problem.approaches.length}{" "}
              {problem.approaches.length === 1 ? "approach" : "approaches"}
            </span>
            <ApproachForm problemId={problem.id} />
          </div>
        </div>

        {problem.approaches.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No approaches recorded yet. Add one to start building your
              knowledge.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {problem.approaches.map((approach) => (
              /* ── Approach card ────────────────────────────────── */
              <div
                key={approach.id}
                className="rounded-lg border border-l-4 border-l-foreground/20 p-5"
              >
                {/* Approach header */}
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-bold">{approach.name}</h3>

                  <div className="shrink-0 text-right text-sm text-muted-foreground">
                    {approach.timeComplexity && (
                      <p>Time: {approach.timeComplexity}</p>
                    )}
                    {approach.spaceComplexity && (
                      <p>Space: {approach.spaceComplexity}</p>
                    )}
                  </div>
                </div>

                {/* Approach details */}
                <div className="mt-3 space-y-3">
                  {approach.coreIdea && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Core idea
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {approach.coreIdea}
                      </p>
                    </div>
                  )}
                  {approach.whyItWorks && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Why it works
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                        {approach.whyItWorks}
                      </p>
                    </div>
                  )}
                  {approach.whenToUse && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        When to use
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                        {approach.whenToUse}
                      </p>
                    </div>
                  )}
                </div>

                {/* ── Solutions ─────────────────────────────────── */}
                <div className="ml-4 mt-5 border-t pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold">Solutions</p>
                    <span className="text-xs text-muted-foreground">
                      {approach.solutions.length}{" "}
                      {approach.solutions.length === 1
                        ? "solution"
                        : "solutions"}
                    </span>
                  </div>

                  {approach.solutions.length > 0 && (
                    <div className="space-y-4">
                      {approach.solutions.map((solution) => (
                        /* ── Solution card ──────────────────────── */
                        <div
                          key={solution.id}
                          className="rounded-md border-l-2 border-l-muted-foreground/30 pl-4"
                        >
                          <h4 className="font-semibold">{solution.name}</h4>

                          {solution.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {solution.description}
                            </p>
                          )}
                          {solution.algorithm && (
                            <div className="mt-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Algorithm
                              </p>
                              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                                {solution.algorithm}
                              </p>
                            </div>
                          )}
                          {solution.notes && (
                            <div className="mt-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Notes
                              </p>
                              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                                {solution.notes}
                              </p>
                            </div>
                          )}

                          {/* ── Codes ─────────────────────────── */}
                          <div className="ml-4 mt-4 border-t pt-4">
                            <div className="mb-2 flex items-center justify-between">
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Implementations
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {solution.codes.length}
                              </span>
                            </div>

                            {solution.codes.length > 0 && (
                              <div className="space-y-3">
                                {solution.codes.map((code) => (
                                  <div
                                    key={code.id}
                                    className="rounded-md border bg-background p-3"
                                  >
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                      {code.language}
                                    </p>
                                    <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 text-sm">
                                      <code>{code.code}</code>
                                    </pre>
                                    {code.notes && (
                                      <div className="mt-2">
                                        <p className="text-xs font-medium">
                                          Notes
                                        </p>
                                        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                                          {code.notes}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="mt-3">
                              <CodeForm solutionId={solution.id} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4">
                    <SolutionForm approachId={approach.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
                status={submission.status}
                language={submission.language}
                runtimeMs={submission.runtimeMs}
                memoryBytes={submission.memoryBytes}
                submittedAt={submission.submittedAt}
                code={submission.code}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
