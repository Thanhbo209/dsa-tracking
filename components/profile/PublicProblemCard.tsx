"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { PublicVaultProblem } from "@/lib/profile/service";
import { cn } from "cn";

interface PublicProblemCardProps {
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

const VISIBLE_TAG_LIMIT = 3;

export function PublicProblemCard({
  problem,
  username,
  onTagClick,
  selectedTopics = [],
}: PublicProblemCardProps) {
  const visibleTopics = problem.topics.slice(0, VISIBLE_TAG_LIMIT);
  const overflowCount = problem.topics.length - VISIBLE_TAG_LIMIT;

  return (
    <Link
      href={`/u/${username}/${problem.slug}`}
      className="group flex flex-col justify-between rounded-xl border border-[#383838] bg-[#262626] p-4 sm:p-5 hover:border-zinc-500 hover:bg-[#383838] transition-all shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <div className="space-y-3">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {problem.leetcodeId != null && (
              <span className="font-mono text-xs text-zinc-400 block mb-0.5">
                #{problem.leetcodeId}
              </span>
            )}
            <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-white transition-colors truncate">
              {problem.title}
            </h3>
          </div>
          <div className="shrink-0">{getDifficultyBadge(problem.difficulty)}</div>
        </div>

        {/* Tag row (capped at single line with uniform overflow) */}
        <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap min-h-6">
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
                      "rounded border px-1.5 py-0.5 text-[10px] transition-colors cursor-pointer shrink-0 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white/40",
                      isSelected
                        ? "bg-white/20 border-white/50 text-white font-medium"
                        : "bg-[#1a1a1a] border-[#444444] text-zinc-300 hover:border-zinc-300 hover:text-white",
                    )}
                  >
                    {topic}
                  </button>
                );
              })}
              {overflowCount > 0 && (
                <span
                  title={problem.topics.slice(VISIBLE_TAG_LIMIT).join(", ")}
                  className="rounded bg-[#1a1a1a] border border-[#444444] px-1.5 py-0.5 text-[10px] text-zinc-400 shrink-0"
                >
                  +{overflowCount}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer without redundant View affordance */}
      <div className="flex items-center justify-between pt-2.5 mt-3 border-t border-[#333333]">
        <span className="text-[11px] text-zinc-400 font-medium">
          {problem.approachCount} {problem.approachCount === 1 ? "approach" : "approaches"}
        </span>
      </div>
    </Link>
  );
}
