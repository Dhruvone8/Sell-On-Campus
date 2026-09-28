import * as React from "react";
import type { Metadata } from "next";
import { ListingDetailContent } from "./listing-detail-content";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await params;
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
