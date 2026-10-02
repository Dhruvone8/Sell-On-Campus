"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";

export interface ListingSafetyCardProps {
  listingId?: string;
}

export function ListingSafetyCard({ listingId }: ListingSafetyCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/70 shadow-xs flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider font-jakarta">
            Campus Safety Guidelines
          </h4>
          <p className="text-xs text-amber-800 leading-relaxed">
            Always meet in well-lit, high-traffic campus zones like the student center, library lobby, or dorm common area. Test items before concluding your exchange.
          </p>
        </div>
      </div>
    </div>
  );
}
