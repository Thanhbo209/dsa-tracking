"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { getPageNumbers } from "@/utils/problems/pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isCompact: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isCompact,
}: PaginationProps) {
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      <Button
        type="button"
        onClick={() => {
          onPageChange(Math.max(1, safeCurrentPage - 1));

          document
            .getElementById("problems-list-header")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
        disabled={safeCurrentPage === 1}
        className={`flex items-center gap-1 border border-[#383838] bg-[#262626] ${
          isCompact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-xs"
        } font-medium text-muted-foreground hover:bg-[#333333] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-3.5" />
        <span className={isCompact ? "hidden sm:inline" : ""}>Prev</span>
      </Button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers(safeCurrentPage, totalPages).map((p, idx) =>
          p === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-1.5 py-0.5 text-xs text-zinc-500 select-none"
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              type="button"
              onClick={() => {
                onPageChange(p as number);
                document
                  .getElementById("problems-list-header")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`min-w-7 h-7 sm:min-w-8 sm:h-8 text-xs font-semibold transition-colors ${
                safeCurrentPage === p
                  ? "border border-border bg-white/20 text-white font-bold shadow-xs"
                  : " bg-[#262626] text-zinc-300 hover:bg-[#333333] hover:text-white"
              }`}
              aria-label={`Page ${p}`}
              aria-current={safeCurrentPage === p ? "page" : undefined}
            >
              {p}
            </Button>
          ),
        )}
      </div>

      <Button
        type="button"
        onClick={() => {
          onPageChange(Math.min(totalPages, safeCurrentPage + 1));

          document
            .getElementById("problems-list-header")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
        disabled={safeCurrentPage === totalPages}
        className={`flex items-center gap-1 border border-border bg-[#262626] ${
          isCompact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-xs"
        } font-medium text-zinc-300 hover:bg-[#333333] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
        aria-label="Next page"
      >
        <span className={isCompact ? "hidden sm:inline" : ""}>Next</span>
        <ChevronRight className="size-3.5" />
      </Button>
    </div>
  );
}

export default Pagination;
