"use client";

import * as React from "react";
import { Listing } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export interface ListingSpecsTableProps {
  listing: Listing;
}

const CONDITION_EXPLANATION: Record<string, string> = {
  NEW: "Brand new condition. Unopened, unused, or with original tags/packaging.",
  LIKE_NEW: "Shows almost no signs of wear. Fully functional, immaculate condition.",
  GOOD: "Gently used with minor normal wear. Fully functional and well maintained.",
  FAIR: "Visible cosmetic wear, scratches, or aging. Fully functional for campus use.",
};

export function ListingSpecsTable({ listing }: ListingSpecsTableProps) {
  const specs: { label: string; value: string | null | undefined }[] = [
    { label: "Category", value: listing.category?.name },
    { label: "Condition", value: listing.condition ? listing.condition.replace("_", " ") : null },
    { label: "Brand", value: listing.brand },
    { label: "Model", value: listing.model },
    { label: "Color", value: listing.color },
    { label: "Status", value: listing.status },
    { label: "Listed On", value: formatDate(listing.createdAt) },
  ].filter((s) => s.value !== null && s.value !== undefined && s.value !== "");

  const conditionDesc = listing.condition ? CONDITION_EXPLANATION[listing.condition] : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Description & Condition Section */}
      <div className="p-6 rounded-2xl bg-white border border-charcoal-200/70 shadow-xs flex flex-col gap-4">
        <h2 className="text-lg font-bold text-charcoal-900 font-jakarta">
          Description &amp; Condition
        </h2>

        <div className="text-sm text-charcoal-700 leading-relaxed whitespace-pre-line">
          {listing.description}
        </div>

        {conditionDesc && (
          <div className="p-4 rounded-xl bg-charcoal-50 border border-charcoal-200/60 flex flex-col gap-1">
            <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
              Condition Note ({listing.condition.replace("_", " ")})
            </span>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              {conditionDesc}
            </p>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-brand-50/60 border border-brand-100 flex items-center justify-between text-xs text-brand-800">
          <span>Campus meetup recommended</span>
          <span className="font-bold">Test before completing exchange</span>
        </div>
      </div>

      {/* Item Specifications Table */}
      <div className="p-6 rounded-2xl bg-white border border-charcoal-200/70 shadow-xs flex flex-col gap-4">
        <h2 className="text-lg font-bold text-charcoal-900 font-jakarta">
          Specifications
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-xs sm:text-sm">
          {specs.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-2 border-b border-charcoal-100"
            >
              <span className="text-charcoal-500 font-medium">{item.label}</span>
              <span className="font-semibold text-charcoal-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
