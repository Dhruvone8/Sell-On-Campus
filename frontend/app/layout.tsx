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

export const metadata: Metadata = {
  title: "SellOnCampus — Campus Marketplace",
  description: "Direct student-to-student campus marketplace. Buy and sell textbooks, electronics, cycles, and dorm essentials with verified students.",
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
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-charcoal-900 font-sans selection:bg-brand-100 selection:text-brand-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
