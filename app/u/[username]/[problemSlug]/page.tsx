import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getPublicProblemDetail } from "@/lib/profile/service";
import { ProblemDetailPanel } from "@/components/problems/ProblemDetailPanel";
import { PublicApproachList } from "@/components/profile/PublicApproachList";
import { DsaLogo } from "@/components/brand/DsaLogo";

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

  const { user, problem, approaches } = detail;
  const displayName = user.displayUsername ?? user.username;

  // ProblemDetailPanel expects topics as Array<{id, name}>
  // The public service returns topics as string[] — adapt inline
  const topicsForPanel = problem.topics.map((name) => ({
    id: name,
    name,
  }));

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* ── Top Navigation Bar ─────────────────────────────────────── */}
      <header className="border-b border-[#383838] bg-[#222222]/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/problems"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <DsaLogo size="sm" priority className="h-6 w-auto" />
            <span className="font-bold text-sm text-white hidden sm:inline-block">
              DSA Tracking
            </span>
          </Link>
          <span className="h-4 w-px bg-zinc-700 hidden sm:inline-block" />
          <Link
            href={`/u/${user.username}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>@{displayName}&apos;s playbook</span>
          </Link>
        </div>
        <span className="text-xs font-mono text-zinc-500">
          Public Knowledge Profile
        </span>
      </header>

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
