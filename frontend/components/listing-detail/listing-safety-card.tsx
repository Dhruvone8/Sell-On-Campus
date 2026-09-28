"use client";

import * as React from "react";
import { ShieldCheck, Flag } from "lucide-react";

export interface ListingSafetyCardProps {
  listingId: string;
}

export function ListingSafetyCard({ listingId }: ListingSafetyCardProps) {
  const [reported, setReported] = React.useState(false);

  const handleReport = () => {
    setReported(true);
    setTimeout(() => {
      alert(`Listing #${listingId.slice(0, 8)} reported for review by campus moderation.`);
    }, 100);
  };

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

      <div className="pt-2 border-t border-amber-200/50 flex items-center justify-between">
        <span className="text-[11px] text-amber-700">Notice an issue with this listing?</span>
        <button
          type="button"
          onClick={handleReport}
          disabled={reported}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-60"
        >
          <Flag className="w-3 h-3" />
          <span>{reported ? "Reported" : "Report"}</span>
        </button>
      </div>
    </div>
  );
}
