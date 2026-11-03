import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicProblemDetail } from "@/lib/profile/service";
import { ProblemDetailPanel } from "@/components/problems/components/ProblemDetailPanel";
import { PublicApproachList } from "@/components/profile/components/PublicApproachList";

// ISR caching: serve cached problem detail page for 60 seconds before background regeneration
export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

interface ProblemDetailPageProps {
  params: Promise<{
    username: string;
    problemSlug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProblemDetailPageProps): Promise<Metadata> {
  const { username, problemSlug } = await params;
  const detail = await getPublicProblemDetail(username, problemSlug);
  if (!detail) return { title: "Not Found" };
  const prefix = detail.problem.leetcodeId
    ? `#${detail.problem.leetcodeId} `
    : "";
  return {
    title: `${prefix}${detail.problem.title} — @${detail.user.username}`,
    description: `${detail.user.name}'s approaches and solutions for ${detail.problem.title}`,
  };
}

export default async function PublicProblemDetailPage({
  params,
}: ProblemDetailPageProps) {
  const { username, problemSlug } = await params;

  // null if: user not found, slug not in DB, OR user has no Approach for this slug
  const detail = await getPublicProblemDetail(username, problemSlug);
  if (!detail) notFound();

  const { problem, approaches } = detail;

  // ProblemDetailPanel expects topics as Array<{id, name}>
  // The public service returns topics as string[] — adapt inline
  const topicsForPanel = problem.topics.map((name) => ({
    id: name,
    name,
  }));

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* ── Two-column layout matching internal /problems/[id] workspace ── */}
      <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
          {/* LEFT — Problem Detail Panel (5 cols, sticky) */}
          <div className="lg:col-span-5">
            <ProblemDetailPanel
              leetcodeId={problem.leetcodeId}
              title={problem.title}
              difficulty={problem.difficulty}
              url={problem.url}
              topics={topicsForPanel}
              description={problem.description}
            />
          </div>

          {/* RIGHT — Approaches (7 cols) */}
          <div className="lg:col-span-7 rounded-xl border border-[#383838] bg-[#262626] p-5 sm:p-6 shadow-xs">
            <PublicApproachList approaches={approaches} />
          </div>
        </div>
      </main>
    </div>
  );
}
