"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, PlusCircle } from "lucide-react";

const POPULAR_SEARCHES = [
  "Textbooks",
  "MacBook",
  "Dorm Decor",
  "Cycles",
  "Calculators",
];

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/listings?search=${encodeURIComponent(query)}`);
    } else {
      router.push("/listings");
    }
  };

  const handleQuickChip = (term: string) => {
    setSearchQuery(term);
    router.push(`/listings?search=${encodeURIComponent(term)}`);
  };

  return (
    <div className="relative w-full overflow-hidden pt-8 pb-14 sm:pb-20">
      {/* Dynamic Atmospheric Glow Underlay */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-brand-500/10 rounded-full blur-[110px] pointer-events-none -z-10" />
      <div className="absolute top-64 right-[-100px] w-[420px] h-[420px] bg-amber-500/15 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* University Live Hub Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-xs border border-charcoal-200/70 mt-8 sm:mt-10 mb-6">
            <span className="relative flex h-2 w-2 shrink-0 translate-y-[1px]">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            <span className="text-xs font-semibold tracking-wide uppercase text-charcoal-800 leading-none">
              Campus Student Network
            </span>
          </div>

          {/* Hero Typography with Brand Momentum */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-charcoal-900 tracking-tight leading-tight sm:leading-[1.1] mb-5 font-jakarta">
            The student marketplace{" "}
            <br className="hidden sm:inline" />
            <span className="text-brand-600 underline decoration-brand-500/25 decoration-wavy decoration-2">
              for your campus.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-charcoal-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Buy, sell, and trade textbooks, electronics, dorm essentials, and cycles directly with fellow students. Verified campus emails only.
          </p>

          {/* Prominent Search Glass Container */}
          <div className="w-full max-w-2xl bg-white/90 backdrop-blur-xl p-2.5 rounded-2xl shadow-xl shadow-charcoal-900/[0.04] border border-charcoal-200/80 mb-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full flex items-center">
                <Search className="w-5 h-5 absolute left-3.5 text-charcoal-400 stroke-[2] pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search TI-84, Chem 31A books, desk fans, bikes..."
                  className="w-full pl-11 pr-4 py-3 bg-charcoal-50/70 rounded-xl text-sm font-medium text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/25 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
              >
                <span>Find Gear</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>

            {/* Quick Suggestion Pills */}
            <div className="flex items-center gap-2 pt-2.5 px-1 overflow-x-auto no-scrollbar">
              <span className="text-xs text-charcoal-400 uppercase font-bold tracking-wider shrink-0">
                Popular:
              </span>
              {POPULAR_SEARCHES.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleQuickChip(chip)}
                  className="px-2.5 py-1 min-h-[32px] rounded-lg bg-charcoal-100/70 text-charcoal-700 text-xs font-semibold hover:bg-charcoal-200/80 hover:text-charcoal-900 transition-colors shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Dual Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/listings"
              className="px-6 py-3 min-h-[44px] inline-flex items-center justify-center rounded-xl bg-charcoal-900 text-white text-sm font-bold hover:bg-charcoal-800 shadow-sm transition-all hover:scale-[1.03] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
            >
              Explore All Listings
            </Link>
            <Link
              href="/listings/create"
              className="px-6 py-3 min-h-[44px] rounded-xl bg-white text-charcoal-900 text-sm font-bold hover:bg-charcoal-50 shadow-sm border border-charcoal-200/80 transition-all inline-flex items-center gap-2 hover:scale-[1.03] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
            >
              <PlusCircle className="w-5 h-5 text-brand-500 stroke-[2]" />
              <span>List an Item for Free</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
