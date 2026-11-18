import * as React from "react";
import type { Metadata } from "next";
import { CreatePageContent } from "./create-page-content";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://selloncampus.site").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Post a Listing | SellOnCampus",
  description:
    "Sell your textbooks, electronics, dorm essentials, and cycles directly to campus students. 0% platform fee.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/listings/create`,
  },
};

export default function CreateListingPage() {
  return (
    <React.Suspense fallback={null}>
      <CreatePageContent />
    </React.Suspense>
  );
}
