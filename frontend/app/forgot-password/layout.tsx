import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Account Password | SellOnCampus",
  description:
    "Request a secure one-time passcode to verify your identity and recover access to your SellOnCampus student account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
