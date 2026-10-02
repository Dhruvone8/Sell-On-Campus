import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { APP_LOGO_URL } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-charcoal-200/80 py-8 mt-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-charcoal-600">
          {/* Brand & Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2.5 text-center sm:text-left">
            <div className="flex items-center gap-2">
              {APP_LOGO_URL && (
                <Image
                  src={APP_LOGO_URL}
                  alt="SellOnCampus Logo"
                  width={28}
                  height={28}
                  unoptimized
                  className="h-7 w-7 object-contain shrink-0 mix-blend-multiply"
                />
              )}
              <span className="font-bold text-charcoal-900 tracking-tight leading-none">
                Sell<span className="text-brand-500">On</span>Campus
              </span>
            </div>
            <span className="text-xs text-charcoal-400">
              © {new Date().getFullYear()} SellOnCampus. Built for university life.
            </span>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-6 text-xs font-medium text-charcoal-600">
            <Link
              href="/listings"
              className="hover:text-brand-500 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none rounded-lg px-1 py-0.5"
            >
              Browse Marketplace
            </Link>
            <Link
              href="/listings/create"
              className="hover:text-brand-500 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none rounded-lg px-1 py-0.5"
            >
              Sell an Item
            </Link>
            <Link
              href="/conversations"
              className="hover:text-brand-500 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none rounded-lg px-1 py-0.5"
            >
              Messages
            </Link>
            <Link
              href="/my-listings"
              className="hover:text-brand-500 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none rounded-lg px-1 py-0.5"
            >
              Account
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
