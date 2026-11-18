import type { MetadataRoute } from "next";
import { APP_FAVICON_URL, getFaviconUrl } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SellOnCampus — University Student Marketplace",
    short_name: "SellOnCampus",
    description:
      "Direct student-to-student campus marketplace. Buy and sell textbooks, electronics, cycles, and dorm essentials with verified students.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf8f5",
    theme_color: "#f95a1e",
    icons: [
      {
        src: getFaviconUrl(APP_FAVICON_URL, 192),
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: getFaviconUrl(APP_FAVICON_URL, 512),
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
