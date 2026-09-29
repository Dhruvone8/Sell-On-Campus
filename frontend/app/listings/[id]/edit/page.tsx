import * as React from "react";
import type { Metadata } from "next";
import { EditListingContent } from "./edit-listing-content";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await params;
  return {
    title: "Edit Listing | SellOnCampus",
    description: "Update details, price, condition, and status for your campus listing.",
  };
}

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params;

  return <EditListingContent id={id} />;
}
