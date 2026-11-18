import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://selloncampus.site").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Student Sign In | SellOnCampus",
  description:
    "Sign in to your verified student account on SellOnCampus to message campus sellers, manage active listings, and trade university gear safely.",
  alternates: {
    canonical: `${siteUrl}/login`,
  },
  openGraph: {
    title: "Student Sign In | SellOnCampus",
    description:
      "Sign in to your verified student account on SellOnCampus to message campus sellers, manage active listings, and trade university gear safely.",
    url: `${siteUrl}/login`,
    siteName: "SellOnCampus",
    type: "website",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
