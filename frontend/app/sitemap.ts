import type { MetadataRoute } from "next";
import { API_URL } from "@/lib/constants";

interface ListingSummary {
  id: string;
  updatedAt?: string;
  createdAt?: string;
  status?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "https://selloncampus.site"
  ).replace(/\/+$/, "");

  // Canonical indexable static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/listings`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];

  // Fetch recent active listings from backend API
  let dynamicListingRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/api/listings?limit=100&sort=newest`, {
      next: { revalidate: 3600 },
      headers: {
        Accept: "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      const listings: ListingSummary[] = data?.listings || [];

      dynamicListingRoutes = listings
        .filter((item) => !item.status || item.status === "ACTIVE" || item.status === "RESERVED")
        .map((item) => ({
          url: `${siteUrl}/listings/${item.id}`,
          lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        }));
    }
  } catch {
    // Graceful fallback if backend is offline during build
    dynamicListingRoutes = [];
  }

  return [...staticRoutes, ...dynamicListingRoutes];
}
