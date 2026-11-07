import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Laptop,
  Armchair,
  Bike,
  FlaskConical,
  Building2,
  ArrowRight,
} from "lucide-react";

interface CampusCategory {
  name: string;
  slug: string;
  icon: React.ElementType;
}

const CATEGORIES: CampusCategory[] = [
  {
    name: "Textbooks & Notes",
    slug: "textbooks",
    icon: BookOpen,
  },
  {
    name: "Laptops & Tech",
    slug: "tech",
    icon: Laptop,
  },
  {
    name: "Dorm & Living",
    slug: "dorm",
    icon: Armchair,
  },
  {
    name: "Cycles",
    slug: "cycles",
    icon: Bike,
  },
  {
    name: "Lab & Calculators",
    slug: "lab",
    icon: FlaskConical,
  },
  {
    name: "Subleases & Rides",
    slug: "subleases",
    icon: Building2,
  },
];

export function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-charcoal-900 tracking-tight font-jakarta">
            Dorm & Campus Categories
          </h2>
          <p className="text-sm text-charcoal-500 mt-1">
            Browse items sorted by university daily essentials
          </p>
        </div>

        <Link
          href="/listings"
          className="text-sm font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 group transition-colors self-start sm:self-auto"
        >
          <span>View all categories</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.name}
              href={`/listings?search=${encodeURIComponent(cat.name.split(" ")[0])}`}
              className="p-3.5 sm:p-4 rounded-xl bg-white hover:bg-charcoal-50/60 transition-[border-color,background-color] duration-150 border border-charcoal-200/80 shadow-2xs hover:border-charcoal-300 flex flex-col justify-between group cursor-pointer"
            >
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-charcoal-50 border border-charcoal-200/60 group-hover:border-brand-300 group-hover:bg-brand-50/60 text-charcoal-600 group-hover:text-brand-600 flex items-center justify-center transition-colors mb-3 sm:mb-4">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />
              </div>
              <div>
                <span className="block font-semibold text-charcoal-900 text-xs sm:text-sm leading-snug group-hover:text-brand-600 transition-colors">
                  {cat.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
