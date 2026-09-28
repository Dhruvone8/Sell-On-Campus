import * as React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
      <div className="relative overflow-hidden p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-500 via-brand-600 to-brand-500 text-white shadow-xl shadow-brand-500/20 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
        {/* Subtle decorative circles */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-xl text-center md:text-left relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold mb-3 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero Platform Cuts</span>
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white font-jakarta">
            Got items gathering dust in your dorm?
          </h3>
          <p className="text-sm sm:text-base text-white/90 mt-2 leading-relaxed">
            Take a photo, type a price, and hand it off between your next class. 100% free for verified campus students.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <Link
            href="/listings/create"
            className="px-6 py-3.5 rounded-xl bg-white text-brand-600 font-bold text-sm sm:text-base shadow-md hover:bg-white/95 transition-all hover:scale-[1.03] active:scale-[0.98] inline-flex items-center gap-2"
          >
            <span>Post Listing in 60s</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
