"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Flame, Calendar, BookOpen, CheckCircle } from "lucide-react";
import { calculateStreak } from "@/lib/activity/streak";

export interface ActivityHeatmapProps {
  submissionActivities: Record<string, number>; // { [YYYY-MM-DD]: count }
  approachActivities?: Record<string, number>; // { [YYYY-MM-DD]: count }
  lastSyncedAt?: string | null;
  leetcodeUsername?: string | null;
}

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return "just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return "";
  }
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function ActivityHeatmap({
  submissionActivities,
  approachActivities = {},
  lastSyncedAt,
  leetcodeUsername,
}: ActivityHeatmapProps) {
  const [activeTab, setActiveTab] = useState<"SOLVES" | "KNOWLEDGE">("SOLVES");
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current week (right edge) on mount for small screens
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft =
        scrollContainerRef.current.scrollWidth;
    }
  }, []);

  const activeData =
    activeTab === "SOLVES" ? submissionActivities : approachActivities;

  // Calculate streak
  const activeDateKeys = useMemo(() => {
    return Object.keys(activeData).filter((k) => (activeData[k] || 0) > 0);
  }, [activeData]);

  const streak = useMemo(() => {
    return calculateStreak(activeDateKeys);
  }, [activeDateKeys]);

  // Compute 52-week calendar grid ending on current week's Saturday
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    // End on upcoming Saturday or today
    const endDate = new Date(today);
    const dayOfWeek = endDate.getDay(); // 0 = Sun, 6 = Sat
    endDate.setDate(endDate.getDate() + (6 - dayOfWeek));

    const totalDays = 53 * 7;
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (totalDays - 1));

    const weeksArray: Array<
      Array<{
        dateKey: string;
        displayDate: string;
        count: number;
        isFuture: boolean;
      }>
    > = [];

    const monthHeaders: Array<{ label: string; weekIndex: number }> = [];
    let currentMonth = -1;

    const cur = new Date(startDate);

    for (let w = 0; w < 53; w++) {
      const week: Array<{
        dateKey: string;
        displayDate: string;
        count: number;
        isFuture: boolean;
      }> = [];

      for (let d = 0; d < 7; d++) {
        const year = cur.getFullYear();
        const month = String(cur.getMonth() + 1).padStart(2, "0");
        const day = String(cur.getDate()).padStart(2, "0");
        const dateKey = `${year}-${month}-${day}`;

        if (d === 0 && cur.getMonth() !== currentMonth) {
          currentMonth = cur.getMonth();
          monthHeaders.push({
            label: MONTH_NAMES[currentMonth],
            weekIndex: w,
          });
        }

        const isFuture = cur.getTime() > today.getTime();
        const count = !isFuture ? activeData[dateKey] || 0 : 0;

        week.push({
          dateKey,
          displayDate: cur.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          count,
          isFuture,
        });

        cur.setDate(cur.getDate() + 1);
      }

      weeksArray.push(week);
    }

    return { weeks: weeksArray, monthLabels: monthHeaders };
  }, [activeData]);

  // Heatmap Cell Color
  const getCellColor = (count: number, isFuture: boolean) => {
    if (isFuture) return "transparent";
    if (count === 0) return "#222224"; // subtle background
    if (count === 1) return "rgba(70, 198, 194, 0.35)"; // 30-35% opacity
    if (count === 2) return "rgba(70, 198, 194, 0.70)"; // 70% opacity
    return "#46C6C2"; // full opacity 3+
  };

  const getCellBorder = (count: number, isFuture: boolean) => {
    if (isFuture) return "transparent";
    if (count === 0) return "#2f2f32";
    return "rgba(70, 198, 194, 0.4)";
  };

  const cellSize = 11;
  const cellGap = 3;

  return (
    <div className="rounded-xl border border-[#383838] bg-[#262626] p-6 shadow-xs flex flex-col justify-between h-full space-y-6">
      {/* Header with Title, Streak Badges, and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#383838]">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-[#46C6C2] shrink-0" />
            <h2 className="text-base font-bold text-white tracking-tight leading-none">
              Activity &amp; Consistency
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-400 mt-1.5 leading-normal">
            <span>Practice frequency, streaks &amp; contributions</span>
            {lastSyncedAt ? (
              <>
                <span className="text-zinc-600">•</span>
                <span
                  className="text-[11px] text-[#46C6C2] font-medium"
                  title={new Date(lastSyncedAt).toLocaleString()}
                >
                  Synced {leetcodeUsername ? `@${leetcodeUsername} ` : ""}{formatRelativeTime(lastSyncedAt)}
                </span>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Current Streak Badge */}
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border transition-colors ${
              streak.currentStreak > 0
                ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                : "bg-zinc-800 border-zinc-700 text-zinc-400"
            }`}
            title={`Current streak: ${streak.currentStreak} days`}
          >
            <Flame
              className={`size-3.5 ${streak.currentStreak > 0 ? "text-amber-400 animate-pulse" : "text-zinc-500"}`}
            />
            <span>{streak.currentStreak} day streak</span>
          </div>

          {/* Longest streak pill */}
          {streak.longestStreak > 0 && (
            <span className="text-[11px] text-zinc-500 font-medium">
              Best: {streak.longestStreak}d
            </span>
          )}

          {/* Tab Toggle: Solves vs Knowledge Notes */}
          <div className="flex items-center bg-[#1a1a1a] border border-[#383838] rounded-lg p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("SOLVES")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
              activeTab === "SOLVES"
                ? "bg-[#2b2b2b] text-white shadow-xs"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <CheckCircle className="size-3 text-[#46C6C2]" />
            <span>Solves</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("KNOWLEDGE")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
              activeTab === "KNOWLEDGE"
                ? "bg-[#2b2b2b] text-white shadow-xs"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <BookOpen className="size-3 text-amber-400" />
            <span>Vault Notes</span>
          </button>
        </div>
      </div>
    </div>

      {/* Heatmap Grid Container (Scrollable on Mobile) */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="inline-block min-w-[700px]">
          <svg
            width={53 * (cellSize + cellGap) + 32}
            height={7 * (cellSize + cellGap) + 24}
            className="overflow-visible"
          >
            {/* Month Labels */}
            <g className="text-[9px] fill-zinc-400 font-sans select-none">
              {monthLabels.map((m, idx) => (
                <text
                  key={`${m.label}-${idx}`}
                  x={32 + m.weekIndex * (cellSize + cellGap)}
                  y={10}
                >
                  {m.label}
                </text>
              ))}
            </g>

            {/* Day Labels (Mon, Wed, Fri) */}
            <g className="text-[9px] fill-zinc-500 font-sans select-none">
              <text x={10} y={24 + 1 * (cellSize + cellGap) + 8}>
                Mon
              </text>
              <text x={10} y={24 + 3 * (cellSize + cellGap) + 8}>
                Wed
              </text>
              <text x={10} y={24 + 5 * (cellSize + cellGap) + 8}>
                Fri
              </text>
            </g>

            {/* Heatmap Cells */}
            <g transform="translate(32, 22)">
              {weeks.map((week, wIdx) =>
                week.map((day, dIdx) => {
                  const x = wIdx * (cellSize + cellGap);
                  const y = dIdx * (cellSize + cellGap);

                  return (
                    <rect
                      key={day.dateKey}
                      x={x}
                      y={y}
                      width={cellSize}
                      height={cellSize}
                      rx={2.5}
                      fill={getCellColor(day.count, day.isFuture)}
                      stroke={getCellBorder(day.count, day.isFuture)}
                      strokeWidth={1}
                      className={
                        !day.isFuture
                          ? "transition-colors duration-150 cursor-pointer hover:stroke-white"
                          : ""
                      }
                      onMouseEnter={(e) => {
                        if (day.isFuture) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const actionLabel =
                          activeTab === "SOLVES"
                            ? day.count === 1
                              ? "problem solved"
                              : "problems solved"
                            : day.count === 1
                              ? "vault note added"
                              : "vault notes added";

                        const text =
                          day.count > 0
                            ? `${day.count} ${actionLabel} on ${day.displayDate}`
                            : `No activity on ${day.displayDate}`;

                        setTooltip({
                          text,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                }),
              )}
            </g>
          </svg>
        </div>
      </div>

      {/* Heatmap Footer Legend */}
      <div className="flex items-center justify-between text-xs text-zinc-400 pt-4 border-t border-[#383838] mt-auto">
        <div className="text-[11px]">
          <span className="font-semibold text-white">
            {streak.totalActiveDays}
          </span>{" "}
          active {streak.totalActiveDays === 1 ? "day" : "days"} past year
        </div>

        {/* Legend scale */}
        <div className="flex items-center gap-1.5 text-[11px] select-none">
          <span>Less</span>
          <span
            className="size-2.5 rounded-xs border border-[#2f2f32]"
            style={{ backgroundColor: "#222224" }}
          />
          <span
            className="size-2.5 rounded-xs"
            style={{ backgroundColor: "rgba(70, 198, 194, 0.35)" }}
          />
          <span
            className="size-2.5 rounded-xs"
            style={{ backgroundColor: "rgba(70, 198, 194, 0.70)" }}
          />
          <span
            className="size-2.5 rounded-xs"
            style={{ backgroundColor: "#46C6C2" }}
          />
          <span>More</span>
        </div>
      </div>

      {/* Floating Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2.5 py-1 text-xs font-medium text-white bg-[#18181b] border border-[#3f3f46] rounded-md shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full transition-opacity duration-150"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
