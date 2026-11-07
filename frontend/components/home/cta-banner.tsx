import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
      <div className="relative overflow-hidden p-8 sm:p-10 rounded-2xl bg-charcoal-900 text-white border border-charcoal-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
        <div className="max-w-xl text-center md:text-left relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/10 text-brand-300 text-xs font-semibold mb-3 border border-white/10">
            <Check className="w-3.5 h-3.5 stroke-[2]" />
            <span>Zero Platform Fees</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-jakarta">
            Got items gathering dust in your dorm?
          </h3>
          <p className="text-sm sm:text-base text-charcoal-300 mt-2 leading-relaxed">
            Take a photo, type a price, and hand it off between your next class. Free for verified campus students.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <Link
            href="/listings/create"
            className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm sm:text-base shadow-xs transition-colors inline-flex items-center gap-2"
          >
            <span>Post Listing</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
