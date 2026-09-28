import * as React from "react";
import type { Metadata } from "next";
import { CreatePageContent } from "./create-page-content";

export const metadata: Metadata = {
  title: "Post a Listing | SellOnCampus",
  description:
    "Sell your textbooks, electronics, dorm essentials, and cycles directly to campus students. 0% platform fee.",
};

export default function CreateListingPage() {
  return (
    <React.Suspense fallback={null}>
      <CreatePageContent />
    </React.Suspense>
  );
}
