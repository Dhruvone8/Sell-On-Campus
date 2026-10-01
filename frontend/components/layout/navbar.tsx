"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  MessageSquare,
  Bell,
  Plus,
  User,
  LogOut,
  ChevronDown,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/avatar";
import { NotificationPopover } from "@/components/notifications/notification-popover";
import { cn } from "@/lib/utils";
import { APP_LOGO_URL } from "@/lib/constants";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, unreadMessagesCount, unreadNotificationsCount, logout } = useAuth();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut: Cmd+K, Ctrl+K, or "/" to focus search; Esc to close dropdown
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      } else if (
        event.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
      } else if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchTerm.trim()) {
      router.push("/listings");
    } else {
      router.push(`/listings?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header">
      <div className="w-full h-16 px-3 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between">
        {/* Left Anchor: Brand / Logo */}
        <div className="flex-1 flex items-center justify-start shrink-0 min-w-0">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2.5 shrink-0"
          >
            {APP_LOGO_URL && (
              <Image
                src={APP_LOGO_URL}
                alt="SellOnCampus Logo"
                width={38}
                height={38}
                priority
                unoptimized
                className="h-8 w-8 sm:h-9.5 sm:w-9.5 object-contain shrink-0 mix-blend-multiply"
              />
            )}
            <span className="text-base min-[360px]:text-lg sm:text-xl font-bold tracking-tight text-charcoal-900 leading-none">
              Sell<span className="text-brand-500">On</span>Campus
            </span>
          </Link>
        </div>

        {/* Center: [ SEARCH | BROWSE | MESSAGES | NOTIFICATION | SELL ITEM ] */}
        <div className="hidden md:flex items-center justify-center gap-3.5 md:gap-4 lg:gap-7 xl:gap-9 2xl:gap-11 shrink-0">
          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            aria-label="Campus marketplace search"
            className="relative w-52 md:w-56 lg:w-68 xl:w-80 flex items-center"
          >
            <Search className="absolute left-3.5 h-4 w-4 text-charcoal-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search textbooks, laptops, dorm gear..."
              aria-label="Search listings"
              className="w-full pl-10 pr-12 xl:pr-14 py-2 rounded-xl bg-white/90 border border-charcoal-200 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:bg-white focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 transition-all duration-200 ease-out"
            />
            <kbd className="absolute right-3 hidden xl:inline-flex items-center px-1.5 py-0.5 rounded border border-charcoal-200 bg-charcoal-50 text-[10px] font-mono text-charcoal-500 font-medium" title="Press ⌘K or / to search">
              /
            </kbd>
          </form>

          {/* Browse CTA */}
          <Link
            href="/listings"
            className={cn(
              "px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ease-out hover:scale-[1.03] active:scale-[0.98] shrink-0 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none focus-visible:ring-offset-2",
              pathname === "/listings"
                ? "bg-charcoal-100 text-charcoal-900 font-bold"
                : "text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50"
            )}
          >
            Browse
          </Link>

          {/* Messages CTA */}
          <Link
            href="/conversations"
            className={cn(
              "relative px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ease-out hover:scale-[1.03] active:scale-[0.98] flex items-center gap-1.5 shrink-0 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none focus-visible:ring-offset-2",
              pathname.startsWith("/conversations")
                ? "bg-charcoal-100 text-charcoal-900 font-bold"
                : "text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Messages</span>
            {unreadMessagesCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-bold">
                {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
              </span>
            )}
          </Link>

          {/* Notification CTA / Popover */}
          <NotificationPopover />

          {/* Sell Item CTA */}
          <Link
            href="/listings/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-sm font-bold shadow-xs hover:shadow-[0_4px_14px_0_rgba(249,90,30,0.25)] transition-all duration-200 ease-out hover:scale-[1.04] active:scale-[0.98] shrink-0 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            <span>Sell Item</span>
          </Link>
        </div>

        {/* Right Anchor: Authentication CTAs / Profile */}
        <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3 shrink-0">
          {/* Mobile Notifications Shortcut */}
          {isAuthenticated && (
            <Link
              href="/notifications"
              aria-label="Notifications"
              className={cn(
                "md:hidden relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100 transition-all duration-200 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none",
                pathname === "/notifications" && "bg-charcoal-100 text-charcoal-900"
              )}
            >
              <Bell className="h-5 w-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white shadow-xs">
                  {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                </span>
              )}
            </Link>
          )}

          {isLoading ? (
            <div className="flex items-center gap-2 p-1.5">
              <div className="h-7 w-7 rounded-full bg-charcoal-100 ring-1 ring-charcoal-200/80 animate-pulse" />
            </div>
          ) : isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-charcoal-100 transition-all duration-200 ease-out hover:scale-[1.04] active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-label="User profile menu"
              >
                <Avatar
                  name={user?.name || user?.email || "Student"}
                  src={user?.profileImageUrl}
                  size="sm"
                />
                <ChevronDown className="h-4 w-4 text-charcoal-500 hidden sm:block" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white/95 backdrop-blur-xl border border-charcoal-200/80 p-2 shadow-lg z-50 animate-in fade-in-50 zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-charcoal-100 mb-1">
                    <p className="text-xs font-bold text-charcoal-900 font-jakarta truncate">
                      {user?.name || "Signed In"}
                    </p>
                    <p className="text-[11px] text-charcoal-500 truncate">
                      {user?.email || "Verified Student"}
                    </p>
                  </div>

                  <Link
                    href="/my-listings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-charcoal-700 hover:bg-charcoal-100 hover:text-charcoal-900 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
                  >
                    <ShoppingBag className="h-4 w-4 text-charcoal-500" />
                    <span>My Listings</span>
                  </Link>

                  <Link
                    href="/conversations"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-charcoal-700 hover:bg-charcoal-100 hover:text-charcoal-900 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="h-4 w-4 text-charcoal-500" />
                      <span>Messages</span>
                    </div>
                    {unreadMessagesCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-bold">
                        {unreadMessagesCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-charcoal-700 hover:bg-charcoal-100 hover:text-charcoal-900 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
                  >
                    <User className="h-4 w-4 text-charcoal-500" />
                    <span>Account Profile</span>
                  </Link>

                  <div className="my-1 border-t border-charcoal-100" />

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                  >
                    <LogOut className="h-4 w-4 text-red-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 min-[360px]:gap-2 shrink-0 animate-in fade-in-50 duration-200">
              <Link
                href="/login"
                className="px-2 min-[360px]:px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] min-[360px]:text-xs sm:text-sm font-semibold text-charcoal-700 hover:bg-charcoal-100 hover:text-charcoal-900 transition-all duration-200 ease-out hover:scale-[1.03] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none shrink-0"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-2.5 min-[360px]:px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-[11px] min-[360px]:text-xs sm:text-sm font-semibold shadow-xs transition-all duration-200 ease-out hover:scale-[1.04] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none shrink-0"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
