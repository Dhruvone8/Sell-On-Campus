"use client";

import * as React from "react";
import { API_URL } from "@/lib/constants";

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem("soc_visitor_id");
    if (!id || id.length < 8) {
      id = "vis_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem("soc_visitor_id", id);
    }
    return id;
  } catch {
    return "";
  }
}

export function VisitorPill() {
  const [visitorCount, setVisitorCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    const visitorId = getOrCreateVisitorId();
    const hasRecordedSession = sessionStorage.getItem("soc_visit_recorded");

    async function recordOrFetchVisit() {
      try {
        if (!hasRecordedSession && visitorId) {
          const res = await fetch(`${API_URL}/api/stats/visit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ visitorId }),
          });
          if (res.ok) {
            const data = await res.json();
            if (isMounted && typeof data.totalVisitors === "number") {
              setVisitorCount(data.totalVisitors);
              sessionStorage.setItem("soc_visit_recorded", "1");
              return;
            }
          }
        }

        // Otherwise fetch the latest count
        const res = await fetch(`${API_URL}/api/stats/visitors`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && typeof data.totalVisitors === "number") {
            setVisitorCount(data.totalVisitors);
          }
        }
      } catch (err) {
        console.error("[VisitorPill] Failed to record visit:", err);
      }
    }

    recordOrFetchVisit();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2 sm:px-3 h-8 sm:h-9 rounded-xl bg-charcoal-50/70 border border-charcoal-200/80 text-charcoal-700 select-none shrink-0 transition-colors"
      title={visitorCount !== null ? `${visitorCount.toLocaleString()} unique visitors` : "Live visitors"}
      aria-label="Unique visitor counter"
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>

      {visitorCount !== null ? (
        <div className="flex items-center gap-1 leading-none text-xs sm:text-sm">
          <span className="font-bold text-charcoal-900 font-jakarta tracking-tight">
            {visitorCount.toLocaleString()}
          </span>
          <span className="hidden sm:inline text-charcoal-500 font-medium">
            visitors
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1 leading-none text-xs sm:text-sm">
          <span className="inline-block w-4 sm:w-8 h-3 bg-charcoal-200/60 rounded animate-pulse" />
          <span className="hidden sm:inline text-charcoal-400 font-medium">
            visitors
          </span>
        </div>
      )}
    </div>
  );
}
