"use client";

import * as React from "react";
import { Compass, SlidersHorizontal } from "lucide-react";

export interface MarketplaceHeaderProps {
  onOpenMobileFilters?: () => void;
  activeFilterCount?: number;
}

export function MarketplaceHeader({
  onOpenMobileFilters,
  activeFilterCount = 0,
}: MarketplaceHeaderProps) {
  return (
    <div className="relative w-full">
      {/* Subtle Ambient Glow Orbs */}
      <div className="absolute -top-12 -left-20 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Campus Status Banner */}
      <div className="w-full bg-white/85 backdrop-blur-md rounded-2xl border border-charcoal-200/70 shadow-xs p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 shrink-0">
            <Compass className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-charcoal-900 text-base sm:text-lg font-jakarta">
                Campus Feed
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                Live Stock
              </span>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
              Verified campus marketplace • Direct buy &amp; sell among students
            </p>
          </div>
        </div>

        {/* Mobile Filter Trigger Button */}
        <div className="flex lg:hidden items-center justify-end">
          <button
            type="button"
            onClick={onOpenMobileFilters}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-charcoal-900 text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-charcoal-800 transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 stroke-[2]" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-brand-500 text-white text-[11px] font-extrabold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
