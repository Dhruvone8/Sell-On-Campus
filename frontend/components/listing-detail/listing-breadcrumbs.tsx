"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface ListingBreadcrumbsProps {
  categoryName?: string;
  listingTitle: string;
}

export function ListingBreadcrumbs({
  categoryName,
  listingTitle,
}: ListingBreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-xs sm:text-sm text-charcoal-500 py-1 overflow-hidden"
    >
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-brand-600 transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      <ChevronRight className="w-3.5 h-3.5 text-charcoal-300 shrink-0" />

      <Link
        href="/listings"
        className="hover:text-brand-600 transition-colors shrink-0"
      >
        Browse
      </Link>

      {categoryName && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-charcoal-300 shrink-0" />
          <Link
            href={`/listings?search=${encodeURIComponent(categoryName)}`}
            className="hover:text-brand-600 transition-colors shrink-0"
          >
            {categoryName}
          </Link>
        </>
      )}

      <ChevronRight className="w-3.5 h-3.5 text-charcoal-300 shrink-0" />

      <span className="text-charcoal-900 font-semibold truncate max-w-xs sm:max-w-md">
        {listingTitle}
      </span>
    </nav>
  );
}
