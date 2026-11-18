import * as React from "react";
import type { Metadata } from "next";
import { ListingDetailContent } from "./listing-detail-content";
import { Skeleton } from "@/components/ui/skeleton";
import { Listing } from "@/lib/types";
import { API_URL, APP_LOGO_URL } from "@/lib/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  "https://selloncampus.site"
).replace(/\/+$/, "");

async function getListing(id: string): Promise<Listing | null> {
  try {
    const res = await fetch(`${API_URL}/api/listings/${id}`, {
      next: { revalidate: 60 },
      headers: {
        Accept: "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      return data.listing || null;
    }
  } catch (error) {
    console.warn("Unable to fetch dynamic listing for id:", id, error);
  }
  return null;
}

const CONDITION_SCHEMA_MAP: Record<string, string> = {
  NEW: "https://schema.org/NewCondition",
  LIKE_NEW: "https://schema.org/UsedCondition",
  GOOD: "https://schema.org/UsedCondition",
  FAIR: "https://schema.org/UsedCondition",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);

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
    const pageUrl = `${siteUrl}/listings/${id}`;

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

  return {
    title: "Listing Details | SellOnCampus",
    description:
      "View item specifications, condition, campus handoff locations, and contact the student seller directly on SellOnCampus.",
    alternates: {
      canonical: `${siteUrl}/listings/${id}`,
    },
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
  const listing = await getListing(id);

  const pageUrl = `${siteUrl}/listings/${id}`;
  const images = listing?.images?.map((img) => img.imageUrl) || [];
  if (images.length === 0 && APP_LOGO_URL) {
    images.push(APP_LOGO_URL);
  }

  const categoryName = listing?.category?.name || "Campus Gear";

  // Structured Data (Product + BreadcrumbList)
  const structuredData = listing
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Product",
            "@id": `${pageUrl}#product`,
            name: listing.title,
            description: listing.description,
            image: images,
            category: categoryName,
            ...(listing.brand ? { brand: { "@type": "Brand", name: listing.brand } } : {}),
            ...(listing.model ? { model: listing.model } : {}),
            offers: {
              "@type": "Offer",
              url: pageUrl,
              price: Number(listing.price || 0),
              priceCurrency: "INR",
              priceValidUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              itemCondition:
                (listing.condition && CONDITION_SCHEMA_MAP[listing.condition]) ||
                "https://schema.org/UsedCondition",
              availability:
                listing.status === "SOLD"
                  ? "https://schema.org/OutOfStock"
                  : "https://schema.org/InStock",
              seller: {
                "@type": "Person",
                name: listing.seller?.name || "Verified Student Seller",
              },
            },
          },
          {
            "@type": "BreadcrumbList",
            "@id": `${pageUrl}#breadcrumb`,
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: siteUrl,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Marketplace",
                item: `${siteUrl}/listings`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: categoryName,
                item: `${siteUrl}/listings?category=${encodeURIComponent(categoryName)}`,
              },
              {
                "@type": "ListItem",
                position: 4,
                name: listing.title,
                item: pageUrl,
              },
            ],
          },
        ],
      }
    : null;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <React.Suspense fallback={<DetailLoadingFallback />}>
        <ListingDetailContent id={id} initialListing={listing} />
      </React.Suspense>
    </>
  );
}
