import * as React from "react";
import { Store, MessageSquare, PlusCircle } from "lucide-react";

const PILLARS = [
  {
    icon: Store,
    title: "Direct Campus Marketplace",
    description:
      "Browse and trade dorm furniture, tech, and course materials directly with peers right across your campus.",
    tagLabel: "Campus Community",
  },
  {
    icon: MessageSquare,
    title: "Built-in Messaging",
    description:
      "Inquire about items, coordinate meetup times, and agree on pricing directly within the platform's chat.",
    tagLabel: "Direct In-App Chat",
  },
  {
    icon: PlusCircle,
    title: "Quick & Simple Listing",
    description:
      "Snap a photo, choose a category, and list items in under a minute without platform cut or complicated fees.",
    tagLabel: "Instant Publishing",
  },
];

export function TrustPillars() {
  return (
    <section className="w-full bg-charcoal-50/70 py-16 sm:py-20 border-y border-charcoal-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
            Built For University Life
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-charcoal-900 tracking-tight mt-2 font-jakarta">
            Why SellOnCampus?
          </h2>
          <p className="text-base sm:text-lg text-charcoal-600 mt-2">
            Designed to make campus commerce straightforward, direct, and focused on fellow students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-6 sm:p-7 rounded-2xl bg-white border border-charcoal-200/80 shadow-xs hover:border-charcoal-300 hover:shadow-sm transition-[border-color,box-shadow] duration-200 flex flex-col justify-between relative overflow-hidden group"
              >
                <div>
                  <div className="h-10 w-10 rounded-xl bg-charcoal-100/90 text-charcoal-800 border border-charcoal-200/60 flex items-center justify-center mb-5 group-hover:border-brand-300 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    <Icon className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <h3 className="text-lg font-bold text-charcoal-900 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-3.5 flex items-center justify-between text-charcoal-500 text-xs font-medium border-t border-charcoal-100">
                  <span className="text-brand-700 font-semibold">{pillar.tagLabel}</span>
                  <span className="text-charcoal-500">Verified peers</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
