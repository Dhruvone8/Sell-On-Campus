"use client";

import * as React from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { CAMPUS_FAQS } from "./faq-data";

export { CAMPUS_FAQS, type FaqItem } from "./faq-data";

export function FaqSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="w-full py-16 sm:py-20 bg-charcoal-50/60 border-b border-charcoal-200/70">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-charcoal-900 tracking-tight font-jakarta">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-charcoal-600 mt-2 max-w-xl mx-auto">
            Everything you need to know about buying, selling, and connecting safely on your campus network.
          </p>
        </div>

        <div className="space-y-3">
          {CAMPUS_FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="bg-white rounded-2xl border border-charcoal-200/80 overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-bold text-charcoal-900 pr-4 font-jakarta">
                    {faq.question}
                  </span>
                  <div
                    className={`h-8 w-8 rounded-full bg-charcoal-50 border border-charcoal-200/60 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-brand-50 text-brand-600 border-brand-200" : "text-charcoal-500"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 text-sm sm:text-base text-charcoal-600 leading-relaxed border-t border-charcoal-100 mt-1">
                    <p className="pt-3">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
