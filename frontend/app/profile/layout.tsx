import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Profile | SellOnCampus",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
