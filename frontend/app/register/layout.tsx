import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://selloncampus.site").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Student Registration — Join SellOnCampus | University Marketplace",
  description:
    "Create your student account with your verified campus email. Buy and sell textbooks, electronics, cycles, and dorm essentials with zero platform fees.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${siteUrl}/register`,
  },
  openGraph: {
    title: "Student Registration — Join SellOnCampus | University Marketplace",
    description:
      "Create your student account with your verified campus email. Buy and sell textbooks, electronics, cycles, and dorm essentials with zero platform fees.",
    url: `${siteUrl}/register`,
    siteName: "SellOnCampus",
    type: "website",
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
