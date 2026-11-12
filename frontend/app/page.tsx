import type { Metadata } from "next";
import {
  LoadingScreen,
  HeroSection,
  CategoryGrid,
  RecentListings,
  HowItWorks,
  TrustPillars,
  FaqSection,
  SocialShareBanner,
  CtaBanner,
} from "@/components/home";
import { CAMPUS_FAQS } from "@/components/home/faq-data";
import { APP_LOGO_URL } from "@/lib/constants";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://selloncampus.site").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "SellOnCampus | Student Marketplace For Your Campus",
  description:
    "Buy, sell, and trade textbooks, electronics, dorm essentials, and cycles directly with fellow students. Verified campus emails only.",
  alternates: {
    canonical: siteUrl,
  },
};

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "SellOnCampus",
        description:
          "Peer-to-peer campus marketplace for university students. Buy, sell, and trade textbooks, dorm gear, and cycles safely.",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/listings?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "SellOnCampus",
        url: siteUrl,
        logo: APP_LOGO_URL || `${siteUrl}/logo.png`,
        sameAs: ["https://github.com/Dhruvone8/Sell-On-Campus"],
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        mainEntity: CAMPUS_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="w-full flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LoadingScreen />
      <HeroSection />
      <CategoryGrid />
      <RecentListings />
      <HowItWorks />
      <TrustPillars />
      <FaqSection />
      <SocialShareBanner />
      <CtaBanner />
    </div>
  );
}
