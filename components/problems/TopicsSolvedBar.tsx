"use client";

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
      <span className="text-xs font-semibold text-zinc-400 mr-1 select-none">
        Topics Solved:
      </span>

      {/* All / Reset chip */}
      <button
        type="button"
        onClick={onClearTopics}
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
          isAllSelected
            ? "border border-[#46C6C2] bg-[#46C6C2]/15 text-[#46C6C2] font-semibold shadow-xs"
            : "border border-[#444444] bg-[#1a1a1a] text-zinc-400 hover:border-zinc-500 hover:text-white"
        }`}
        aria-pressed={isAllSelected}
      >
        <span>All Topics</span>
      </button>

      {/* Topic chips */}
      {solvedTopics.map((topic) => {
        const isSelected = selectedTopics.includes(topic.topicName);
        return (
          <button
            key={topic.topicName}
            type="button"
            onClick={() => onToggleTopic(topic.topicName)}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all cursor-pointer ${
              isSelected
                ? "border border-[#46C6C2] bg-[#46C6C2]/15 text-[#46C6C2] font-semibold shadow-xs"
                : "border border-[#444444] bg-[#1a1a1a] text-zinc-300 hover:border-zinc-500 hover:text-white"
            }`}
            aria-pressed={isSelected}
          >
            <span>{topic.topicName}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                isSelected
                  ? "bg-[#46C6C2]/30 text-white"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {topic.solvedCount}
            </span>
          </button>
        );
      })}
    </div>
  );
}
