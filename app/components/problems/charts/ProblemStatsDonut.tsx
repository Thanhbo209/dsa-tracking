"use client";

import { useState } from "react";
import { BookOpen, Award, CheckCircle2 } from "lucide-react";

export interface ProblemStatsDonutProps {
  total: number;
  solved: number;
  easy: {
    solved: number;
    total: number;
  };
  medium: {
    solved: number;
    total: number;
  };
  hard: {
    solved: number;
    total: number;
  };
  knowledgeCount: number;
}

export function ProblemStatsDonut({
  total,
  solved,
  easy,
  medium,
  hard,
  knowledgeCount,
}: ProblemStatsDonutProps) {
  const [hoveredSegment, setHoveredSegment] = useState<
    "EASY" | "MEDIUM" | "HARD" | null
  >(null);

  // SVG Donut geometry
  const size = 170;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2; // radius = 78
  const circumference = 2 * Math.PI * radius; // ~490.09

  // Calculate arc lengths for solved problems
  const totalSolved = solved;
  const easyRatio = totalSolved > 0 ? easy.solved / totalSolved : 0;
  const medRatio = totalSolved > 0 ? medium.solved / totalSolved : 0;
  const hardRatio = totalSolved > 0 ? hard.solved / totalSolved : 0;

  // Arc lengths
  const easyLen = easyRatio * circumference;
  const medLen = medRatio * circumference;
  const hardLen = hardRatio * circumference;

  // Offsets (starting from top, rotated -90deg)
  const easyOffset = 0;
  const medOffset = -easyLen;
  const hardOffset = -(easyLen + medLen);

  const solvedPercentage =
    total > 0 ? Math.round((solved / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-[#383838] bg-[#262626] p-6 shadow-xs flex flex-col justify-between h-full gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#383838]">
        <div>
          <div className="flex items-center gap-2">
            <Award className="size-4 text-emerald-400 shrink-0" />
            <h2 className="text-base font-bold text-white tracking-tight leading-none">
              Practice Mastery
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1.5 leading-normal">
            Historical completion & knowledge progress
          </p>
        </div>

        {/* Compact secondary badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-amber-300 font-medium"
            title={`${knowledgeCount} total verified approaches documented`}
          >
            <BookOpen className="size-3.5" />
            <span>{knowledgeCount} Knowledge</span>
          </div>

          <div
            className="flex items-center gap-1.5 rounded-lg border border-[#444444] bg-[#1e1e1e] px-2.5 py-1 text-zinc-300 font-medium"
            title={`${total} total problems tracked`}
          >
            <span>{total} Total Tracked</span>
          </div>
        </div>
      </div>

      {/* Center: Donut Chart + Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2 flex-1">
        {/* SVG Donut */}
        <div className="relative flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
            aria-label="Solved difficulty donut chart"
          >
            {/* Background Track Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#333333"
              strokeWidth={strokeWidth}
              strokeDasharray={totalSolved === 0 ? "4 4" : undefined}
            />

            {/* If solved > 0, render colored segments */}
            {totalSolved > 0 && (
              <>
                {/* Easy Segment (#46C6C2) */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke="#46C6C2"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${easyLen} ${circumference}`}
                  strokeDashoffset={easyOffset}
                  strokeLinecap="round"
                  className={`transition-opacity duration-200 cursor-pointer ${
                    hoveredSegment !== null && hoveredSegment !== "EASY"
                      ? "opacity-30"
                      : "opacity-100"
                  }`}
                  onMouseEnter={() => setHoveredSegment("EASY")}
                  onMouseLeave={() => setHoveredSegment(null)}
                />

                {/* Medium Segment (#eab308) */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke="#eab308"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${medLen} ${circumference}`}
                  strokeDashoffset={medOffset}
                  strokeLinecap="round"
                  className={`transition-opacity duration-200 cursor-pointer ${
                    hoveredSegment !== null && hoveredSegment !== "MEDIUM"
                      ? "opacity-30"
                      : "opacity-100"
                  }`}
                  onMouseEnter={() => setHoveredSegment("MEDIUM")}
                  onMouseLeave={() => setHoveredSegment(null)}
                />

                {/* Hard Segment (#ef4444) */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${hardLen} ${circumference}`}
                  strokeDashoffset={hardOffset}
                  strokeLinecap="round"
                  className={`transition-opacity duration-200 cursor-pointer ${
                    hoveredSegment !== null && hoveredSegment !== "HARD"
                      ? "opacity-30"
                      : "opacity-100"
                  }`}
                  onMouseEnter={() => setHoveredSegment("HARD")}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              </>
            )}
          </svg>

          {/* Hollow Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none px-2">
            {totalSolved === 0 ? (
              <>
                <span className="text-2xl font-black tracking-tight text-white flex items-baseline justify-center">
                  0
                  <span className="ml-1 text-sm font-normal text-zinc-400">
                    /{total}
                  </span>
                </span>
                <span className="text-[11px] font-semibold text-[#46C6C2] mt-1.5 leading-normal">
                  Start solving!
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-black tracking-tight text-white flex items-baseline justify-center">
                  {solved}
                  <span className="ml-1 text-sm font-normal text-zinc-400">
                    /{total}
                  </span>
                </span>

                {hoveredSegment === "EASY" ? (
                  <span className="text-[11px] font-semibold text-[#46C6C2] mt-1.5 leading-normal">
                    Easy: {easy.solved}/{easy.total} (
                    {easy.total > 0
                      ? Math.round((easy.solved / easy.total) * 100)
                      : 0}
                    %)
                  </span>
                ) : hoveredSegment === "MEDIUM" ? (
                  <span className="text-[11px] font-semibold text-yellow-400 mt-1.5 leading-normal">
                    Medium: {medium.solved}/{medium.total} (
                    {medium.total > 0
                      ? Math.round((medium.solved / medium.total) * 100)
                      : 0}
                    %)
                  </span>
                ) : hoveredSegment === "HARD" ? (
                  <span className="text-[11px] font-semibold text-red-400 mt-1.5 leading-normal">
                    Hard: {hard.solved}/{hard.total} (
                    {hard.total > 0
                      ? Math.round((hard.solved / hard.total) * 100)
                      : 0}
                    %)
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-emerald-400 flex items-center justify-center gap-1 mt-1.5 leading-normal">
                    <CheckCircle2 className="size-3 inline shrink-0" />
                    <span>{solvedPercentage}% Solved</span>
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Breakdown Legend */}
        <div className="flex flex-col gap-2.5 min-w-[160px]">
          {/* Easy Pill */}
          <div
            className={`flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg border transition-all cursor-default ${
              hoveredSegment === "EASY"
                ? "border-[#46C6C2] bg-[#46C6C2]/15 shadow-sm"
                : "border-[#46C6C2]/20 bg-[#46C6C2]/5 hover:bg-[#46C6C2]/10"
            }`}
            onMouseEnter={() => setHoveredSegment("EASY")}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#46C6C2]" />
              <span className="text-xs font-semibold text-[#46C6C2]">
                Easy
              </span>
            </div>
            <div className="text-xs font-mono text-white">
              <span className="font-bold">{easy.solved}</span>
              <span className="text-zinc-500 text-[11px]">/{easy.total}</span>
            </div>
          </div>

          {/* Medium Pill */}
          <div
            className={`flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg border transition-all cursor-default ${
              hoveredSegment === "MEDIUM"
                ? "border-yellow-500 bg-yellow-500/15 shadow-sm"
                : "border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10"
            }`}
            onMouseEnter={() => setHoveredSegment("MEDIUM")}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-yellow-400" />
              <span className="text-xs font-semibold text-yellow-400">
                Medium
              </span>
            </div>
            <div className="text-xs font-mono text-white">
              <span className="font-bold">{medium.solved}</span>
              <span className="text-zinc-500 text-[11px]">/{medium.total}</span>
            </div>
          </div>

          {/* Hard Pill */}
          <div
            className={`flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg border transition-all cursor-default ${
              hoveredSegment === "HARD"
                ? "border-red-500 bg-red-500/15 shadow-sm"
                : "border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
            }`}
            onMouseEnter={() => setHoveredSegment("HARD")}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-red-400" />
              <span className="text-xs font-semibold text-red-400">
                Hard
              </span>
            </div>
            <div className="text-xs font-mono text-white">
              <span className="font-bold">{hard.solved}</span>
              <span className="text-zinc-500 text-[11px]">/{hard.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
