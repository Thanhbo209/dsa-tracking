"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Search,
  X,
  RotateCcw,
  LayoutGrid,
  List as ListIcon,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PublicProblemCard } from "./PublicProblemCard";
import { PublicProblemRow } from "./PublicProblemRow";
import type { PublicVaultProblem } from "@/lib/profile/service";
import {
  filterAndSortProblems,
  type SortOption,
  type ViewMode,
} from "@/lib/profile/filterProblems";
import { cn } from "cn";

interface PublicPlaybookExplorerProps {
  problems: PublicVaultProblem[];
  username: string;
}

const AVAILABLE_DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

export function PublicPlaybookExplorer({
  problems,
  username,
}: PublicPlaybookExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Source of truth: URL search params ──────────────────────────────────
  const paramSearch = searchParams.get("q") ?? "";
  const selectedDifficulties = React.useMemo(
    () =>
      (searchParams.get("diff") ?? "")
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean),
    [searchParams],
  );
  const selectedTopics = React.useMemo(
    () =>
      (searchParams.get("topic") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [searchParams],
  );
  const rawSort = searchParams.get("sort");
  const sort: SortOption =
    rawSort === "number" || rawSort === "difficulty" || rawSort === "recent"
      ? rawSort
      : "recent";
  const rawView = searchParams.get("view");
  const view: ViewMode = rawView === "list" ? "list" : "grid";

  // Search input state with render-time sync for browser navigation
  const [search, setSearch] = React.useState(paramSearch);
  const [prevParamSearch, setPrevParamSearch] = React.useState(paramSearch);
  if (paramSearch !== prevParamSearch) {
    setPrevParamSearch(paramSearch);
    setSearch(paramSearch);
  }

  const [showAllTags, setShowAllTags] = React.useState(false);

  // ── Push updated state to URL search params ─────────────────────────────
  const updateUrl = React.useCallback(
    (nextState: {
      search?: string;
      difficulties?: string[];
      topics?: string[];
      sort?: SortOption;
      view?: ViewMode;
    }) => {
      const q = nextState.search !== undefined ? nextState.search : search;
      const diffs =
        nextState.difficulties !== undefined
          ? nextState.difficulties
          : selectedDifficulties;
      const tops =
        nextState.topics !== undefined ? nextState.topics : selectedTopics;
      const s = nextState.sort !== undefined ? nextState.sort : sort;
      const v = nextState.view !== undefined ? nextState.view : view;

      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (diffs.length > 0) params.set("diff", diffs.join(","));
      if (tops.length > 0) params.set("topic", tops.join(","));
      if (s !== "recent") params.set("sort", s);
      if (v !== "grid") params.set("view", v);

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router, search, selectedDifficulties, selectedTopics, sort, view],
  );

  // ── Dynamically compute topics from actual user problems ─────────────────
  const { topicCounts, hasUntagged } = React.useMemo(() => {
    const counts = new Map<string, number>();
    let untaggedCount = 0;

    for (const p of problems) {
      if (p.topics.length === 0) {
        untaggedCount++;
      } else {
        for (const t of p.topics) {
          counts.set(t, (counts.get(t) ?? 0) + 1);
        }
      }
    }

    const sortedTopics = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));

    return { topicCounts: sortedTopics, hasUntagged: untaggedCount > 0 };
  }, [problems]);

  // ── Handlers ────────────────────────────────────────────────────────────
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearch(value);
    updateUrl({ search: value });
  }

  function toggleDifficulty(diff: string) {
    const next = selectedDifficulties.includes(diff)
      ? selectedDifficulties.filter((d) => d !== diff)
      : [...selectedDifficulties, diff];
    updateUrl({ difficulties: next });
  }

  function toggleTopic(topicName: string) {
    const next = selectedTopics.includes(topicName)
      ? selectedTopics.filter((t) => t !== topicName)
      : [...selectedTopics, topicName];
    updateUrl({ topics: next });
  }

  function handleSortChange(newSort: SortOption) {
    updateUrl({ sort: newSort });
  }

  function handleViewChange(newView: ViewMode) {
    updateUrl({ view: newView });
  }

  function handleClearFilters() {
    setSearch("");
    updateUrl({ search: "", difficulties: [], topics: [] });
  }

  // ── Filtering and Sorting ───────────────────────────────────────────────
  const filteredProblems = React.useMemo(() => {
    return filterAndSortProblems(problems, {
      search,
      difficulties: selectedDifficulties,
      topics: selectedTopics,
      sort,
    });
  }, [problems, search, selectedDifficulties, selectedTopics, sort]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    selectedDifficulties.length > 0 ||
    selectedTopics.length > 0;

  const TOPIC_PREVIEW_LIMIT = 10;
  const displayedTopicCounts = showAllTags
    ? topicCounts
    : topicCounts.slice(0, TOPIC_PREVIEW_LIMIT);

  return (
    <div className="space-y-6">
      {/* ── Filter Controls Bar ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#383838] bg-[#222222] p-4 sm:p-5 space-y-4 shadow-sm">
        {/* Top row: Search input + View mode toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
            <Input
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by title or #number (e.g. Two Sum, 1)..."
              className="pl-9 pr-8"
              aria-label="Search problems"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  updateUrl({ search: "" });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                title="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 justify-between sm:justify-end">
            {/* Sort Dropdown / Selector */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-[#1e1e1e] border border-[#383838] rounded-lg px-2.5 py-1">
              <ArrowUpDown className="size-3.5 text-zinc-400 shrink-0" />
              <span className="font-medium hidden md:inline">Sort:</span>
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="bg-transparent text-xs text-zinc-200 font-medium outline-none cursor-pointer"
                aria-label="Sort problems"
              >
                <option value="recent" className="bg-[#222222] text-white">
                  Recently Added
                </option>
                <option value="number" className="bg-[#222222] text-white">
                  Problem Number
                </option>
                <option value="difficulty" className="bg-[#222222] text-white">
                  Difficulty (Easy → Hard)
                </option>
              </select>
            </div>

            {/* Grid / List View Toggle */}
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(val) => {
                if (val === "grid" || val === "list") {
                  handleViewChange(val);
                }
              }}
              size="sm"
            >
              <ToggleGroupItem
                value="grid"
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid className="size-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="list"
                title="Compact list view"
                aria-label="Compact list view"
              >
                <ListIcon className="size-3.5" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Second row: Difficulty filters + Clear filters */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-[#333333]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-zinc-400">Difficulty:</span>
            {AVAILABLE_DIFFICULTIES.map((diff) => {
              const isSelected = selectedDifficulties.includes(diff);
              return (
                <button
                  key={diff}
                  type="button"
                  onClick={() => toggleDifficulty(diff)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary",
                    isSelected
                      ? diff === "EASY"
                        ? "bg-[#46C6C2]/20 border-[#46C6C2] text-[#46C6C2] ring-1 ring-[#46C6C2]/40"
                        : diff === "MEDIUM"
                        ? "bg-yellow-500/20 border-yellow-500 text-yellow-400 ring-1 ring-yellow-500/40"
                        : "bg-red-500/20 border-red-500 text-red-400 ring-1 ring-red-500/40"
                      : "bg-[#1a1a1a] border-[#383838] text-zinc-400 hover:border-zinc-500 hover:text-white",
                  )}
                  aria-pressed={isSelected}
                >
                  {diff}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleClearFilters}
              className="text-xs text-zinc-400 hover:text-white gap-1 hover:bg-[#2a2a2a] cursor-pointer"
            >
              <RotateCcw className="size-3" />
              <span>Reset filters</span>
            </Button>
          )}
        </div>

        {/* Third row: Dynamic Topic / Tag Filters */}
        {(topicCounts.length > 0 || hasUntagged) && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <Filter className="size-3 text-zinc-400" />
                Topics ({topicCounts.length + (hasUntagged ? 1 : 0)}):
              </span>
              {topicCounts.length > TOPIC_PREVIEW_LIMIT && (
                <button
                  type="button"
                  onClick={() => setShowAllTags((prev) => !prev)}
                  className="text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showAllTags ? "Show less" : `+${topicCounts.length - TOPIC_PREVIEW_LIMIT} more`}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {displayedTopicCounts.map(({ name, count }) => {
                const isSelected = selectedTopics.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleTopic(name)}
                    className={cn(
                      "rounded border px-2 py-0.5 text-xs transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary flex items-center gap-1.5",
                      isSelected
                        ? "bg-primary/20 border-primary text-white font-medium"
                        : "bg-[#1a1a1a] border-[#383838] text-zinc-300 hover:border-zinc-400 hover:text-white",
                    )}
                    aria-pressed={isSelected}
                  >
                    <span>{name}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {count}
                    </span>
                  </button>
                );
              })}

              {hasUntagged && (
                <button
                  type="button"
                  onClick={() => toggleTopic("Untagged")}
                  className={cn(
                    "rounded border px-2 py-0.5 text-xs transition-colors cursor-pointer italic flex items-center gap-1.5",
                    selectedTopics.includes("Untagged")
                      ? "bg-primary/20 border-primary text-white font-medium not-italic"
                      : "bg-[#1a1a1a] border-[#383838] text-zinc-400 hover:border-zinc-400 hover:text-white",
                  )}
                  aria-pressed={selectedTopics.includes("Untagged")}
                >
                  <span>Untagged</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Results Count Bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1 text-xs text-zinc-400">
        <div>
          Showing <span className="font-bold text-white">{filteredProblems.length}</span>{" "}
          of <span className="font-medium text-zinc-300">{problems.length}</span>{" "}
          {problems.length === 1 ? "problem" : "problems"}
        </div>
        {hasActiveFilters && (
          <span className="text-[11px] text-zinc-400">Filters active</span>
        )}
      </div>

      {/* ── Problem Grid or List View ────────────────────────────────────── */}
      {filteredProblems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#444444] bg-[#222222] p-12 text-center space-y-3">
          <div className="size-10 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <Search className="size-5" />
          </div>
          <h3 className="text-base font-semibold text-white">
            No matching problems found
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
            {hasActiveFilters
              ? "None of the problems match your active search and filter criteria."
              : "No public knowledge published yet."}
          </p>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="mt-2 border-[#444444] bg-[#2a2a2a] text-zinc-200 hover:bg-[#333333] hover:text-white cursor-pointer"
            >
              Clear all filters
            </Button>
          )}
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProblems.map((problem) => (
            <PublicProblemCard
              key={problem.slug}
              problem={problem}
              username={username}
              onTagClick={toggleTopic}
              selectedTopics={selectedTopics}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProblems.map((problem) => (
            <PublicProblemRow
              key={problem.slug}
              problem={problem}
              username={username}
              onTagClick={toggleTopic}
              selectedTopics={selectedTopics}
            />
          ))}
        </div>
      )}
    </div>
  );
}
