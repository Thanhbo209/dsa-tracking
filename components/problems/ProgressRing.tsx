import type { ProblemStatus } from "./ProblemsExplorer";
import { Check } from "lucide-react";

interface ProgressRingProps {
  status: ProblemStatus;
  size?: number;
}

export function ProgressRing({ status, size = 18 }: ProgressRingProps) {
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  if (status === "SOLVED") {
    return (
      <div
        className="relative flex items-center justify-center text-emerald-400"
        title="Solved on LeetCode"
      >
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#10b981"
            strokeWidth={strokeWidth}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Check className="size-2.5 stroke-[3] text-emerald-400" />
        </div>
      </div>
    );
  }

  if (status === "ATTEMPTED") {
    return (
      <div
        className="relative flex items-center justify-center text-amber-400"
        title="Attempted"
      >
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#383838"
            strokeWidth={strokeWidth}
          />
          {/* 50% half-filled arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f59e0b"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference * 0.5} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="size-1 rounded-full bg-amber-400 animate-pulse" />
        </div>
      </div>
    );
  }

  // TODO
  return (
    <div
      className="relative flex items-center justify-center text-zinc-500"
      title="Todo"
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#4a4a4a"
          strokeWidth={strokeWidth}
          strokeDasharray="2.5 2.5"
        />
      </svg>
    </div>
  );
}
