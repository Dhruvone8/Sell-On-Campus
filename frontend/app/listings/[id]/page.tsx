import * as React from "react";
import type { Metadata } from "next";
import { ListingDetailContent } from "./listing-detail-content";
import { Skeleton } from "@/components/ui/skeleton";

import { API_URL, APP_LOGO_URL, SITE_URL } from "@/lib/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${API_URL}/api/listings/${id}`, {
      next: { revalidate: 60 },
      headers: {
        Accept: "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      const listing = data.listing;

      if (listing) {
        const title = `${listing.title} | SellOnCampus`;
        const priceFormatted = listing.price
          ? `₹${Number(listing.price).toLocaleString("en-IN")}`
          : "";
        const descSnippet = listing.description
          ? listing.description.replace(/\s+/g, " ").trim().slice(0, 160)
          : "Buy and sell pre-owned campus essentials directly from verified university peers on SellOnCampus.";
        const description = priceFormatted
          ? `${priceFormatted} • ${descSnippet}`
          : descSnippet;

        const mainImage = listing.images?.[0]?.imageUrl || APP_LOGO_URL;
        const pageUrl = `${SITE_URL}/listings/${id}`;

        return {
          title,
          description,
          openGraph: {
            title,
            description,
            url: pageUrl,
            siteName: "SellOnCampus",
            type: "website",
            images: mainImage
              ? [
                  {
                    url: mainImage,
                    width: 1200,
                    height: 630,
                    alt: listing.title,
                  },
                ]
              : undefined,
          },
          twitter: {
            card: "summary_large_image",
            title,
            description,
            images: mainImage ? [mainImage] : undefined,
          },
          alternates: {
            canonical: pageUrl,
          },
        };
      }
    }
  } catch (error) {
    console.warn("Unable to fetch dynamic listing metadata for id:", id, error);
  }

  return {
    title: "Listing Details | SellOnCampus",
    description:
      "View item specifications, condition, campus handoff locations, and contact the student seller directly on SellOnCampus.",
  };
}

function DetailLoadingFallback() {
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

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <React.Suspense fallback={<DetailLoadingFallback />}>
      <ListingDetailContent id={id} />
    </React.Suspense>
  );
}
