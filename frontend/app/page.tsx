import type { Metadata } from "next";
import {
  HeroSection,
  CategoryGrid,
  RecentListings,
  TrustPillars,
  CtaBanner,
} from "@/components/home";

export const metadata: Metadata = {
  title: "SellOnCampus | Student Marketplace For Your Campus",
  description:
    "Buy, sell, and trade textbooks, electronics, dorm essentials, and cycles directly with fellow students. Verified campus emails only.",
};

export default function HomePage() {
  return (
    <div className="w-full flex flex-col">
      <HeroSection />
      <CategoryGrid />
      <RecentListings />
      <TrustPillars />
      <CtaBanner />
    </div>
  );
}