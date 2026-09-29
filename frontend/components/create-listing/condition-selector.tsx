"use client";

import * as React from "react";
import { ListingCondition } from "@/lib/types";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConditionSelectorProps {
  value: ListingCondition;
  onChange: (value: ListingCondition) => void;
}

const CONDITIONS: {
  value: ListingCondition;
  label: string;
  desc: string;
  badge: string;
}[] = [
  {
    value: "NEW",
    label: "Brand New",
    desc: "Unopened or unused with original tags & packaging",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    value: "LIKE_NEW",
    label: "Like New",
    desc: "Barely used, immaculate condition with no flaws",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    value: "GOOD",
    label: "Good",
    desc: "Fully functional with minor, normal signs of wear",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    value: "FAIR",
    label: "Fair",
    desc: "Visible cosmetic wear or scratches, but fully functional",
    badge: "bg-charcoal-100 text-charcoal-700 border-charcoal-200",
  },
];

export function ConditionSelector({ value, onChange }: ConditionSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-charcoal-900 block font-jakarta">
        Item Condition <span className="text-brand-500">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CONDITIONS.map((cond) => {
          const isSelected = value === cond.value;

          return (
            <button
              key={cond.value}
              type="button"
              onClick={() => onChange(cond.value)}
              className={cn(
                "p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-1.5",
                isSelected
                  ? "border-brand-500 bg-brand-50/20 ring-1 ring-brand-500 shadow-2xs"
                  : "border-charcoal-200/80 bg-white hover:border-charcoal-300 hover:bg-charcoal-50/50"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-md text-xs font-bold border",
                    cond.badge
                  )}
                >
                  {cond.label}
                </span>

                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                    isSelected
                      ? "bg-brand-500 text-white"
                      : "border border-charcoal-300 bg-charcoal-50"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              <p className="text-xs text-charcoal-500 leading-normal">
                {cond.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
