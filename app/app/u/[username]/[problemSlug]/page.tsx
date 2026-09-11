import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getPublicProblemDetail } from "@/lib/profile/service";
import { ApproachTabs } from "@/components/profile/ApproachTabs";
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
  if (!detail) {
    return { title: "Not Found" };
  }
  const prefix = detail.problem.leetcodeId
    ? `#${detail.problem.leetcodeId} `
    : "";
  return {
    title: `${prefix}${detail.problem.title} — @${detail.user.username}`,
    description: `${detail.user.name}'s approaches and solutions for ${detail.problem.title}`,
  };
}

function difficultyClass(difficulty: string | null): string {
  switch (difficulty) {
    case "EASY":
      return "bg-[#46C6C2]/10 text-[#46C6C2] border-[#46C6C2]/30";
    case "MEDIUM":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
    case "HARD":
      return "bg-red-500/10 text-red-400 border-red-500/30";
    default:
      return "bg-zinc-800 text-zinc-400 border-zinc-700";
  }
}

export default async function PublicProblemDetailPage({
  params,
}: ProblemDetailPageProps) {
  const { username, problemSlug } = await params;

  // Returns null if: user not found, problem slug not found globally,
  // OR this user has no Approach linked to this problem.
  const detail = await getPublicProblemDetail(username, problemSlug);

  if (!detail) {
    notFound();
  }

  const { user, problem, approaches } = detail;
  const displayName = user.displayUsername ?? user.username;

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ── Problem header ─────────────────────────────────────────── */}
        <section
          aria-label="Problem"
          className="rounded-2xl border border-[#383838] bg-[#262626] p-6 sm:p-8 space-y-4"
        >
          <div className="space-y-2">
            {problem.leetcodeId && (
              <span className="font-mono text-xs text-zinc-500 block">
                #{problem.leetcodeId}
              </span>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {problem.title}
              </h1>
              {problem.difficulty && (
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${difficultyClass(problem.difficulty)}`}
                >
                  {problem.difficulty}
                </span>
              )}
            </div>
          </div>

          {problem.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {problem.topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded bg-[#1a1a1a] border border-[#444444] px-2 py-0.5 text-[10px] text-zinc-300"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ── Approach tabs / panel ──────────────────────────────────── */}
        <section
          aria-label="Approaches"
          className="rounded-2xl border border-[#383838] bg-[#262626] p-6 sm:p-8"
        >
          <ApproachTabs approaches={approaches} />
        </section>
      </main>
    </div>
  );
}
