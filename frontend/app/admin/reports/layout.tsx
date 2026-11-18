import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Moderation | SellOnCampus",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminReportsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
