"use client";

import * as React from "react";
import Link from "next/link";
import { Listing } from "@/lib/types";
import {
  ListingBreadcrumbs,
  ListingGallery,
  ListingInfoCard,
  ListingSellerCard,
  ListingSpecsTable,
  ListingSafetyCard,
  RelatedListings,
} from "@/components/listing-detail";
import { ArrowLeft, PackageX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface ListingDetailContentProps {
  id: string;
}

export function ListingDetailContent({ id }: ListingDetailContentProps) {
  const [listing, setListing] = React.useState<Listing | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function fetchListing() {
      await Promise.resolve();
      if (!isMounted) return;
      setIsLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/listings/${id}`, {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Listing not found or has been removed.");
          }
          throw new Error(`Failed to load listing (${res.status})`);
        }

        const data = await res.json();
        if (isMounted) {
          setListing(data.listing);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Error loading listing";
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (id) {
      fetchListing();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 animate-pulse">
        <Skeleton className="h-6 w-72 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-5 flex flex-col gap-5">
            <Skeleton className="h-72 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-charcoal-200/70 shadow-xs max-w-md w-full">
          <div className="w-14 h-14 rounded-2xl bg-charcoal-100 text-charcoal-500 flex items-center justify-center mx-auto mb-4">
            <PackageX className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-bold text-charcoal-900 font-jakarta">
            Listing Unavailable
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1.5 leading-relaxed">
            {error || "This item may have been sold or removed by the student seller."}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              href="/listings"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-8 flex flex-col gap-6">
      {/* Simple Breadcrumb Navigation */}
      <ListingBreadcrumbs
        categoryName={listing.category?.name}
        listingTitle={listing.title}
      />

      {/* Main 2-Column Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Gallery & Details */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <ListingGallery
            images={listing.images || []}
            title={listing.title}
          />

          <ListingSpecsTable listing={listing} />
        </div>

        {/* Right Column: Sticky Buy Box & Seller Profile */}
        <div className="lg:col-span-5 flex flex-col gap-5 lg:sticky lg:top-24">
          <ListingInfoCard listing={listing} />

          <ListingSellerCard seller={listing.seller} />

          <ListingSafetyCard listingId={listing.id} />
        </div>
      </div>

      {/* "More from this category" Related Listings */}
      <RelatedListings
        categoryName={listing.category?.name}
        currentListingId={listing.id}
      />
    </div>
  );
}
