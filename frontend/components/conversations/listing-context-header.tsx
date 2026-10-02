/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import Link from "next/link";
import { formatPrice, getInitials, cn } from "@/lib/utils";
import { ArrowLeft, ExternalLink, CheckCircle } from "lucide-react";

export interface ListingContextHeaderProps {
  otherUser: {
    id: string;
    name: string;
    profileImageUrl: string | null;
  };
  listing: {
    id: string;
    title: string;
    price: string | number;
    status: string;
  };
  isConnected?: boolean;
  onBack?: () => void;
  className?: string;
}

const STATUS_PILLS: Record<string, { label: string; badgeClass: string }> = {
  ACTIVE: {
    label: "Active",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  },
  RESERVED: {
    label: "Reserved",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80",
  },
  SOLD: {
    label: "Sold",
    badgeClass: "bg-charcoal-100 text-charcoal-500 border-charcoal-200 line-through",
  },
};

export function ListingContextHeader({
  otherUser,
  listing,
  isConnected,
  onBack,
  className,
}: ListingContextHeaderProps) {
  const initials = getInitials(otherUser.name || "Student");
  const statusMeta = STATUS_PILLS[listing.status] || STATUS_PILLS.ACTIVE;

  return (
    <div
      className={cn(
        "p-3.5 sm:p-4 bg-white border-b border-charcoal-200/80 flex flex-col gap-3 shrink-0 shadow-2xs",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Back button (mobile) + Peer Student Info */}
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="md:hidden p-1.5 rounded-xl hover:bg-charcoal-100 text-charcoal-600 transition-colors cursor-pointer shrink-0"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Peer Avatar */}
          <div className="relative shrink-0">
            {otherUser.profileImageUrl ? (
              <img
                src={otherUser.profileImageUrl}
                alt={otherUser.name}
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-charcoal-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200/70 flex items-center justify-center text-brand-600 font-bold text-xs font-jakarta">
                {initials}
              </div>
            )}
          </div>

          {/* Peer Name & Subtitle */}
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="text-sm font-bold text-charcoal-900 font-jakarta truncate">
                {otherUser.name}
              </h3>
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 shrink-0"
                title="Verified student seller"
              >
                <CheckCircle className="w-3 h-3 text-emerald-600 stroke-[2.2]" />
                <span className="hidden sm:inline">Verified</span>
              </span>
            </div>

            <p className="text-[11px] text-charcoal-500 font-medium truncate">
              Campus Marketplace Chat
            </p>
          </div>
        </div>

        {/* Right: Embedded Listing Mini Card */}
        <div className="flex items-center gap-2 sm:gap-2.5 bg-canvas px-2.5 sm:px-3 py-1.5 rounded-xl border border-charcoal-200/70 shrink-0">
          <div className="min-w-0 text-right sm:text-left">
            <div className="flex items-center justify-end sm:justify-start gap-1.5">
              <span className="text-xs font-bold text-charcoal-900 truncate max-w-[95px] sm:max-w-[180px]">
                {listing.title}
              </span>
              <span
                className={cn(
                  "hidden sm:inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded-full border",
                  statusMeta.badgeClass
                )}
              >
                {statusMeta.label}
              </span>
            </div>
            <span className="text-xs font-extrabold text-charcoal-900 font-jakarta">
              {formatPrice(listing.price)}
            </span>
          </div>

          <Link
            href={`/listings/${listing.id}`}
            className="p-1.5 rounded-lg bg-white hover:bg-charcoal-100 border border-charcoal-200 text-charcoal-700 transition-colors shadow-2xs"
            title="View full listing details"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
