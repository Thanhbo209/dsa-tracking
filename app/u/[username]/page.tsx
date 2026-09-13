import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { getPublicUserProfile } from "@/lib/profile/service";
import { DsaLogo } from "@/components/brand/DsaLogo";

interface PublicProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username}`,
    description: `Public DSA playbook and solutions for @${username}`,
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

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { username } = await params;
  const profile = await getPublicUserProfile(username);

  if (!profile) {
    notFound();
  }

  const { user, stats, problems } = profile;
  const displayName = user.displayUsername ?? user.username;

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* ── Top Navigation Bar ────────────────────────────────────── */}
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
            href="/problems"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>DSA Explorer</span>
          </Link>
        </div>
        <span className="text-xs font-mono text-zinc-500">
          Public Knowledge Profile
        </span>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ── Profile Header Card ─────────────────────────────────── */}
        <section
          aria-label="User Profile"
          className="rounded-2xl border border-[#383838] bg-[#262626] p-6 sm:p-8 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
            <div className="flex items-center gap-4">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name}
                  className="size-16 sm:size-20 rounded-full border-2 border-primary object-cover"
                />
              ) : (
                <div className="size-16 sm:size-20 rounded-full border border-[#444444] bg-[#333333] flex items-center justify-center text-2xl font-bold text-white uppercase">
                  {user.name.charAt(0)}
                </div>
              )}

              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {user.name}
                </h1>
                <p className="text-sm font-mono text-primary">
                  @{displayName}
                </p>
                {user.bio && (
                  <p className="text-sm text-zinc-300 max-w-xl pt-1">
                    {user.bio}
                  </p>
                )}
                <p className="text-xs text-zinc-500 pt-1">
                  Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-[#383838]">
              <div className="rounded-xl border border-[#383838] bg-[#1e1e1e] p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Approaches
                </span>
                <p className="text-lg font-bold text-amber-300">
                  {stats.approachCount}
                </p>
              </div>

              <div className="rounded-xl border border-[#383838] bg-[#1e1e1e] p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Solutions
                </span>
                <p className="text-lg font-bold text-emerald-400">
                  {stats.solutionCount}
                </p>
              </div>

              <div className="rounded-xl border border-[#383838] bg-[#1e1e1e] p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Codes
                </span>
                <p className="text-lg font-bold text-blue-400">
                  {stats.codeCount}
                </p>
              </div>

              <div className="rounded-xl border border-[#383838] bg-[#1e1e1e] p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Problems
                </span>
                <p className="text-lg font-bold text-purple-400">
                  {stats.problemCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Public Knowledge Playbook — Problem List ─────────────── */}
        <section aria-label="Algorithmic Playbook" className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">
                Public DSA Playbook
              </h2>
            </div>
            <span className="text-xs text-zinc-500">
              {problems.length}{" "}
              {problems.length === 1 ? "problem" : "problems"}
            </span>
          </div>

          {problems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#444444] bg-[#262626] p-12 text-center space-y-3">
              <DsaLogo size="lg" className="mx-auto h-12 w-auto opacity-40 mb-1" />
              <h3 className="text-base font-semibold text-white">
                No public knowledge published yet
              </h3>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                @{displayName} hasn&apos;t saved any approaches to their public
                knowledge playbook yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {problems.map((problem) => (
                <Link
                  key={problem.slug}
                  href={`/u/${user.username}/${problem.slug}`}
                  className="block group rounded-xl border border-[#383838] bg-[#262626] p-4 sm:p-5 space-y-3 hover:border-[#555555] hover:bg-[#2e2e2e] transition-colors shadow-xs"
                >
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {problem.leetcodeId && (
                        <span className="font-mono text-xs text-zinc-500 block mb-0.5">
                          #{problem.leetcodeId}
                        </span>
                      )}
                      <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-primary transition-colors truncate">
                        {problem.title}
                      </h3>
                    </div>
                    {problem.difficulty && (
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${difficultyClass(problem.difficulty)}`}
                      >
                        {problem.difficulty}
                      </span>
                    )}
                  </div>

                  {/* Topic chips */}
                  {problem.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {problem.topics.slice(0, 4).map((topic) => (
                        <span
                          key={topic}
                          className="rounded bg-[#1a1a1a] border border-[#444444] px-1.5 py-0.5 text-[10px] text-zinc-300"
                        >
                          {topic}
                        </span>
                      ))}
                      {problem.topics.length > 4 && (
                        <span className="rounded bg-[#1a1a1a] border border-[#444444] px-1.5 py-0.5 text-[10px] text-zinc-500">
                          +{problem.topics.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer: approach count hint */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#333333]">
                    <span className="text-[11px] text-zinc-500">
                      {problem.approachCount}{" "}
                      {problem.approachCount === 1 ? "approach" : "approaches"}
                    </span>
                    <span className="text-[11px] text-zinc-600 group-hover:text-zinc-400 transition-colors">
                      View →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
