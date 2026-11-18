import type { MetadataRoute } from "next";
import { API_URL } from "@/lib/constants";

interface ListingSummary {
  id: string;
  updatedAt?: string;
  createdAt?: string;
  status?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://selloncampus.site").replace(/\/+$/, "");

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
    {
      url: `${siteUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Key campus category index routes
  const categoryRoutes: MetadataRoute.Sitemap = [
    "Books",
    "Electronics",
    "Hostel",
    "Cycles",
    "Furniture",
    "Stationery",
  ].map((cat) => ({
    url: `${siteUrl}/listings?category=${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.85,
  }));

  // Fetch recent active listings from backend API
  let dynamicListingRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/api/listings?limit=50&sort=newest`, {
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

  return [...staticRoutes, ...categoryRoutes, ...dynamicListingRoutes];
}

