import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Code2,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowLeft,
  Clock,
  ExternalLink,
} from "lucide-react";
import { getPublicUserProfile } from "@/lib/profile/service";
import { CodeViewer } from "@/components/problems/CodeViewer";

interface PublicProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

function difficultyClass(difficulty: string | null): string {
  switch (difficulty) {
    case "EASY":
      return "bg-green-500/10 text-green-400 border-green-500/30";
    case "MEDIUM":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
    case "HARD":
      return "bg-red-500/10 text-red-400 border-red-500/30";
    default:
      return "bg-zinc-800 text-zinc-400 border-zinc-700";
  }
}

import type { Metadata } from "next";
import { DsaLogo } from "@/components/brand/DsaLogo";

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

  const { user, stats, approaches } = profile;

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
                  @{user.username}
                </p>
                {user.bio && (
                  <p className="text-sm text-zinc-300 max-w-xl pt-1">
                    {user.bio}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-zinc-500 pt-1">
                  <Calendar className="size-3.5" />
                  <span>
                    Joined {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
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

        {/* ── Public Knowledge Playbook ───────────────────────────── */}
        <section aria-label="Algorithmic Playbook" className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">
                Public DSA Playbook
              </h2>
            </div>
            <span className="text-xs text-zinc-500">
              {approaches.length} structured {approaches.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {approaches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#444444] bg-[#262626] p-12 text-center space-y-3">
              <DsaLogo size="lg" className="mx-auto h-12 w-auto opacity-40 mb-1" />
              <h3 className="text-base font-semibold text-white">
                No public knowledge published yet
              </h3>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                @{user.username} hasn&apos;t saved any approaches to their public
                knowledge playbook yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {approaches.map((approach) => (
                <article
                  key={approach.id}
                  className="rounded-2xl border border-[#383838] bg-[#262626] p-6 space-y-5 shadow-xs"
                >
                  {/* Problem & Approach Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#383838] pb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {approach.problem.leetcodeId && (
                          <span className="font-mono text-xs font-medium text-zinc-400">
                            #{approach.problem.leetcodeId}
                          </span>
                        )}
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          {approach.problem.title}
                        </h3>
                        {approach.problem.difficulty && (
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${difficultyClass(
                              approach.problem.difficulty,
                            )}`}
                          >
                            {approach.problem.difficulty}
                          </span>
                        )}
                      </div>

                      {approach.problem.topics.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {approach.problem.topics.map((topic) => (
                            <span
                              key={topic}
                              className="rounded bg-[#1a1a1a] border border-[#444444] px-2 py-0.5 text-[10px] text-zinc-300"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300">
                        <BookOpen className="size-3.5" />
                        <span>{approach.name}</span>
                      </span>
                    </div>
                  </div>

                  {/* Approach Strategy Body */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {approach.coreIdea && (
                      <div className="rounded-xl border border-[#333333] bg-[#1e1e1e] p-3.5 space-y-1">
                        <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
                          Core Idea
                        </span>
                        <p className="text-zinc-200 leading-relaxed">
                          {approach.coreIdea}
                        </p>
                      </div>
                    )}

                    {approach.whyItWorks && (
                      <div className="rounded-xl border border-[#333333] bg-[#1e1e1e] p-3.5 space-y-1">
                        <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
                          Why It Works
                        </span>
                        <p className="text-zinc-200 leading-relaxed">
                          {approach.whyItWorks}
                        </p>
                      </div>
                    )}

                    {approach.whenToUse && (
                      <div className="rounded-xl border border-[#333333] bg-[#1e1e1e] p-3.5 space-y-1">
                        <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
                          When To Use
                        </span>
                        <p className="text-zinc-200 leading-relaxed">
                          {approach.whenToUse}
                        </p>
                      </div>
                    )}

                    {(approach.timeComplexity || approach.spaceComplexity) && (
                      <div className="rounded-xl border border-[#333333] bg-[#1e1e1e] p-3.5 space-y-2">
                        <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
                          Complexity
                        </span>
                        <div className="flex items-center gap-3">
                          {approach.timeComplexity && (
                            <span className="font-mono text-zinc-300">
                              Time: <strong className="text-emerald-400">{approach.timeComplexity}</strong>
                            </span>
                          )}
                          {approach.spaceComplexity && (
                            <span className="font-mono text-zinc-300">
                              Space: <strong className="text-blue-400">{approach.spaceComplexity}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Solutions & Canonical Code */}
                  {approach.solutions.length > 0 && (
                    <div className="space-y-4 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <Code2 className="size-3.5 text-zinc-400" />
                        <span>Implementations & Code</span>
                      </h4>

                      <div className="space-y-3">
                        {approach.solutions.map((solution) => (
                          <div
                            key={solution.id}
                            className="rounded-xl border border-[#333333] bg-[#1d1d1d] p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-semibold text-white">
                                {solution.name}
                              </h5>
                              {solution.algorithm && (
                                <span className="text-[11px] text-zinc-400">
                                  {solution.algorithm}
                                </span>
                              )}
                            </div>

                            {solution.description && (
                              <p className="text-xs text-zinc-300">
                                {solution.description}
                              </p>
                            )}

                            {solution.codes.map((codeItem) => (
                              <div
                                key={codeItem.id}
                                className="rounded-lg border border-[#383838] bg-[#141414] p-3 space-y-2"
                              >
                                <div className="flex items-center justify-between text-xs text-zinc-400">
                                  <span className="font-mono font-medium text-primary">
                                    {codeItem.language}
                                  </span>
                                  {codeItem.notes && (
                                    <span className="text-[11px] text-zinc-500">
                                      {codeItem.notes}
                                    </span>
                                  )}
                                </div>
                                <pre className="overflow-x-auto text-xs font-mono text-zinc-200 bg-[#111111] p-3 rounded border border-[#2b2b2b]">
                                  <code>{codeItem.code}</code>
                                </pre>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
