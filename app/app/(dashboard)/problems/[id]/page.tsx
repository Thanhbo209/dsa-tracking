import { notFound } from "next/navigation";
import { ProblemDetailPanel } from "@/components/problems/ProblemDetailPanel";
import { ProblemLearningWorkspace } from "@/components/problems/ProblemLearningWorkspace";
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

  const serializedSubmissions = problem.submissions.map((submission) => ({
    id: submission.id,
    status: submission.status,
    language: submission.language,
    runtimeMs: submission.runtimeMs,
    memoryBytes: submission.memoryBytes,
    submittedAt: submission.submittedAt,
    code: submission.code,
    analyses: submission.analyses.map((a) => ({
      id: a.id,
      submissionId: a.submissionId,
      status: a.status,
      modelName: a.modelName,
      review: a.review as any,
      draft: a.draft as any,
      errorMessage: a.errorMessage,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
  }));

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* ── LEFT SECTION: Problem Detail (5 cols on desktop) ──────── */}
        <div className="lg:col-span-5">
          <ProblemDetailPanel
            leetcodeId={problem.leetcodeId}
            title={problem.title}
            difficulty={problem.difficulty}
            url={problem.url}
            topics={problem.topics.map((t) => t.topic)}
            description={problem.description}
          />
        </div>

        {/* ── RIGHT SECTION: Learning Workspace (7 cols on desktop) ──── */}
        <div className="lg:col-span-7">
          <ProblemLearningWorkspace
            problemId={problem.id}
            submissions={serializedSubmissions}
            approaches={problem.approaches as any}
          />
        </div>
      </div>
    </main>
  );
}
