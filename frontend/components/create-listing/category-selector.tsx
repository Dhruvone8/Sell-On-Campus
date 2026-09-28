"use client";

import * as React from "react";
import { Category } from "@/lib/types";
import { ChevronsUpDown } from "lucide-react";

export interface CategorySelectorProps {
  value: string;
  onChange: (categoryId: string) => void;
  error?: string;
}

const FALLBACK_CATEGORIES: Category[] = [
  { id: "095f6600-e992-4e23-8687-6c9b38163e04", name: "Books" },
  { id: "94340a8f-3f54-476a-a611-b78cf88a0864", name: "Cycles" },
  { id: "493f7421-52c1-4ee1-b859-56f23452f1bd", name: "Electronics" },
  { id: "554dc5e9-bcd0-4ff9-860c-e0e845283a96", name: "Furniture" },
  { id: "0a4677e8-9e92-4ca7-a992-e44d3985464f", name: "Hostel Items" },
  { id: "b289796a-9f4f-4226-a9bf-418c508c4335", name: "Lab Equipment" },
  { id: "8e48ab2b-f73b-40a2-a1b9-63c2b23f4b49", name: "Stationery" },
  { id: "39a4bad6-9b84-4fb7-8166-d03188e9c541", name: "Other" },
];

export function CategorySelector({
  value,
  onChange,
  error,
}: CategorySelectorProps) {
  const [categories, setCategories] = React.useState<Category[]>(FALLBACK_CATEGORIES);

  React.useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/listings/categories`, {
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
          }
        }
      } catch {
        // Retain fallback list
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-1.5 w-full">
      <label className="text-sm font-bold text-charcoal-900 block font-jakarta">
        Category <span className="text-brand-500">*</span>
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-4 py-2.5 rounded-xl bg-charcoal-50 border border-charcoal-200/80 text-sm font-medium text-charcoal-900 placeholder:text-charcoal-400 focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
        >
          <option value="" disabled>
            Select a campus category...
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <ChevronsUpDown className="w-4 h-4 text-charcoal-400 absolute right-3.5 top-3.5 pointer-events-none" />
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
