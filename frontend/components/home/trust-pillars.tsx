import * as React from "react";
import { Store, MessageSquare, PlusCircle, CheckCircle, MessagesSquare, Zap } from "lucide-react";

const PILLARS = [
  {
    icon: Store,
    title: "Direct Campus Marketplace",
    description:
      "Browse and trade dorm furniture, tech, and course materials directly with peers right across your campus.",
    tagIcon: CheckCircle,
    tagLabel: "Campus Community",
  },
  {
    icon: MessageSquare,
    title: "Built-in Messaging",
    description:
      "Inquire about items, coordinate meetup times, and agree on pricing directly within the platform's chat.",
    tagIcon: MessagesSquare,
    tagLabel: "Direct In-App Chat",
  },
  {
    icon: PlusCircle,
    title: "Quick & Simple Listing",
    description:
      "Snap a photo, choose a category, and list items in under a minute without platform cut or complicated fees.",
    tagIcon: Zap,
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
            const TagIcon = pillar.tagIcon;
            return (
              <div
                key={pillar.title}
                className="p-8 rounded-3xl bg-white border border-charcoal-200/70 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
              >
                <div>
                  <div className="h-14 w-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-6 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                    <Icon className="w-7 h-7 stroke-[2]" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal-900 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 flex items-center gap-2 text-brand-600 text-xs font-bold border-t border-charcoal-100">
                  <TagIcon className="w-4 h-4 stroke-[2]" />
                  <span>{pillar.tagLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
