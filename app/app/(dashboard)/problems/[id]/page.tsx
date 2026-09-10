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

      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Approaches</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Algorithmic strategies for solving this problem.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {problem.approaches.length} total
            </span>

            <ApproachForm problemId={problem.id} />
          </div>
        </div>

        {problem.approaches.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No approaches recorded yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {problem.approaches.map((approach) => (
              <article key={approach.id} className="rounded-lg border p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold">{approach.name}</h3>

                  <div className="text-right text-sm text-muted-foreground">
                    {approach.timeComplexity && (
                      <p>Time: {approach.timeComplexity}</p>
                    )}
                    {approach.spaceComplexity && (
                      <p>Space: {approach.spaceComplexity}</p>
                    )}
                  </div>
                </div>

                {approach.coreIdea && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium">Core idea</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {approach.coreIdea}
                    </p>
                  </div>
                )}

                {approach.algorithm && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium">Algorithm</h4>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                      {approach.algorithm}
                    </p>
                  </div>
                )}

                {approach.whyItWorks && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium">Why it works</h4>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                      {approach.whyItWorks}
                    </p>
                  </div>
                )}

                {approach.whenToUse && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium">When to use</h4>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                      {approach.whenToUse}
                    </p>
                  </div>
                )}

                <div className="mt-6 border-t pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Solutions</h4>
                      <p className="text-sm text-muted-foreground">
                        Concrete techniques within this approach.
                      </p>
                    </div>

                    <span className="text-sm text-muted-foreground">
                      {approach.solutions.length} total
                    </span>
                  </div>

                  {approach.solutions.length > 0 && (
                    <div className="space-y-3">
                      {approach.solutions.map((solution) => (
                        <div
                          key={solution.id}
                          className="rounded-md border bg-muted/20 p-4"
                        >
                          <h5 className="font-medium">{solution.name}</h5>

                          {solution.description && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {solution.description}
                            </p>
                          )}

                          {solution.algorithm && (
                            <div className="mt-3">
                              <p className="text-sm font-medium">Algorithm</p>
                              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                                {solution.algorithm}
                              </p>
                            </div>
                          )}

                          {solution.notes && (
                            <div className="mt-3">
                              <p className="text-sm font-medium">Notes</p>
                              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                                {solution.notes}
                              </p>
                            </div>
                          )}
                          <div className="mt-4 border-t pt-4">
                            <div className="mb-3 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Codes</p>
                                <p className="text-xs text-muted-foreground">
                                  Implementations of this solution.
                                </p>
                              </div>

                              <span className="text-xs text-muted-foreground">
                                {solution.codes.length} total
                              </span>
                            </div>

                            {solution.codes.length > 0 && (
                              <div className="space-y-3">
                                {solution.codes.map((code) => (
                                  <div
                                    key={code.id}
                                    className="rounded-md border bg-background p-3"
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <p className="text-sm font-medium">
                                        {code.language}
                                      </p>
                                    </div>

                                    <pre className="mt-3 overflow-x-auto rounded-md bg-muted p-3 text-sm">
                                      <code>{code.code}</code>
                                    </pre>

                                    {code.notes && (
                                      <div className="mt-3">
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

                  <SolutionForm approachId={approach.id} />
                </div>
              </article>
            ))}
          </div>
        )}
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
