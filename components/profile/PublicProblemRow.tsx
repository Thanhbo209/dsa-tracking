"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { PublicVaultProblem } from "@/lib/profile/service";
import { cn } from "cn";

interface PublicProblemRowProps {
  problem: PublicVaultProblem;
  username: string;
  onTagClick?: (tag: string) => void;
  selectedTopics?: string[];
}

function getDifficultyBadge(difficulty: string | null) {
  switch (difficulty) {
    case "EASY":
      return <Badge variant="easy">EASY</Badge>;
    case "MEDIUM":
      return <Badge variant="medium">MEDIUM</Badge>;
    case "HARD":
      return <Badge variant="hard">HARD</Badge>;
    default:
      return (
        <Badge variant="outline" className="text-zinc-400 border-zinc-700 bg-zinc-800/60">
          UNTIERED
        </Badge>
      );
  }
}

const VISIBLE_ROW_TAGS = 2;

export function PublicProblemRow({
  problem,
  username,
  onTagClick,
  selectedTopics = [],
}: PublicProblemRowProps) {
  const visibleTopics = problem.topics.slice(0, VISIBLE_ROW_TAGS);
  const overflowCount = problem.topics.length - VISIBLE_ROW_TAGS;

  return (
    <Link
      href={`/u/${username}/${problem.slug}`}
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[#383838] bg-[#262626] px-4 py-3 hover:border-[#555555] hover:bg-[#2e2e2e] transition-colors shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="font-mono text-xs text-zinc-400 w-12 shrink-0">
          {problem.leetcodeId != null ? `#${problem.leetcodeId}` : "—"}
        </span>
        <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors truncate">
          {problem.title}
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
        {/* Tags */}
        <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
          {problem.topics.length === 0 ? (
            <span className="text-[10px] text-zinc-500 italic">No topics</span>
          ) : (
            <>
              {visibleTopics.map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    title={`Filter by ${topic}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onTagClick?.(topic);
                    }}
                    className={cn(
                      "rounded border px-1.5 py-0.5 text-[10px] transition-colors cursor-pointer shrink-0 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary",
                      isSelected
                        ? "bg-primary/20 border-primary text-white font-medium"
                        : "bg-[#1a1a1a] border-[#444444] text-zinc-300 hover:border-zinc-300 hover:text-white",
                    )}
                  >
                    {topic}
                  </button>
                );
              })}
              {overflowCount > 0 && (
                <span
                  title={problem.topics.slice(VISIBLE_ROW_TAGS).join(", ")}
                  className="rounded bg-[#1a1a1a] border border-[#444444] px-1.5 py-0.5 text-[10px] text-zinc-400 shrink-0"
                >
                  +{overflowCount}
                </span>
              )}
            </>
          )}
        </div>

        {/* Difficulty */}
        <div className="w-20 shrink-0 text-left sm:text-center">
          {getDifficultyBadge(problem.difficulty)}
        </div>

        {/* Approach count */}
        <div className="w-24 shrink-0 text-right text-xs text-zinc-400 font-medium">
          {problem.approachCount} {problem.approachCount === 1 ? "approach" : "approaches"}
        </div>
      </div>
    </Link>
  );
}
