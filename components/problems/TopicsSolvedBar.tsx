"use client";

import { Button } from "../ui/button";

export interface SolvedTopicItem {
  topicName: string;
  solvedCount: number;
}

export interface TopicsSolvedBarProps {
  solvedTopics: SolvedTopicItem[];
  selectedTopics: string[];
  onToggleTopic: (topicName: string) => void;
  onClearTopics: () => void;
}

export function TopicsSolvedBar({
  solvedTopics,
  selectedTopics,
  onToggleTopic,
  onClearTopics,
}: TopicsSolvedBarProps) {
  if (!solvedTopics || solvedTopics.length === 0) {
    return null;
  }

  const isAllSelected = selectedTopics.length === 0;

  return (
    <div
      aria-label="Topics Solved Filter"
      className="flex flex-wrap items-center gap-2 pt-1"
    >
      <span className="text-[14px] font-semibold text-muted-foreground mr-1 select-none">
        Topics Solved:
      </span>

      {/* All / Reset chip */}
      <Button
        type="button"
        onClick={onClearTopics}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
          isAllSelected
            ? "border border-[#46C6C2] bg-[#46C6C2]/15 hover:bg-[#46C6C2]/15 text-[#46C6C2] font-semibold shadow-xs"
            : "bg-[#1a1a1a] text-white  hover:text-white hover:bg-[#333333]"
        }`}
        aria-pressed={isAllSelected}
      >
        <span>All Topics</span>
      </Button>

      {/* Topic chips */}
      {solvedTopics.map((topic) => {
        const isSelected = selectedTopics.includes(topic.topicName);
        return (
          <Button
            key={topic.topicName}
            type="button"
            onClick={() => onToggleTopic(topic.topicName)}
            className={`inline-flex items-center font-thin gap-1.5 px-2.5 py-1 text-[13px] transition-all cursor-pointer ${
              isSelected
                ? "border border-[#46C6C2] hover:bg-[#46C6C2]/15 bg-[#46C6C2]/15 text-[#46C6C2] font-semibold shadow-xs"
                : "border border-border bg-card text-white hover:bg-[#333333]"
            }`}
            aria-pressed={isSelected}
          >
            <span>{topic.topicName}</span>
            <span
              className={`px-1 py-0.2 text-[12px] font-medium ${
                isSelected
                  ? "bg-[#46C6C2]/30 text-white font-bold"
                  : "bg-zinc-800 text-muted-foreground"
              }`}
            >
              {topic.solvedCount}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
