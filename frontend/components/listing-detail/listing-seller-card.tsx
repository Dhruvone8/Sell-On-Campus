/* eslint-disable @next/next/no-img-element */
"use strict";

import * as React from "react";
import { ListingSeller } from "@/lib/types";
import { getInitials, formatDate } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

export interface ListingSellerCardProps {
  seller?: ListingSeller;
}

const YEAR_LABELS: Record<number, string> = {
  1: "Freshman",
  2: "Sophomore",
  3: "Junior",
  4: "Senior",
  5: "Graduate Student",
};

export function ListingSellerCard({ seller }: ListingSellerCardProps) {
  const name = seller?.name || seller?.fullName || "Campus Student";
  const image = seller?.profileImageUrl || seller?.avatarUrl;
  const initials = getInitials(name);

  const academicInfo = React.useMemo(() => {
    const parts: string[] = [];
    if (seller?.department) {
      parts.push(seller.department);
    }
    if (seller?.year && YEAR_LABELS[seller.year]) {
      parts.push(YEAR_LABELS[seller.year]);
    }
    if (seller?.createdAt) {
      parts.push(`Joined ${formatDate(seller.createdAt)}`);
    } else {
      parts.push("Verified Student");
    }
    return parts.join(" • ");
  }, [seller]);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-charcoal-200/70 shadow-xs flex items-center justify-between gap-3.5">
      <div className="flex items-center gap-3.5 min-w-0">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-charcoal-200/80 shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 font-bold text-base flex items-center justify-center ring-2 ring-brand-200 shrink-0">
            {initials}
          </div>
        )}

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-charcoal-900 text-base leading-snug truncate">
              {name}
            </h3>
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <span className="text-xs text-charcoal-500 truncate mt-0.5">
            {academicInfo}
          </span>
        </div>
      </div>

      <div className="hidden sm:block shrink-0">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
          Verified
        </span>
      </div>
    </div>
  );
}
