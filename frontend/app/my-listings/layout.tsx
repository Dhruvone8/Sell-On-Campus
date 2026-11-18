import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Listings | SellOnCampus",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MyListingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
