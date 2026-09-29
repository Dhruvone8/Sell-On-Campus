"use client";

import * as React from "react";
import { LayoutGrid, List, ChevronsUpDown, X } from "lucide-react";
import { FilterValues } from "./filter-sidebar";
import { cn } from "@/lib/utils";

export interface MarketplaceControlsProps {
  totalItems: number;
  filters: FilterValues;
  onFilterChange: (newFilters: Partial<FilterValues>) => void;
  layout: "grid" | "list";
  onLayoutChange: (layout: "grid" | "list") => void;
}

const SORT_OPTIONS = [
  { label: "Recently Listed", value: "newest" as const },
  { label: "Price: Low to High", value: "price_asc" as const },
  { label: "Price: High to Low", value: "price_desc" as const },
  { label: "Oldest First", value: "oldest" as const },
];

export function MarketplaceControls({
  totalItems,
  filters,
  onFilterChange,
  layout,
  onLayoutChange,
}: MarketplaceControlsProps) {
  // Collect active filters to display as removable chips
  const activeChips: { label: string; onRemove: () => void }[] = [];

  if (filters.search) {
    activeChips.push({
      label: `"${filters.search}"`,
      onRemove: () => onFilterChange({ search: undefined }),
    });
  }

  if (filters.category) {
    activeChips.push({
      label: filters.category,
      onRemove: () => onFilterChange({ category: undefined }),
    });
  }

  if (filters.condition) {
    const conditionLabels: Record<string, string> = {
      NEW: "Brand New",
      LIKE_NEW: "Like New",
      GOOD: "Good",
      FAIR: "Fair",
    };
    activeChips.push({
      label: conditionLabels[filters.condition] || filters.condition,
      onRemove: () => onFilterChange({ condition: undefined }),
    });
  }

  if (filters.minPrice || filters.maxPrice) {
    const priceText = filters.minPrice && filters.maxPrice
      ? `₹${filters.minPrice} - ₹${filters.maxPrice}`
      : filters.minPrice
      ? `Over ₹${filters.minPrice}`
      : `Under ₹${filters.maxPrice}`;
    activeChips.push({
      label: priceText,
      onRemove: () => onFilterChange({ minPrice: undefined, maxPrice: undefined }),
    });
  }

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-charcoal-200/70 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left: Count & Active Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-bold text-charcoal-900 text-sm sm:text-base font-jakarta">
          Showing {totalItems} {totalItems === 1 ? "item" : "items"}
        </span>

        {activeChips.length > 0 && (
          <>
            <div className="h-4 w-[1px] bg-charcoal-200 mx-1 hidden sm:block" />
            <div className="flex flex-wrap items-center gap-1.5">
              {activeChips.map((chip, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-charcoal-100 text-charcoal-800 text-xs font-semibold"
                >
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    aria-label={`Remove filter ${chip.label}`}
                    className="hover:text-brand-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right: Sort Dropdown & View Mode Toggle */}
      <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-auto shrink-0">
        {/* Sort Select */}
        <div className="relative flex items-center">
          <select
            value={filters.sort || "newest"}
            aria-label="Sort listings by"
            onChange={(e) =>
              onFilterChange({
                sort: e.target.value as "newest" | "oldest" | "price_asc" | "price_desc",
              })
            }
            className="appearance-none pl-3 pr-8 py-2 min-h-[36px] rounded-xl bg-charcoal-50 hover:bg-charcoal-100 border border-charcoal-200/80 text-xs font-semibold text-charcoal-800 cursor-pointer outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronsUpDown className="w-3.5 h-3.5 text-charcoal-400 absolute right-2.5 pointer-events-none" />
        </div>

        {/* Grid/List View Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-charcoal-100/80 border border-charcoal-200/50">
          <button
            type="button"
            onClick={() => onLayoutChange("grid")}
            aria-label="Grid view"
            className={cn(
              "p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none",
              layout === "grid"
                ? "bg-white text-charcoal-900 shadow-xs"
                : "text-charcoal-500 hover:text-charcoal-900"
            )}
          >
            <LayoutGrid className="w-4 h-4 stroke-[2]" />
          </button>
          <button
            type="button"
            onClick={() => onLayoutChange("list")}
            aria-label="List view"
            className={cn(
              "p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none",
              layout === "list"
                ? "bg-white text-charcoal-900 shadow-xs"
                : "text-charcoal-500 hover:text-charcoal-900"
            )}
          >
            <List className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>
    </div>
  );
}
