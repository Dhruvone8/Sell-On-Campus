"use client";

import * as React from "react";
import Link from "next/link";
import { Listing, GetListingsResponse } from "@/lib/types";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/listing-card";
import { ArrowRight, PackageOpen, PlusCircle } from "lucide-react";
import { API_URL } from "@/lib/constants";

export function RecentListings() {
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function fetchRecent() {
      try {
        const apiUrl = API_URL;
        const res = await fetch(`${apiUrl}/api/listings?limit=8&sort=newest`, {
          // Standard credentials if session exists
          credentials: "include",
          headers: {
            "Accept": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to load listings: ${res.statusText}`);
        }

        const data: GetListingsResponse = await res.json();
        if (isMounted) {
          setListings(data.listings || []);
        }
      } catch (err: unknown) {
        if (isMounted) {
          // Keep empty or note error without breaking UI
          const message = err instanceof Error ? err.message : "Failed to load";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchRecent();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3 shrink-0 translate-y-[2px]">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500" />
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-charcoal-900 tracking-tight font-jakarta">
              Recently Added on Campus
            </h2>
          </div>
          <p className="text-sm text-charcoal-500 mt-1 pl-[22px]">
            Fresh items posted by students across campus dorms
          </p>
        </div>

        <Link
          href="/listings"
          className="text-sm font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 group transition-colors"
        >
          <span>Explore all items</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Grid or Skeletons or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <ListingCardSkeleton key={idx} aspectRatio="4/3" />
          ))}
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {listings.map((item) => (
            <ListingCard key={item.id} listing={item} aspectRatio="4/3" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-charcoal-200/70 p-10 sm:p-14 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-4">
            <PackageOpen className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-bold text-charcoal-900">
            {error ? "Unable to load campus listings" : "No active listings yet"}
          </h3>
          <p className="text-sm text-charcoal-500 mt-1 max-w-md mx-auto leading-relaxed">
            {error
              ? "We couldn't connect to the campus marketplace server. Check your connection or try again."
              : "Be the first student to post an item on your campus network! Textbooks, tech, cycles, and dorm essentials sell fast."}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            {error ? (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                <span>Retry Connection</span>
              </button>
            ) : (
              <Link
                href="/listings/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4 stroke-[2]" />
                <span>Post the First Listing</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
