"use client";

import * as React from "react";
import Link from "next/link";
import { Listing, GetListingsResponse } from "@/lib/types";
import { ListingCard } from "@/components/listings/listing-card";
import { ArrowRight } from "lucide-react";
import { API_URL } from "@/lib/constants";

export interface RelatedListingsProps {
  categoryName?: string;
  currentListingId: string;
}

export function RelatedListings({
  categoryName,
  currentListingId,
}: RelatedListingsProps) {
  const [relatedItems, setRelatedItems] = React.useState<Listing[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    async function fetchRelated() {
      try {
        const apiUrl = API_URL;
        const queryParams = new URLSearchParams();
        queryParams.set("limit", "5");
        queryParams.set("sort", "newest");
        if (categoryName) {
          queryParams.set("search", categoryName.split(" ")[0]);
        }

        const res = await fetch(`${apiUrl}/api/listings?${queryParams.toString()}`, {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) return;

        const data: GetListingsResponse = await res.json();
        if (isMounted && data.listings) {
          // Filter out current listing and take top 4
          const filtered = data.listings
            .filter((item) => item.id !== currentListingId)
            .slice(0, 4);
          setRelatedItems(filtered);
        }
      } catch {
        // Fallback silently if related query fails
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchRelated();

    return () => {
      isMounted = false;
    };
  }, [categoryName, currentListingId]);

  if (isLoading || relatedItems.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-6 pt-10 border-t border-charcoal-200/80 w-full">
      <div className="flex items-center justify-between pb-2 border-b border-charcoal-200/70">
        <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 font-jakarta">
          {categoryName ? `More from ${categoryName}` : "More on Campus"}
        </h2>

        <Link
          href={
            categoryName
              ? `/listings?search=${encodeURIComponent(categoryName.split(" ")[0])}`
              : "/listings"
          }
          className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {relatedItems.map((item) => (
          <ListingCard key={item.id} listing={item} aspectRatio="4/3" />
        ))}
      </div>
    </section>
  );
}
