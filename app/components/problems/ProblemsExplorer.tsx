"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  Clock,
  Circle,
  Bookmark,
  ArrowUpDown,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DsaLogo } from "@/components/brand/DsaLogo";
import type { Difficulty } from "@/lib/generated/prisma/client";
import { ProblemStatsDonut } from "./charts/ProblemStatsDonut";
import { ActivityHeatmap } from "./charts/ActivityHeatmap";
import { ProgressRing } from "./ProgressRing";
import {
  TopicsSolvedBar,
  type SolvedTopicItem,
} from "./TopicsSolvedBar";

const PAGE_SIZE = 16;

function getPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

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

export interface ProblemsExplorerProps {
  problems: ProblemExplorerItem[];
  submissionActivities?: Record<string, number>;
  approachActivities?: Record<string, number>;
  solvedTopics?: SolvedTopicItem[];
  lastSyncedAt?: string | null;
  leetcodeUsername?: string | null;
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
      return "bg-[#46C6C2]/10 text-[#46C6C2] border-[#46C6C2]/30";
    case "MEDIUM":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
    case "HARD":
      return "bg-red-500/10 text-red-400 border-red-500/30";
    default:
      return "bg-zinc-800 text-zinc-400 border-zinc-700";
  }
}

function difficultyCardStripe(difficulty: Difficulty | null): string {
  switch (difficulty) {
    case "EASY":
      return "border-l-[3px] border-l-[#46C6C2]";
    case "MEDIUM":
      return "border-l-[3px] border-l-[#eab308]";
    case "HARD":
      return "border-l-[3px] border-l-[#ef4444]";
    default:
      return "border-l-[3px] border-l-zinc-700";
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

export function ProblemsExplorer({
  problems,
  submissionActivities = {},
  approachActivities = {},
  solvedTopics,
  lastSyncedAt,
  leetcodeUsername,
}: ProblemsExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("NUM_ASC");
  const [currentPage, setCurrentPage] = useState(1);

  // Derive distinct list of solved topics with counts if not provided via props
  const activeSolvedTopics = useMemo(() => {
    if (solvedTopics && solvedTopics.length > 0) return solvedTopics;
    const topicMap = new Map<string, number>();
    for (const p of problems) {
      if (p.status === "SOLVED") {
        for (const topic of p.topics) {
          topicMap.set(topic, (topicMap.get(topic) ?? 0) + 1);
        }
      }
    }
    return Array.from(topicMap.entries())
      .map(([topicName, solvedCount]) => ({ topicName, solvedCount }))
      .sort((a, b) =>
        b.solvedCount !== a.solvedCount
          ? b.solvedCount - a.solvedCount
          : a.topicName.localeCompare(b.topicName),
      );
  }, [solvedTopics, problems]);

  const handleToggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic],
    );
    setCurrentPage(1);
  };

  const handleClearTopics = () => {
    setSelectedTopics([]);
    setCurrentPage(1);
  };

  // Overall Statistics for top progress dashboard — independent of active filters
  const stats = useMemo(() => {
    const total = problems.length;
    const solved = problems.filter((p) => p.status === "SOLVED").length;
    const easyTotal = problems.filter((p) => p.difficulty === "EASY").length;
    const easySolved = problems.filter(
      (p) => p.difficulty === "EASY" && p.status === "SOLVED",
    ).length;
    const mediumTotal = problems.filter((p) => p.difficulty === "MEDIUM").length;
    const mediumSolved = problems.filter(
      (p) => p.difficulty === "MEDIUM" && p.status === "SOLVED",
    ).length;
    const hardTotal = problems.filter((p) => p.difficulty === "HARD").length;
    const hardSolved = problems.filter(
      (p) => p.difficulty === "HARD" && p.status === "SOLVED",
    ).length;
    const knowledge = problems.filter((p) => p.approachCount > 0).length;

    return {
      total,
      solved,
      easy: { solved: easySolved, total: easyTotal },
      medium: { solved: mediumSolved, total: mediumTotal },
      hard: { solved: hardSolved, total: hardTotal },
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

        // Topic filter (multi-select OR logic: match if problem has ANY selected topic)
        if (selectedTopics.length > 0) {
          const hasMatch = problem.topics.some((t) =>
            selectedTopics.includes(t),
          );
          if (!hasMatch) {
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
    selectedTopics,
    sortBy,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    difficultyFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    selectedTopics.length > 0;

  function clearAllFilters() {
    setSearchQuery("");
    setDifficultyFilter("ALL");
    setStatusFilter("ALL");
    setSelectedTopics([]);
    setSortBy("NUM_ASC");
    setCurrentPage(1);
  }

  // Pagination calculation: strictly 16 items per page
  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, filteredProblems.length);

  const paginatedProblems = useMemo(() => {
    return filteredProblems.slice(startIndex, endIndex);
  }, [filteredProblems, startIndex, endIndex]);

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
    <div className="space-y-6 sm:space-y-8 text-white">
      {/* ── Problem Statistics & Activity Dashboard (Independent of Filters) ─ */}
      <section
        aria-label="Library Statistics"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        <div className="lg:col-span-5">
          <ProblemStatsDonut
            total={stats.total}
            solved={stats.solved}
            easy={stats.easy}
            medium={stats.medium}
            hard={stats.hard}
            knowledgeCount={stats.knowledge}
          />
        </div>
        <div className="lg:col-span-7">
          <ActivityHeatmap
            submissionActivities={submissionActivities}
            approachActivities={approachActivities}
            lastSyncedAt={lastSyncedAt}
            leetcodeUsername={leetcodeUsername}
          />
        </div>
      </section>

      {/* ── Topics Solved Overview Bar ────────────────────────────── */}
      <TopicsSolvedBar
        solvedTopics={activeSolvedTopics}
        selectedTopics={selectedTopics}
        onToggleTopic={handleToggleTopic}
        onClearTopics={handleClearTopics}
      />

      {/* ── Search & Filter Toolbar ────────────────────────────────── */}
      <section
        aria-label="Search and Filters"
        className="rounded-xl border border-[#383838] bg-[#262626] p-4 sm:p-5 space-y-4 shadow-xs"
      >
        {/* Row 1: Search input + Sort select */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              aria-label="Search problems"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title or #id (e.g. Two Sum, 1, #1)..."
              className="w-full rounded-lg border border-[#4a4a4a] bg-[#1a1a1a] pl-10 pr-8 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                aria-label="Clear search text"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="size-3.5 text-zinc-400 shrink-0" />
              <select
                aria-label="Sort problems"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  setCurrentPage(1);
                }}
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
                onClick={() => {
                  setDifficultyFilter(diff);
                  setCurrentPage(1);
                }}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  difficultyFilter === diff
                    ? diff === "EASY"
                      ? "bg-[#46C6C2]/20 text-[#46C6C2] border border-[#46C6C2]/40"
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
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
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
      <div
        id="problems-list-header"
        className="flex items-center justify-between text-xs sm:text-sm text-zinc-400 px-1 scroll-mt-20"
      >
        <span>
          Showing{" "}
          <strong className="text-white font-semibold">
            {filteredProblems.length === 0 ? 0 : `${startIndex + 1}–${endIndex}`}
          </strong>{" "}
          of {filteredProblems.length}{" "}
          {hasActiveFilters ? `(filtered from ${problems.length})` : "problems"}
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
          {paginatedProblems.map((problem) => {
            return (
              <Link
                key={problem.id}
                href={`/problems/${problem.slug}`}
                className={`group relative flex flex-col justify-between h-full rounded-xl border border-[#383838] bg-[#262626] p-5 sm:p-6 shadow-xs transition-all hover:border-[#525252] hover:bg-[#2b2b2b] hover:shadow-md ${difficultyCardStripe(
                  problem.difficulty,
                )}`}
              >
                <div className="flex flex-col flex-1 justify-between space-y-4">
                  <div>
                    {/* Card Header: Progress Ring & Difficulty Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <ProgressRing status={problem.status} size={18} />
                        <span className="text-xs font-medium text-zinc-400">
                          {problem.status === "SOLVED"
                            ? "Solved"
                            : problem.status === "ATTEMPTED"
                              ? "Attempted"
                              : "Todo"}
                        </span>
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
                  </div>

                  {/* Topics Chips Container - with fixed min-h so 0 chips reserves identical height */}
                  <div className="min-h-[32px] flex items-center">
                    {problem.topics.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {problem.topics.slice(0, 2).map((topicName) => (
                          <span
                            key={topicName}
                            className="rounded bg-[#1a1a1a] border border-[#444444] px-2 py-0.5 text-[11px] text-zinc-300"
                          >
                            {topicName}
                          </span>
                        ))}
                        {problem.topics.length > 2 && (
                          <span className="text-[11px] text-zinc-500 font-medium">
                            +{problem.topics.length - 2} more
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Card Footer: Knowledge Vault & Open Action */}
                <div className="mt-5 flex items-center justify-between border-t border-[#383838] pt-4 text-xs">
                  <div>
                    {problem.approachCount > 0 ? (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-2 py-0.5 text-xs font-medium text-[#f59e0b]"
                        title={`${problem.approachCount} approach${problem.approachCount > 1 ? "es" : ""} saved in Knowledge Vault`}
                      >
                        <Bookmark className="size-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                        <span>
                          {problem.approachCount}{" "}
                          {problem.approachCount === 1
                            ? "approach"
                            : "approaches"}
                        </span>
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1 font-medium text-zinc-400 group-hover:text-white transition-colors ml-auto">
                    <span>Practice</span>
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5 text-zinc-400 group-hover:text-white" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Pagination Controls ────────────────────────────────────── */}
      {totalPages > 1 && (
        <nav
          aria-label="Problems pagination"
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#383838]"
        >
          <div className="text-xs text-zinc-400">
            Page <span className="font-semibold text-white">{safeCurrentPage}</span> of{" "}
            <span className="font-semibold text-white">{totalPages}</span> ({PAGE_SIZE} problems per page)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                document.getElementById("problems-list-header")?.scrollIntoView({ behavior: "smooth" });
              }}
              disabled={safeCurrentPage === 1}
              className="flex items-center gap-1 rounded-lg border border-[#383838] bg-[#262626] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-[#333333] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-3.5" />
              <span>Prev</span>
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers(safeCurrentPage, totalPages).map((p, idx) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 py-1 text-xs text-zinc-500 select-none"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setCurrentPage(p as number);
                      document.getElementById("problems-list-header")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`min-w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                      safeCurrentPage === p
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "border border-[#383838] bg-[#262626] text-zinc-300 hover:bg-[#333333] hover:text-white"
                    }`}
                    aria-label={`Page ${p}`}
                    aria-current={safeCurrentPage === p ? "page" : undefined}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                document.getElementById("problems-list-header")?.scrollIntoView({ behavior: "smooth" });
              }}
              disabled={safeCurrentPage === totalPages}
              className="flex items-center gap-1 rounded-lg border border-[#383838] bg-[#262626] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-[#333333] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
