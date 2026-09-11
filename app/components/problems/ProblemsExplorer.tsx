"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  Clock,
  Circle,
  BookOpen,
  Filter,
  ArrowUpDown,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DsaLogo } from "@/components/brand/DsaLogo";
import type { Difficulty } from "@/lib/generated/prisma/client";

export type ProblemStatus = "SOLVED" | "ATTEMPTED" | "TODO";

export interface ProblemExplorerItem {
  id: string;
  slug: string;
  leetcodeId: number | null;
  title: string;
  difficulty: Difficulty | null;
  topics: string[];
  status: ProblemStatus;
  approachCount: number;
  updatedAt: string;
}

interface ProblemsExplorerProps {
  problems: ProblemExplorerItem[];
}

type DifficultyFilter = "ALL" | Difficulty;
type StatusFilter = "ALL" | ProblemStatus;
type SortOption =
  | "NUM_ASC"
  | "NUM_DESC"
  | "TITLE_ASC"
  | "DIFF_EASY"
  | "DIFF_HARD"
  | "RECENT";

function difficultyClass(difficulty: Difficulty | null): string {
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

function difficultyOrder(diff: Difficulty | null): number {
  switch (diff) {
    case "EASY":
      return 1;
    case "MEDIUM":
      return 2;
    case "HARD":
      return 3;
    default:
      return 4;
  }
}

export function ProblemsExplorer({ problems }: ProblemsExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedTopic, setSelectedTopic] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("NUM_ASC");

  // Derive distinct list of available topics from current dataset
  const availableTopics = useMemo(() => {
    const topicMap = new Map<string, number>();
    for (const p of problems) {
      for (const topic of p.topics) {
        topicMap.set(topic, (topicMap.get(topic) ?? 0) + 1);
      }
    }
    return Array.from(topicMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) =>
        b.count !== a.count ? b.count - a.count : a.name.localeCompare(b.name),
      );
  }, [problems]);

  // Overall Statistics for top progress dashboard — independent of active filters
  const stats = useMemo(() => {
    const total = problems.length;
    const solved = problems.filter((p) => p.status === "SOLVED").length;
    const easy = problems.filter((p) => p.difficulty === "EASY").length;
    const medium = problems.filter((p) => p.difficulty === "MEDIUM").length;
    const hard = problems.filter((p) => p.difficulty === "HARD").length;
    const knowledge = problems.filter((p) => p.approachCount > 0).length;

    return {
      total,
      solved,
      easy,
      medium,
      hard,
      knowledge,
    };
  }, [problems]);

  // Filter and Sort Logic
  const filteredProblems = useMemo(() => {
    const rawQuery = searchQuery.trim();
    const normalizedQuery = rawQuery.toLowerCase();
    // Normalize "#1", "  #1 ", "1" -> "1"
    const normalizedIdQuery = normalizedQuery.replace(/^#\s*/, "");

    return problems
      .filter((problem) => {
        // Search filter
        if (rawQuery.length > 0) {
          const matchTitle = problem.title.toLowerCase().includes(normalizedQuery);
          const matchId =
            normalizedIdQuery.length > 0 &&
            problem.leetcodeId !== null &&
            (problem.leetcodeId.toString() === normalizedIdQuery ||
              problem.leetcodeId.toString().startsWith(normalizedIdQuery));

          if (!matchTitle && !matchId) {
            return false;
          }
        }

        // Difficulty filter
        if (difficultyFilter !== "ALL") {
          if (problem.difficulty !== difficultyFilter) {
            return false;
          }
        }

        // Status filter
        if (statusFilter !== "ALL") {
          if (problem.status !== statusFilter) {
            return false;
          }
        }

        // Topic filter
        if (selectedTopic !== "ALL") {
          if (!problem.topics.includes(selectedTopic)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "NUM_ASC": {
            // Nulls explicitly sorted last
            if (a.leetcodeId === null && b.leetcodeId === null) return 0;
            if (a.leetcodeId === null) return 1;
            if (b.leetcodeId === null) return -1;
            return a.leetcodeId - b.leetcodeId;
          }
          case "NUM_DESC": {
            // Nulls explicitly sorted last
            if (a.leetcodeId === null && b.leetcodeId === null) return 0;
            if (a.leetcodeId === null) return 1;
            if (b.leetcodeId === null) return -1;
            return b.leetcodeId - a.leetcodeId;
          }
          case "TITLE_ASC":
            return a.title.localeCompare(b.title);
          case "DIFF_EASY": {
            const diffA = difficultyOrder(a.difficulty);
            const diffB = difficultyOrder(b.difficulty);
            if (diffA !== diffB) return diffA - diffB;
            if (a.leetcodeId === null && b.leetcodeId === null) return 0;
            if (a.leetcodeId === null) return 1;
            if (b.leetcodeId === null) return -1;
            return a.leetcodeId - b.leetcodeId;
          }
          case "DIFF_HARD": {
            const diffA = difficultyOrder(a.difficulty);
            const diffB = difficultyOrder(b.difficulty);
            if (diffA !== diffB) return diffB - diffA;
            if (a.leetcodeId === null && b.leetcodeId === null) return 0;
            if (a.leetcodeId === null) return 1;
            if (b.leetcodeId === null) return -1;
            return a.leetcodeId - b.leetcodeId;
          }
          case "RECENT":
            return (
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
          default:
            return 0;
        }
      });
  }, [
    problems,
    searchQuery,
    difficultyFilter,
    statusFilter,
    selectedTopic,
    sortBy,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    difficultyFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    selectedTopic !== "ALL";

  function clearAllFilters() {
    setSearchQuery("");
    setDifficultyFilter("ALL");
    setStatusFilter("ALL");
    setSelectedTopic("ALL");
    setSortBy("NUM_ASC");
  }

  // Handle case when database contains 0 problems
  if (problems.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#4a4a4a] bg-[#262626] p-12 text-center space-y-3 text-white">
        <DsaLogo size="lg" className="mx-auto h-12 w-auto opacity-40 mb-1" />
        <h3 className="text-lg font-semibold text-white">
          No tracked problems yet
        </h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Solve problems on LeetCode with the extension enabled to build your
          practice library and permanent knowledge playbook.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* ── Problem Statistics Summary Bar (Independent of Filters) ─ */}
      <section
        aria-label="Library Statistics"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {/* Total Tracked */}
        <div className="rounded-xl border border-[#383838] bg-[#262626] p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Total Tracked
          </span>
          <p className="mt-1 text-2xl font-bold tracking-tight text-white">
            {stats.total}
          </p>
        </div>

        {/* Solved */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Solved
          </span>
          <p className="mt-1 text-2xl font-bold tracking-tight text-white">
            {stats.solved}
          </p>
        </div>

        {/* Easy */}
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-green-400">
            Easy
          </span>
          <p className="mt-1 text-2xl font-bold tracking-tight text-white">
            {stats.easy}
          </p>
        </div>

        {/* Medium */}
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-yellow-400">
            Medium
          </span>
          <p className="mt-1 text-2xl font-bold tracking-tight text-white">
            {stats.medium}
          </p>
        </div>

        {/* Hard */}
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">
            Hard
          </span>
          <p className="mt-1 text-2xl font-bold tracking-tight text-white">
            {stats.hard}
          </p>
        </div>

        {/* Knowledge */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Knowledge
          </span>
          <p className="mt-1 text-2xl font-bold tracking-tight text-white">
            {stats.knowledge}
          </p>
        </div>
      </section>

      {/* ── Search & Filter Toolbar ────────────────────────────────── */}
      <section
        aria-label="Search and Filters"
        className="rounded-xl border border-[#383838] bg-[#262626] p-4 sm:p-5 space-y-4 shadow-xs"
      >
        {/* Row 1: Search input + Topic dropdown + Sort select */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              aria-label="Search problems"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or #id (e.g. Two Sum, 1, #1)..."
              className="w-full rounded-lg border border-[#4a4a4a] bg-[#1a1a1a] pl-10 pr-8 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                aria-label="Clear search text"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Topic Filter Dropdown */}
            {availableTopics.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Filter className="size-3.5 text-zinc-400 shrink-0" />
                <select
                  aria-label="Filter by Topic"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="rounded-lg border border-[#4a4a4a] bg-[#1a1a1a] px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="ALL">All Topics ({availableTopics.length})</option>
                  {availableTopics.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name} ({t.count})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="size-3.5 text-zinc-400 shrink-0" />
              <select
                aria-label="Sort problems"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-lg border border-[#4a4a4a] bg-[#1a1a1a] px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="NUM_ASC">Number: Low to High</option>
                <option value="NUM_DESC">Number: High to Low</option>
                <option value="TITLE_ASC">Title: A to Z</option>
                <option value="DIFF_EASY">Difficulty: Easy first</option>
                <option value="DIFF_HARD">Difficulty: Hard first</option>
                <option value="RECENT">Recently Updated</option>
              </select>
            </div>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="gap-1.5 border-[#4a4a4a] bg-[#1e1e1e] text-zinc-300 hover:text-white text-xs"
              >
                <RotateCcw className="size-3" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>

        {/* Row 2: Difficulty & Status Quick Filter Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#383838]">
          {/* Difficulty filter buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-zinc-400 mr-1 font-medium">Difficulty:</span>
            {(["ALL", "EASY", "MEDIUM", "HARD"] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficultyFilter(diff)}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  difficultyFilter === diff
                    ? diff === "EASY"
                      ? "bg-green-500/20 text-green-300 border border-green-500/40"
                      : diff === "MEDIUM"
                        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                        : diff === "HARD"
                          ? "bg-red-500/20 text-red-300 border border-red-500/40"
                          : "bg-white/20 text-white border border-white/40"
                    : "text-zinc-400 hover:text-white bg-[#1a1a1a] border border-[#383838]"
                }`}
              >
                {diff === "ALL"
                  ? "All"
                  : diff.charAt(0) + diff.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Status filter buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-zinc-400 mr-1 font-medium">Status:</span>
            {(["ALL", "SOLVED", "ATTEMPTED", "TODO"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-all ${
                  statusFilter === st
                    ? st === "SOLVED"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : st === "ATTEMPTED"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : st === "TODO"
                          ? "bg-zinc-700/60 text-zinc-200 border border-zinc-500/40"
                          : "bg-white/20 text-white border border-white/40"
                    : "text-zinc-400 hover:text-white bg-[#1a1a1a] border border-[#383838]"
                }`}
              >
                {st === "SOLVED" && (
                  <CheckCircle2 className="size-3 text-emerald-400" />
                )}
                {st === "ATTEMPTED" && (
                  <Clock className="size-3 text-amber-400" />
                )}
                {st === "TODO" && <Circle className="size-2 text-zinc-500" />}
                <span>
                  {st === "ALL"
                    ? "All"
                    : st.charAt(0) + st.slice(1).toLowerCase()}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Results Count & Clear Shortcut ─────────────────────────── */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-400 px-1">
        <span>
          Showing{" "}
          <strong className="text-white font-semibold">
            {filteredProblems.length}
          </strong>{" "}
          of {problems.length} problems
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-primary hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Problems Grid (Cards) ─────────────────────────────────── */}
      {filteredProblems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#4a4a4a] bg-[#262626] p-12 text-center space-y-3">
          <DsaLogo size="lg" className="mx-auto h-12 w-auto opacity-40 mb-1" />
          <h3 className="text-base font-semibold text-white">
            No matching problems found
          </h3>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search query, difficulty, status, or topic
            filters.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="mt-2 border-[#4a4a4a] bg-[#333333] text-white hover:bg-[#444444]"
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProblems.map((problem) => {
            return (
              <Link
                key={problem.id}
                href={`/problems/${problem.slug}`}
                className="group relative flex flex-col justify-between rounded-xl border border-[#383838] bg-[#262626] p-5 shadow-xs transition-all hover:border-[#525252] hover:bg-[#2b2b2b] hover:shadow-md"
              >
                <div>
                  {/* Card Header: Status & Difficulty Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      {problem.status === "SOLVED" ? (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400"
                          title="Solved on LeetCode"
                        >
                          <CheckCircle2 className="size-3.5 text-emerald-400" />
                          <span>Solved</span>
                        </span>
                      ) : problem.status === "ATTEMPTED" ? (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400"
                          title="Attempted"
                        >
                          <Clock className="size-3.5 text-amber-400" />
                          <span>Attempted</span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-400"
                          title="Todo"
                        >
                          <Circle className="size-2.5 text-zinc-500" />
                          <span>Todo</span>
                        </span>
                      )}
                    </div>

                    {problem.difficulty ? (
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${difficultyClass(
                          problem.difficulty,
                        )}`}
                      >
                        {problem.difficulty}
                      </span>
                    ) : null}
                  </div>

                  {/* LeetCode Number & Title */}
                  <div className="space-y-1.5">
                    {problem.leetcodeId !== null && (
                      <span className="font-mono text-xs font-medium text-zinc-400">
                        #{problem.leetcodeId}
                      </span>
                    )}
                    <h2 className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
                      {problem.title}
                    </h2>
                  </div>

                  {/* Topics Chips */}
                  {problem.topics.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {problem.topics.slice(0, 3).map((topicName) => (
                        <span
                          key={topicName}
                          className="rounded bg-[#1a1a1a] border border-[#444444] px-2 py-0.5 text-[11px] text-zinc-300"
                        >
                          {topicName}
                        </span>
                      ))}
                      {problem.topics.length > 3 && (
                        <span className="text-[11px] text-zinc-500 font-medium">
                          +{problem.topics.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer: Knowledge Vault & Open Action */}
                <div className="mt-5 flex items-center justify-between border-t border-[#383838] pt-3 text-xs">
                  <div>
                    {problem.approachCount > 0 ? (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-300"
                        title={`${problem.approachCount} approach${problem.approachCount > 1 ? "es" : ""} saved in Knowledge Vault`}
                      >
                        <BookOpen className="size-3.5" />
                        <span>
                          {problem.approachCount}{" "}
                          {problem.approachCount === 1
                            ? "approach"
                            : "approaches"}
                        </span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-zinc-500">
                        No vault notes yet
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 font-medium text-zinc-400 group-hover:text-white transition-colors">
                    <span>Practice</span>
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5 text-zinc-400 group-hover:text-white" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
