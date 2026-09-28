/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import Link from "next/link";
import { Listing, ListingStatus } from "@/lib/types";
import { formatPrice, formatRelativeTime, cn } from "@/lib/utils";
import { StatusChanger } from "./status-changer";
import { Pencil, Eye, Tag, Calendar, Layers } from "lucide-react";

export interface MyListingCardProps {
  listing: Listing;
  onStatusChange?: (listingId: string, newStatus: ListingStatus) => void;
  className?: string;
}

const CONDITION_LABELS: Record<string, { label: string; badgeClass: string }> = {
  NEW: { label: "Brand New", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
  LIKE_NEW: { label: "Like New", badgeClass: "bg-blue-50 text-blue-700 border-blue-200/60" },
  GOOD: { label: "Good", badgeClass: "bg-amber-50 text-amber-700 border-amber-200/60" },
  FAIR: { label: "Fair", badgeClass: "bg-charcoal-100 text-charcoal-700 border-charcoal-200/60" },
};

export function MyListingCard({
  listing,
  onStatusChange,
  className,
}: MyListingCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const primaryImage = listing.images?.[0]?.imageUrl;
  const conditionMeta = listing.condition ? CONDITION_LABELS[listing.condition] : null;

  return (
    <div
      className={cn(
        "group bg-white rounded-2xl border border-charcoal-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col md:flex-row overflow-hidden",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative w-full md:w-56 h-48 md:h-auto shrink-0 bg-charcoal-100 overflow-hidden">
        {primaryImage && !imageError ? (
          <img
            src={primaryImage}
            alt={listing.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-charcoal-400 bg-charcoal-50 p-4">
            <Tag className="w-8 h-8 stroke-1 mb-1.5 opacity-60" />
            <span className="text-[11px] font-medium text-charcoal-400">No Image</span>
          </div>
        )}

        {/* Floating Condition Pill */}
        {conditionMeta && (
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                "inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border backdrop-blur-md shadow-2xs",
                conditionMeta.badgeClass
              )}
            >
              {conditionMeta.label}
            </span>
          </div>
        )}
      </div>

      {/* Main Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          {/* Top Row: Category, Date, and Status Changer */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-brand-600 text-[11px] flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {listing.category?.name || "Listing"}
              </span>
              <span className="text-charcoal-300">•</span>
              <span className="text-charcoal-500 text-[11px] flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatRelativeTime(listing.createdAt)}
              </span>
            </div>

            {/* Quick Status Changer */}
            <StatusChanger
              listingId={listing.id}
              currentStatus={listing.status}
              onStatusChange={(newStatus) => onStatusChange?.(listing.id, newStatus)}
            />
          </div>

          {/* Title */}
          <Link
            href={`/listings/${listing.id}`}
            className="block group/title focus:outline-none"
          >
            <h3 className="text-base sm:text-lg font-bold text-charcoal-900 group-hover/title:text-brand-600 transition-colors line-clamp-1">
              {listing.title}
            </h3>
          </Link>

          {/* Description */}
          {listing.description && (
            <p className="text-xs sm:text-sm text-charcoal-500 line-clamp-2 leading-relaxed">
              {listing.description}
            </p>
          )}

          {/* Specs tags if available */}
          {(listing.brand || listing.model || listing.color) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {listing.brand && (
                <span className="text-[11px] bg-charcoal-50 text-charcoal-600 border border-charcoal-200/70 px-2 py-0.5 rounded-md">
                  Brand: <strong className="font-medium text-charcoal-900">{listing.brand}</strong>
                </span>
              )}
              {listing.model && (
                <span className="text-[11px] bg-charcoal-50 text-charcoal-600 border border-charcoal-200/70 px-2 py-0.5 rounded-md">
                  Model: <strong className="font-medium text-charcoal-900">{listing.model}</strong>
                </span>
              )}
              {listing.color && (
                <span className="text-[11px] bg-charcoal-50 text-charcoal-600 border border-charcoal-200/70 px-2 py-0.5 rounded-md">
                  Color: <strong className="font-medium text-charcoal-900">{listing.color}</strong>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer: Price & Action Buttons */}
        <div className="pt-3 border-t border-charcoal-100 flex flex-wrap items-center justify-between gap-3">
          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-semibold text-charcoal-500">Price</span>
            <span className="text-lg sm:text-xl font-extrabold text-charcoal-900 font-jakarta">
              {formatPrice(listing.price)}
            </span>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-2">
            <Link
              href={`/listings/${listing.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-charcoal-700 bg-charcoal-50 hover:bg-charcoal-100 border border-charcoal-200/80 transition-colors shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View</span>
            </Link>

            <Link
              href={`/listings/${listing.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors shadow-xs active:scale-[0.98]"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
