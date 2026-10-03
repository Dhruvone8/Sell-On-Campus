"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Plus, MessageSquare, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useInboxStore } from "@/lib/stores/inbox.store";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const unreadMessagesCount = useInboxStore((s) => s.unreadMessagesCount);

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Browse",
      href: "/listings",
      icon: ShoppingBag,
      isActive: pathname === "/listings",
    },
    {
      label: "Sell",
      href: "/listings/create",
      icon: Plus,
      isSpecial: true,
      isActive: pathname === "/listings/create",
    },
    {
      label: "Messages",
      href: "/conversations",
      icon: MessageSquare,
      badge: unreadMessagesCount,
      isActive: pathname.startsWith("/conversations"),
    },
    {
      label: "Account",
      href: isAuthenticated ? "/profile" : "/login",
      icon: User,
      isActive: pathname === "/profile" || pathname === "/login",
    },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-charcoal-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 pt-1 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isSpecial) {
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-label="Sell an item"
                className="flex flex-col items-center justify-center -mt-5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-2xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-md shadow-brand-500/30 transition-transform group-active:scale-95 group-hover:bg-brand-400">
                  <Icon className="h-6 w-6 stroke-[2.5]" />
                </div>
                <span className="mt-1 text-[10px] font-bold text-charcoal-700 font-jakarta">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "relative flex flex-col items-center justify-center min-h-[48px] min-w-[48px] py-1 px-3 rounded-xl transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                item.isActive
                  ? "text-brand-500 font-bold"
                  : "text-charcoal-500 hover:text-charcoal-900"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5", item.isActive && "stroke-[2.5]")} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white shadow-xs">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className="mt-1 text-[10px] font-medium leading-none font-jakarta">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
