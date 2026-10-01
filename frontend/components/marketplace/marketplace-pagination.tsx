"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface MarketplacePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  currentCount: number;
  onPageChange: (page: number) => void;
}

export function MarketplacePagination({
  currentPage,
  totalPages,
  totalItems,
  currentCount,
  onPageChange,
}: MarketplacePaginationProps) {
  if (totalPages <= 1 && totalItems <= currentCount) {
    return null;
  }

  const percent = totalItems > 0 ? Math.min(100, Math.round((currentCount / totalItems) * 100)) : 100;

  return (
    <div className="pt-6 sm:pt-8 pb-10 flex flex-col items-center justify-center gap-4 w-full">
      {/* Progress pill matching Stitch */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-charcoal-500 text-center px-2">
        <span>Showing {currentCount} of {totalItems} verified items</span>
        <div className="w-24 min-[360px]:w-32 h-1.5 bg-charcoal-200 rounded-full overflow-hidden shrink-0">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Modern Page Number Controls */}
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 max-w-full px-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
          className="p-1.5 sm:p-2 rounded-xl bg-white border border-charcoal-200/80 text-charcoal-700 hover:bg-charcoal-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2]" />
        </button>

        {Array.from({ length: totalPages }).map((_, idx) => {
          const page = idx + 1;
          const isActive = page === currentPage;

          // Limit displayed pages if totalPages is large
          if (
            totalPages > 7 &&
            Math.abs(page - currentPage) > 2 &&
            page !== 1 &&
            page !== totalPages
          ) {
            if (Math.abs(page - currentPage) === 3) {
              return (
                <span key={page} className="px-1 text-xs text-charcoal-400">
                  ...
                </span>
              );
            }
            return null;
          }

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-charcoal-900 text-white shadow-xs"
                  : "bg-white border border-charcoal-200/80 text-charcoal-700 hover:bg-charcoal-50"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
          className="p-1.5 sm:p-2 rounded-xl bg-white border border-charcoal-200/80 text-charcoal-700 hover:bg-charcoal-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 stroke-[2]" />
        </button>
      </div>
    </div>
  );
}
