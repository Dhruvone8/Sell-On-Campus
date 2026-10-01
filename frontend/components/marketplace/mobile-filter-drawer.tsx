"use client";

import * as React from "react";
import { X, Check } from "lucide-react";
import { FilterSidebar, FilterValues } from "./filter-sidebar";

export interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterValues;
  onFilterChange: (newFilters: Partial<FilterValues>) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onResetFilters,
  activeFilterCount,
}: MobileFilterDrawerProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Container */}
      <div className="relative w-full max-w-[88vw] sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-charcoal-200/80 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-charcoal-900 font-jakarta">
              Filter Listings
            </h2>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-charcoal-400 hover:bg-charcoal-100 hover:text-charcoal-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filters Content */}
        <div className="p-4 overflow-y-auto flex-1">
          <FilterSidebar
            filters={filters}
            onFilterChange={onFilterChange}
            onResetFilters={onResetFilters}
            activeFilterCount={activeFilterCount}
          />
        </div>

        {/* Bottom CTA */}
        <div className="p-4 border-t border-charcoal-200/80 bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
}
