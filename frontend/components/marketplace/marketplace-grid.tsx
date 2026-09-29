"use client";

import * as React from "react";
import Link from "next/link";
import { Listing } from "@/lib/types";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/listing-card";
import { PackageSearch, PlusCircle, RotateCcw } from "lucide-react";

export interface MarketplaceGridProps {
  listings: Listing[];
  isLoading: boolean;
  layout: "grid" | "list";
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export function MarketplaceGrid({
  listings,
  isLoading,
  layout,
  onResetFilters,
  hasActiveFilters,
}: MarketplaceGridProps) {
  if (isLoading) {
    return (
      <div
        className={
          layout === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            : "flex flex-col gap-4"
        }
      >
        {Array.from({ length: 6 }).map((_, idx) => (
          <ListingCardSkeleton
            key={idx}
            aspectRatio="square"
            layout={layout}
          />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-charcoal-200/70 p-10 sm:p-14 text-center max-w-lg mx-auto shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-charcoal-100 text-charcoal-500 flex items-center justify-center mx-auto mb-4">
          <PackageSearch className="w-7 h-7 stroke-[1.5]" />
        </div>
        <h3 className="text-lg font-bold text-charcoal-900 font-jakarta">
          No campus listings found
        </h3>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-1 max-w-sm mx-auto leading-relaxed">
          {hasActiveFilters
            ? "No items match your active filters. Try broadening your price range or clearing selected categories."
            : "There are currently no items available in the student marketplace."}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-charcoal-100 hover:bg-charcoal-200 text-charcoal-800 text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
          <Link
            href="/listings/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 stroke-[2]" />
            <span>List an Item</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        layout === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          : "flex flex-col gap-4"
      }
    >
      {listings.map((item) => (
        <ListingCard
          key={item.id}
          listing={item}
          aspectRatio="square"
          layout={layout}
        />
      ))}
    </div>
  );
}
