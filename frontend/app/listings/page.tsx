import * as React from "react";
import type { Metadata } from "next";
import { ListingsPageContent } from "./listings-content";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_LOGO_URL } from "@/lib/constants";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://selloncampus.site").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Campus Marketplace — Buy & Sell College Gear | SellOnCampus",
  description:
    "Explore student listings for textbooks, electronics, dorm essentials, lab equipment, and campus cycles directly from verified university peers.",
  alternates: {
    canonical: `${siteUrl}/listings`,
  },
  openGraph: {
    title: "Campus Marketplace — Buy & Sell College Gear | SellOnCampus",
    description:
      "Explore student listings for textbooks, electronics, dorm essentials, lab equipment, and campus cycles directly from verified university peers.",
    url: `${siteUrl}/listings`,
    siteName: "SellOnCampus",
    type: "website",
    images: APP_LOGO_URL
      ? [
          {
            url: APP_LOGO_URL,
            width: 1200,
            height: 630,
            alt: "SellOnCampus Marketplace",
          },
        ]
      : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Marketplace — Buy & Sell College Gear | SellOnCampus",
    description:
      "Explore student listings for textbooks, electronics, dorm essentials, lab equipment, and campus cycles directly from verified university peers.",
    images: APP_LOGO_URL ? [APP_LOGO_URL] : undefined,
  },
};

function ListingsLoadingFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 animate-pulse">
      <Skeleton className="h-20 w-full rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="hidden lg:block lg:col-span-3">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
        <div className="lg:col-span-9 space-y-6">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/listings#webpage`,
        url: `${siteUrl}/listings`,
        name: "Campus Marketplace — Buy & Sell College Gear | SellOnCampus",
        description:
          "Explore student listings for textbooks, electronics, dorm essentials, lab equipment, and campus cycles directly from verified university peers.",
        isPartOf: {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          name: "SellOnCampus",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/listings#breadcrumb`,
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
            name: "Campus Marketplace",
            item: `${siteUrl}/listings`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <React.Suspense fallback={<ListingsLoadingFallback />}>
        <ListingsPageContent />
      </React.Suspense>
    </>
  );
}
