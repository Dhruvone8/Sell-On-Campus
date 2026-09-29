"use client";

import * as React from "react";
import {
  RotateCcw,
  Sparkles,
  BookOpen,
  Laptop,
  Armchair,
  Bike,
  Shirt,
  MoreHorizontal,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterValues {
  search?: string;
  category?: string;
  condition?: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";
  minPrice?: string;
  maxPrice?: string;
  sort?: "newest" | "oldest" | "price_asc" | "price_desc";
}

export interface FilterSidebarProps {
  filters: FilterValues;
  onFilterChange: (newFilters: Partial<FilterValues>) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
}

const CATEGORY_ITEMS = [
  { label: "All Marketplace", key: "", icon: Sparkles },
  { label: "Books & Notes", key: "Books", icon: BookOpen },
  { label: "Electronics & Tech", key: "Electronics", icon: Laptop },
  { label: "Hostel & Dorm Gear", key: "Hostel", icon: Armchair },
  { label: "Cycles & Transport", key: "Cycles", icon: Bike },
  { label: "Furniture & Decor", key: "Furniture", icon: Shirt },
  { label: "Lab & Stationery", key: "Stationery", icon: MoreHorizontal },
];

const CONDITION_OPTIONS = [
  { label: "All Conditions", value: undefined },
  { label: "Brand New", value: "NEW" as const },
  { label: "Like New", value: "LIKE_NEW" as const },
  { label: "Good", value: "GOOD" as const },
  { label: "Fair", value: "FAIR" as const },
];

const PRICE_PRESETS = [
  { label: "Under ₹500", min: "", max: "500" },
  { label: "₹500 - ₹2,000", min: "500", max: "2000" },
  { label: "₹2,000 - ₹5,000", min: "2000", max: "5000" },
  { label: "₹5,000+", min: "5000", max: "" },
];

export function FilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
  activeFilterCount,
}: FilterSidebarProps) {
  const currentCategory = filters.category || "";

  return (
    <div className="space-y-4">
      {/* Filter Card Container */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-charcoal-200/70 shadow-xs p-5 flex flex-col gap-6">
        {/* Categories Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
              Categories
            </span>
            {currentCategory && (
              <button
                type="button"
                onClick={() => onFilterChange({ category: undefined })}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1">
            {CATEGORY_ITEMS.map((item) => {
              const Icon = item.icon;
              const isSelected =
                (!item.key && !currentCategory) ||
                (item.key && currentCategory.toLowerCase() === item.key.toLowerCase());

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      category: item.key ? item.key : undefined,
                    })
                  }
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer text-sm font-medium",
                    isSelected
                      ? "bg-charcoal-100 text-charcoal-900 font-bold"
                      : "text-charcoal-700 hover:bg-charcoal-50 hover:text-charcoal-900"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        isSelected ? "text-brand-600" : "text-charcoal-400"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range Section */}
        <div className="space-y-3 pt-3 border-t border-charcoal-100">
          <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block">
            Price Range
          </span>

          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-charcoal-400">
                ₹
              </span>
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={filters.minPrice || ""}
                onChange={(e) =>
                  onFilterChange({ minPrice: e.target.value || undefined })
                }
                className="w-full pl-7 pr-2.5 py-1.5 rounded-xl bg-charcoal-50 border border-charcoal-200/80 text-xs font-semibold text-charcoal-900 placeholder:text-charcoal-400 focus:bg-white focus:border-brand-500 focus:outline-none transition-all"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-charcoal-400">
                ₹
              </span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={filters.maxPrice || ""}
                onChange={(e) =>
                  onFilterChange({ maxPrice: e.target.value || undefined })
                }
                className="w-full pl-7 pr-2.5 py-1.5 rounded-xl bg-charcoal-50 border border-charcoal-200/80 text-xs font-semibold text-charcoal-900 placeholder:text-charcoal-400 focus:bg-white focus:border-brand-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Quick Price Preset Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {PRICE_PRESETS.map((preset) => {
              const isActive =
                (filters.minPrice || "") === preset.min &&
                (filters.maxPrice || "") === preset.max;

              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      minPrice: preset.min || undefined,
                      maxPrice: preset.max || undefined,
                    })
                  }
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                    isActive
                      ? "bg-charcoal-900 text-white"
                      : "bg-charcoal-100/70 text-charcoal-700 hover:bg-charcoal-200/70"
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Item Condition Section */}
        <div className="space-y-2.5 pt-3 border-t border-charcoal-100">
          <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block">
            Item Condition
          </span>

          <div className="flex flex-col gap-1.5">
            {CONDITION_OPTIONS.map((opt) => {
              const isChecked = filters.condition === opt.value;

              return (
                <label
                  key={opt.label}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-charcoal-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="condition"
                      checked={isChecked}
                      onChange={() => onFilterChange({ condition: opt.value })}
                      className="w-4 h-4 accent-brand-500 text-brand-500 focus:ring-0 cursor-pointer"
                    />
                    <span
                      className={cn(
                        "text-xs font-medium transition-colors",
                        isChecked
                          ? "text-brand-600 font-bold"
                          : "text-charcoal-700 group-hover:text-charcoal-900"
                      )}
                    >
                      {opt.label}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Clear All Filters Button */}
        <div className="pt-3 border-t border-charcoal-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onResetFilters}
            className="text-left text-xs font-bold text-charcoal-500 hover:text-brand-600 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear all filters</span>
          </button>
          {activeFilterCount > 0 && (
            <span className="text-[11px] font-bold text-charcoal-400 bg-charcoal-100 px-2 py-0.5 rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>
      </div>

      {/* Campus Safety Card Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 shadow-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold block mb-0.5">Campus Safety Tip</span>
          Always meet in daylight at public spots like the campus library or student center plaza.
        </div>
      </div>
    </div>
  );
}
