"use client";

import { Approach } from "@/types/approach";
import { ApproachSection } from "../../approach/ApproachSection";

interface PublicApproachListProps {
  approaches: Approach[];
}

export function PublicApproachList({ approaches }: PublicApproachListProps) {
  return (
    <div className="space-y-6 text-white">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-[#383838] pb-4">
        <h2 className="text-base sm:text-lg font-bold text-zinc-100">
          Approaches
          <span className="ml-2 text-sm font-normal text-zinc-400">
            ({approaches.length})
          </span>
        </h2>
      </div>

      {/* Stacked approach sections */}
      <div className="space-y-6">
        {approaches.map((approach) => (
          <ApproachSection key={approach.id} approach={approach} />
        ))}
      </div>
    </div>
  );
}
