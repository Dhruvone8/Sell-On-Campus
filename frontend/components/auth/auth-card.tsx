import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { APP_LOGO_URL } from "@/lib/constants";

export interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          {APP_LOGO_URL && (
            <Image
              src={APP_LOGO_URL}
              alt="SellOnCampus Logo"
              width={48}
              height={48}
              priority
              unoptimized
              className="h-12 w-12 object-contain shrink-0 mix-blend-multiply transition-transform group-hover:scale-105"
            />
          )}
        </Link>
        <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-charcoal-900">
          {title}
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-charcoal-500 leading-normal max-w-sm mx-auto">
          {subtitle}
        </p>
      </div>

      {/* Crisp Form Container */}
      <div
        className={cn(
          "rounded-2xl border border-charcoal-200/80 bg-white p-5 min-[360px]:p-6 sm:p-8 shadow-xs transition-all",
          className
        )}
      >
        {children}
        {footer && <div className="mt-6 pt-5 border-t border-charcoal-100">{footer}</div>}
      </div>

      {/* Campus Trust Note */}
      <p className="mt-6 text-center text-xs text-charcoal-400">
        Verified campus marketplace. By continuing, you agree to our Community Guidelines.
      </p>
    </div>
  );
}
