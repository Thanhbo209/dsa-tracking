"use client";

import * as React from "react";
import { useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  X,
  RotateCcw,
  LayoutGrid,
  List as ListIcon,
  ArrowUpDown,
  Filter,
  ChevronLeft,
  ChevronRight,
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
const PAGE_SIZE = 24;

// Helper to parse query string / URL parameters into filter state
function parseUrlParams(searchStr: string) {
  const cleanSearch = searchStr.startsWith("?") ? searchStr.slice(1) : searchStr;
  const params = new URLSearchParams(cleanSearch);
  const q = params.get("q") ?? "";
  const diff = (params.get("diff") ?? "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const topic = (params.get("topic") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const rawSort = params.get("sort");
  const sort: SortOption =
    rawSort === "number" || rawSort === "difficulty" || rawSort === "recent"
      ? rawSort
      : "recent";
  const rawView = params.get("view");
  const view: ViewMode = rawView === "list" ? "list" : "grid";
  const rawPage = parseInt(params.get("page") ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  return { q, diff, topic, sort, view, page };
}

// Generate pagination numbers with ellipsis for large page counts
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export function PublicPlaybookExplorer({
  problems,
  username,
}: PublicPlaybookExplorerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize filter/sort/view state from URL search parameters
  const initialParams = React.useMemo(() => {
    return parseUrlParams(searchParams?.toString() ?? "");
  }, [searchParams]);

  const [search, setSearch] = React.useState(initialParams.q);
  const [selectedDifficulties, setSelectedDifficulties] = React.useState<string[]>(
    initialParams.diff,
  );
  const [selectedTopics, setSelectedTopics] = React.useState<string[]>(
    initialParams.topic,
  );
  const [sort, setSort] = React.useState<SortOption>(initialParams.sort);
  const [view, setView] = React.useState<ViewMode>(initialParams.view);
  const [currentPage, setCurrentPage] = React.useState<number>(initialParams.page);
  const [showAllTags, setShowAllTags] = React.useState(false);

  // Keep a ref of latest filter state so updateUrl can be stable
  const stateRef = React.useRef({
    search,
    selectedDifficulties,
    selectedTopics,
    sort,
    view,
    currentPage,
  });

  React.useEffect(() => {
    stateRef.current = {
      search,
      selectedDifficulties,
      selectedTopics,
      sort,
      view,
      currentPage,
    };
  });

  // ── Sync URL via window.history (pushState/replaceState) ────────────────
  // Avoids Next.js router.push/replace which trigger server RSC roundtrips
  const updateUrl = React.useCallback(
    (
      nextState: {
        search?: string;
        difficulties?: string[];
        topics?: string[];
        sort?: SortOption;
        view?: ViewMode;
        page?: number;
      },
      mode: "push" | "replace" = "push",
    ) => {
      const current = stateRef.current;
      const q = nextState.search !== undefined ? nextState.search : current.search;
      const diffs =
        nextState.difficulties !== undefined
          ? nextState.difficulties
          : current.selectedDifficulties;
      const tops =
        nextState.topics !== undefined ? nextState.topics : current.selectedTopics;
      const s = nextState.sort !== undefined ? nextState.sort : current.sort;
      const v = nextState.view !== undefined ? nextState.view : current.view;
      const p = nextState.page !== undefined ? nextState.page : current.currentPage;

      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (diffs.length > 0) params.set("diff", diffs.join(","));
      if (tops.length > 0) params.set("topic", tops.join(","));
      if (s !== "recent") params.set("sort", s);
      if (v !== "grid") params.set("view", v);
      if (p > 1) params.set("page", String(p));

      const queryString = params.toString();
      const targetPath =
        typeof window !== "undefined" ? window.location.pathname : pathname;
      const newUrl = queryString ? `${targetPath}?${queryString}` : targetPath;

      if (mode === "replace") {
        window.history.replaceState(null, "", newUrl);
      } else {
        window.history.pushState(null, "", newUrl);
      }
    },
    [pathname],
  );

  // ── Popstate handler for browser Back/Forward navigation ────────────────
  // Reads window.location.search on popstate, parses state, and updates all React setters
  React.useEffect(() => {
    const handlePopState = () => {
      const parsed = parseUrlParams(window.location.search);
      setSearch(parsed.q);
      setSelectedDifficulties(parsed.diff);
      setSelectedTopics(parsed.topic);
      setSort(parsed.sort);
      setView(parsed.view);
      setCurrentPage(parsed.page);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

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

  // ── Filter Handlers ─────────────────────────────────────────────────────
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearch(value);
    setCurrentPage(1);
    updateUrl({ search: value, page: 1 }, "replace");
  }

  function handleClearSearch() {
    setSearch("");
    setCurrentPage(1);
    updateUrl({ search: "", page: 1 }, "replace");
  }

  const toggleDifficulty = React.useCallback(
    (diff: string) => {
      const currentDiffs = stateRef.current.selectedDifficulties;
      const next = currentDiffs.includes(diff)
        ? currentDiffs.filter((d) => d !== diff)
        : [...currentDiffs, diff];
      setSelectedDifficulties(next);
      setCurrentPage(1);
      updateUrl({ difficulties: next, page: 1 }, "push");
    },
    [updateUrl],
  );

  const toggleTopic = React.useCallback(
    (topicName: string) => {
      const currentTopics = stateRef.current.selectedTopics;
      const next = currentTopics.includes(topicName)
        ? currentTopics.filter((t) => t !== topicName)
        : [...currentTopics, topicName];
      setSelectedTopics(next);
      setCurrentPage(1);
      updateUrl({ topics: next, page: 1 }, "push");
    },
    [updateUrl],
  );

  const handleSortChange = React.useCallback(
    (newSort: SortOption) => {
      setSort(newSort);
      updateUrl({ sort: newSort }, "push");
    },
    [updateUrl],
  );

  const handleViewChange = React.useCallback(
    (newView: ViewMode) => {
      setView(newView);
      updateUrl({ view: newView }, "push");
    },
    [updateUrl],
  );

  const handleClearFilters = React.useCallback(() => {
    setSearch("");
    setSelectedDifficulties([]);
    setSelectedTopics([]);
    setCurrentPage(1);
    updateUrl({ search: "", difficulties: [], topics: [], page: 1 }, "push");
  }, [updateUrl]);

  const handlePageChange = React.useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      updateUrl({ page: newPage }, "push");
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [updateUrl],
  );

  // ── Filtering and Sorting ───────────────────────────────────────────────
  const filteredProblems = React.useMemo(() => {
    return filterAndSortProblems(problems, {
      search,
      difficulties: selectedDifficulties,
      topics: selectedTopics,
      sort,
    });
  }, [problems, search, selectedDifficulties, selectedTopics, sort]);

  // Note on Virtualization:
  // DOM virtualization (e.g. react-window / tanstack-virtual) is intentionally deferred.
  // With client-side pagination capped at PAGE_SIZE = 24 items, at most 24 DOM card/row
  // nodes are rendered at any time. Slicing 24 lightweight items provides sub-millisecond
  // layout and render times with zero scroll layout jumping or dynamic height measurement bugs,
  // making virtualization redundant and adding unnecessary bundle overhead.
  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProblems = React.useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredProblems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredProblems, safeCurrentPage]);

  const pageNumbers = React.useMemo(
    () => getPageNumbers(safeCurrentPage, totalPages),
    [safeCurrentPage, totalPages],
  );

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
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                title="Clear search"
                aria-label="Clear search"
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
                      "rounded border px-2 py-0.5 text-xs transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40 flex items-center gap-1.5",
                      isSelected
                        ? "bg-white/20 border-white/50 text-white font-medium"
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
                    "rounded border px-2 py-0.5 text-xs transition-colors cursor-pointer italic flex items-center gap-1.5 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40",
                    selectedTopics.includes("Untagged")
                      ? "bg-white/20 border-white/50 text-white font-medium not-italic"
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
          Showing{" "}
          <span className="font-bold text-white">
            {filteredProblems.length === 0
              ? 0
              : `${(safeCurrentPage - 1) * PAGE_SIZE + 1}–${Math.min(
                  safeCurrentPage * PAGE_SIZE,
                  filteredProblems.length,
                )}`}
          </span>{" "}
          of{" "}
          <span className="font-medium text-zinc-300">
            {filteredProblems.length}
          </span>{" "}
          {filteredProblems.length === 1 ? "problem" : "problems"}
          {filteredProblems.length !== problems.length && (
            <span className="text-zinc-500 font-normal">
              {" "}
              (filtered from {problems.length})
            </span>
          )}
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
          {paginatedProblems.map((problem) => (
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
          {paginatedProblems.map((problem) => (
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

      {/* ── Pagination Controls ──────────────────────────────────────────── */}
      {totalPages > 1 && (
        <nav
          aria-label="Pagination Navigation"
          className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-6 pb-2"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage <= 1}
            className="h-8 px-2.5 sm:px-3 text-xs border-[#383838] bg-[#1e1e1e] text-zinc-300 hover:bg-[#2a2a2a] hover:text-white disabled:opacity-40 disabled:hover:bg-[#1e1e1e] disabled:hover:text-zinc-300 cursor-pointer gap-1"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-3.5" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="flex items-center gap-1">
            {pageNumbers.map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 py-1 text-xs text-zinc-500 select-none"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = Number(p);
              const isActive = pageNum === safeCurrentPage;

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  className={cn(
                    "h-8 min-w-8 px-2 rounded-md text-xs font-medium transition-colors cursor-pointer border",
                    isActive
                      ? "bg-white text-black border-white font-semibold shadow-sm"
                      : "bg-[#1e1e1e] border-[#383838] text-zinc-300 hover:bg-[#2a2a2a] hover:text-white hover:border-zinc-500",
                  )}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`Page ${pageNum}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage >= totalPages}
            className="h-8 px-2.5 sm:px-3 text-xs border-[#383838] bg-[#1e1e1e] text-zinc-300 hover:bg-[#2a2a2a] hover:text-white disabled:opacity-40 disabled:hover:bg-[#1e1e1e] disabled:hover:text-zinc-300 cursor-pointer gap-1"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-3.5" />
          </Button>
        </nav>
      )}
    </div>
  );
}
