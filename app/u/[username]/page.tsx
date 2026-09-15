import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { getPublicUserProfile } from "@/lib/profile/service";
import { DsaLogo } from "@/components/brand/DsaLogo";
import { PublicPlaybookExplorer } from "@/components/profile/PublicPlaybookExplorer";

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

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { username } = await params;
  const profile = await getPublicUserProfile(username);

  if (!profile) {
    notFound();
  }

  const { user, problems } = profile;
  const displayName = user.displayUsername ?? user.username;

  const easyCount = problems.filter((p) => p.difficulty === "EASY").length;
  const mediumCount = problems.filter((p) => p.difficulty === "MEDIUM").length;
  const hardCount = problems.filter((p) => p.difficulty === "HARD").length;
  const distinctTopicsCount = new Set(problems.flatMap((p) => p.topics)).size;

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
        <span className="text-xs font-mono text-zinc-400">
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
                <p className="text-sm font-mono text-zinc-300">
                  @{displayName}
                </p>
                {user.bio && (
                  <p className="text-sm text-zinc-300 max-w-xl pt-1">
                    {user.bio}
                  </p>
                )}
                <p className="text-xs text-zinc-400 pt-1">
                  Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Informative Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-[#383838]">
              {/* Total Solved */}
              <div className="rounded-xl border border-[#383838] bg-[#1e1e1e] p-3 text-center min-w-[105px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Total Solved
                </span>
                <p className="text-xl font-bold text-white mt-0.5">
                  {problems.length}
                </p>
              </div>

              {/* Difficulty Breakdown */}
              <div className="rounded-xl border border-[#383838] bg-[#1e1e1e] p-3 text-center min-w-[130px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Difficulty
                </span>
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold">
                  <span className="text-[#46C6C2]" title="Easy">{easyCount}E</span>
                  <span className="text-zinc-600">/</span>
                  <span className="text-yellow-400" title="Medium">{mediumCount}M</span>
                  <span className="text-zinc-600">/</span>
                  <span className="text-red-400" title="Hard">{hardCount}H</span>
                </div>
              </div>

              {/* Topics Covered */}
              <div className="rounded-xl border border-[#383838] bg-[#1e1e1e] p-3 text-center min-w-[105px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Topics
                </span>
                <p className="text-xl font-bold text-white mt-0.5">
                  {distinctTopicsCount}
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
            <span className="text-xs text-zinc-400">
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
            <Suspense
              fallback={
                <div className="h-48 rounded-2xl border border-[#383838] bg-[#222222] animate-pulse" />
              }
            >
              <PublicPlaybookExplorer
                problems={problems}
                username={user.username}
              />
            </Suspense>
          )}
        </section>
      </main>
    </div>
  );
}

