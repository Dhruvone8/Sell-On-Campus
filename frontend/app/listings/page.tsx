import * as React from "react";
import type { Metadata } from "next";
import { ListingsPageContent } from "./listings-content";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Campus Marketplace | SellOnCampus",
  description:
    "Explore student listings for textbooks, electronics, dorm furniture, and bikes directly across your campus.",
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
  return (
    <React.Suspense fallback={<ListingsLoadingFallback />}>
      <ListingsPageContent />
    </React.Suspense>
  );
}
