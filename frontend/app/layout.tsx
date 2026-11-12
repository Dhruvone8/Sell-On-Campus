import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import ReactDOM from "react-dom";
import "./globals.css";
import { AppShell } from "@/components/layout";
import { APP_LOGO_URL, APP_FAVICON_URL, getFaviconUrl } from "@/lib/constants";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://selloncampus.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: {
    default: "SellOnCampus — Campus Marketplace",
    template: "%s | SellOnCampus",
  },
  description:
    "Direct student-to-student campus marketplace. Buy and sell textbooks, electronics, cycles, and dorm essentials with verified students.",
  keywords: [
    "campus marketplace",
    "sell textbooks",
    "student marketplace",
    "buy college books",
    "used dorm essentials",
    "student to student campus sales",
    "campus cycles",
    "university gear exchange",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SellOnCampus — Campus Marketplace",
    description:
      "Direct student-to-student campus marketplace. Buy and sell textbooks, electronics, cycles, and dorm essentials with verified students.",
    url: siteBaseUrl,
    siteName: "SellOnCampus",
    locale: "en_US",
    type: "website",
    images: APP_LOGO_URL
      ? [
          {
            url: APP_LOGO_URL,
            width: 1200,
            height: 630,
            alt: "SellOnCampus Logo",
          },
        ]
      : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: "SellOnCampus — Campus Marketplace",
    description:
      "Direct student-to-student campus marketplace. Buy and sell textbooks, electronics, cycles, and dorm essentials with verified students.",
    images: APP_LOGO_URL ? [APP_LOGO_URL] : undefined,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: getFaviconUrl(APP_FAVICON_URL, 32),
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: getFaviconUrl(APP_FAVICON_URL, 64),
        sizes: "64x64",
        type: "image/png",
      },
      {
        url: APP_FAVICON_URL,
        type: "image/png",
      },
    ],
    shortcut: APP_FAVICON_URL,
    apple: [
      {
        url: getFaviconUrl(APP_FAVICON_URL, 180),
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  ReactDOM.preconnect("https://res.cloudinary.com");
  if (APP_LOGO_URL) {
    ReactDOM.preload(APP_LOGO_URL, { as: "image" });
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-charcoal-900 font-sans selection:bg-brand-100 selection:text-brand-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
