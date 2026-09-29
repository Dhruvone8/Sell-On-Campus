/* eslint-disable @next/next/no-img-element */
"use strict";

import * as React from "react";
import Link from "next/link";
import { Listing } from "@/lib/types";
import { formatPrice, formatRelativeTime, getInitials, cn } from "@/lib/utils";
import { Tag } from "lucide-react";

export interface ListingCardProps {
  listing: Listing;
  aspectRatio?: "4/3" | "square";
  layout?: "grid" | "list";
  className?: string;
}

const CONDITION_LABELS: Record<string, { label: string; badgeClass: string }> = {
  NEW: { label: "Brand New", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
  LIKE_NEW: { label: "Like New", badgeClass: "bg-blue-50 text-blue-700 border-blue-200/60" },
  GOOD: { label: "Good", badgeClass: "bg-amber-50 text-amber-700 border-amber-200/60" },
  FAIR: { label: "Fair", badgeClass: "bg-charcoal-100 text-charcoal-700 border-charcoal-200/60" },
};

export function ListingCard({
  listing,
  aspectRatio = "4/3",
  layout = "grid",
  className,
}: ListingCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const primaryImage = listing.images?.[0]?.imageUrl;
  const conditionMeta = listing.condition ? CONDITION_LABELS[listing.condition] : null;

  const sellerName = listing.seller?.name || listing.seller?.fullName || "Campus Student";
  const sellerInitials = getInitials(sellerName);
  const sellerImage = listing.seller?.profileImageUrl || listing.seller?.avatarUrl;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className={cn(
        "group bg-white rounded-2xl overflow-hidden border border-charcoal-200/70 shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30",
        layout === "list" ? "flex flex-col sm:flex-row" : "flex flex-col",
        className
      )}
    >
      {/* Media Box */}
      <div
        className={cn(
          "relative bg-charcoal-100 overflow-hidden shrink-0",
          layout === "list"
            ? "w-full sm:w-56 h-48 sm:h-auto"
            : aspectRatio === "4/3"
            ? "w-full aspect-[4/3]"
            : "w-full aspect-square"
        )}
      >
        {primaryImage && !imageError ? (
          <img
            src={primaryImage}
            alt={listing.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-charcoal-100 to-charcoal-200/60 text-charcoal-400 p-4 text-center">
            <Tag className="w-8 h-8 mb-1.5 stroke-[1.5] text-charcoal-400" />
            <span className="text-xs font-medium text-charcoal-500">
              {listing.category?.name || "Campus Item"}
            </span>
          </div>
        )}

        {/* Condition Capsule (Top Right) */}
        {conditionMeta && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold border backdrop-blur-md shadow-xs tracking-tight",
                conditionMeta.badgeClass
              )}
            >
              {conditionMeta.label}
            </span>
          </div>
        )}

        {/* Floating Price Capsule (Bottom Left) */}
        <div className="absolute bottom-2.5 left-2.5 px-3 py-1 rounded-xl bg-charcoal-900/90 backdrop-blur-md text-white font-black text-lg tracking-tight shadow-md flex items-baseline gap-1">
          <span>{formatPrice(listing.price)}</span>
        </div>

        {/* Reserved / Sold Badge overlay */}
        {listing.status && listing.status !== "ACTIVE" && (
          <div className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3.5 py-1.5 rounded-xl bg-white text-charcoal-900 font-extrabold text-xs tracking-wider uppercase shadow-md">
              {listing.status}
            </span>
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1.5">
          {/* Category & Timestamp */}
          <div className="flex items-center justify-between text-xs text-charcoal-500">
            <span className="font-bold uppercase tracking-wider text-brand-600 text-[11px]">
              {listing.category?.name || "Marketplace"}
            </span>
            <span className="text-charcoal-400 text-[11px]">
              {formatRelativeTime(listing.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-charcoal-900 group-hover:text-brand-600 transition-colors line-clamp-1 text-base leading-snug">
            {listing.title}
          </h3>

          {/* Description */}
          {listing.description && (
            <p className={cn(
              "text-xs text-charcoal-500 leading-relaxed",
              layout === "list" ? "line-clamp-3 sm:line-clamp-2" : "line-clamp-2"
            )}>
              {listing.description}
            </p>
          )}
        </div>

        {/* Footer with Seller & Verified Campus */}
        <div className="pt-3 flex items-center justify-between border-t border-charcoal-100">
          <div className="flex items-center gap-2 min-w-0">
            {sellerImage ? (
              <img
                src={sellerImage}
                alt={sellerName}
                className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-charcoal-200"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                {sellerInitials}
              </div>
            )}
            <span className="text-xs font-semibold text-charcoal-700 truncate max-w-[140px]">
              {sellerName}
            </span>
          </div>

          <span className="text-[11px] font-medium text-charcoal-400">
            Verified
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ListingCardSkeleton({
  aspectRatio = "4/3",
  layout = "grid",
}: {
  aspectRatio?: "4/3" | "square";
  layout?: "grid" | "list";
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl overflow-hidden border border-charcoal-200/70 shadow-xs animate-pulse",
        layout === "list" ? "flex flex-col sm:flex-row" : "flex flex-col"
      )}
    >
      <div
        className={cn(
          "bg-charcoal-200/70 relative shrink-0",
          layout === "list"
            ? "w-full sm:w-56 h-48 sm:h-auto"
            : aspectRatio === "4/3"
            ? "w-full aspect-[4/3]"
            : "w-full aspect-square"
        )}
      />
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-3 w-16 bg-charcoal-200 rounded" />
            <div className="h-3 w-12 bg-charcoal-200 rounded" />
          </div>
          <div className="h-4 w-3/4 bg-charcoal-200 rounded" />
          <div className="h-3 w-full bg-charcoal-100 rounded" />
        </div>
        <div className="pt-3 flex items-center justify-between border-t border-charcoal-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-charcoal-200" />
            <div className="h-3 w-20 bg-charcoal-200 rounded" />
          </div>
          <div className="h-3 w-10 bg-charcoal-100 rounded" />
        </div>
      </div>
    </div>
  );
}
