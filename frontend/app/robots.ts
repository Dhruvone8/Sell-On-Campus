import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://selloncampus.site").replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/profile",
          "/profile/*",
          "/conversations",
          "/conversations/*",
          "/my-listings",
          "/my-listings/*",
          "/notifications",
          "/notifications/*",
          "/listings/*/edit",
          "/listings/create",
          "/reset-password",
          "/api/*",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

