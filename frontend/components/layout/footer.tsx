import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { APP_LOGO_URL } from "@/lib/constants";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-charcoal-200/80 py-8 mt-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-charcoal-600">
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

          {/* Navigation Links & External Resources */}
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-5 text-xs font-medium text-charcoal-600">
            <Link
              href="/listings"
              className="hover:text-brand-500 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none rounded-lg px-1 py-0.5"
            >
              Explore Marketplace
            </Link>
            <Link
              href="/listings/create"
              className="hover:text-brand-500 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none rounded-lg px-1 py-0.5"
            >
              Post a Listing
            </Link>
            <Link
              href="/conversations"
              className="hover:text-brand-500 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none rounded-lg px-1 py-0.5"
            >
              Campus Inbox
            </Link>
            <Link
              href="/profile"
              className="hover:text-brand-500 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none rounded-lg px-1 py-0.5"
            >
              My Account
            </Link>
            <a
              href="https://github.com/Dhruvone8/Sell-On-Campus"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-brand-500 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none rounded-lg px-1 py-0.5 text-charcoal-700 font-semibold"
              title="SellOnCampus Open Source Project on GitHub"
            >
              <GitHubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
              <ExternalLink className="w-2.5 h-2.5 text-charcoal-400" />
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
