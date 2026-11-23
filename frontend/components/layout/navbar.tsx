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
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useInboxStore } from "@/lib/stores/inbox.store";
import { Avatar } from "@/components/ui/avatar";
import { NotificationPopover } from "@/components/notifications/notification-popover";
import { useSocket } from "@/lib/socket-context";
import { cn } from "@/lib/utils";
import { APP_LOGO_URL } from "@/lib/constants";
import { VisitorPill } from "@/components/layout/visitor-pill";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const unreadMessagesCount = useInboxStore((s) => s.unreadMessagesCount);
  const unreadNotificationsCount = useInboxStore((s) => s.unreadNotificationsCount);
  const setUnreadMessagesCount = useInboxStore((s) => s.setUnreadMessagesCount);
  const { subscribe } = useSocket();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Keep navbar Messages badge updated when receiving messages while outside /conversations
  React.useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = subscribe("message:new", () => {
      if (!pathname.startsWith("/conversations")) {
        setUnreadMessagesCount((prev) => prev + 1);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, subscribe, pathname, setUnreadMessagesCount]);

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
      <div className="w-full h-16 px-3 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between gap-3 lg:gap-4">
        {/* Left Section: Brand / Logo */}
        <div className="flex items-center shrink-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2 shrink-0 transition-opacity hover:opacity-95"
          >
            {APP_LOGO_URL && (
              <Image
                src={APP_LOGO_URL}
                alt="SellOnCampus Logo"
                width={36}
                height={36}
                priority
                unoptimized
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain shrink-0 mix-blend-multiply"
              />
            )}
            <span className="text-lg sm:text-xl font-bold tracking-tight text-charcoal-900 leading-none">
              Sell<span className="text-brand-500">On</span>Campus
            </span>
          </Link>
        </div>

        {/* Center Section: Notification Bell | Search Bar | Browse | Messages */}
        <div className="hidden md:flex items-center justify-center gap-2 lg:gap-3 xl:gap-4 flex-1 max-w-xl xl:max-w-2xl mx-2 lg:mx-4">
          {/* Notification CTA / Popover (To the left of Search Bar) */}
          <NotificationPopover />

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            aria-label="Campus marketplace search"
            className="relative flex-1 min-w-[200px] max-w-xs lg:max-w-sm xl:max-w-md flex items-center"
          >
            <Search className="absolute left-3.5 h-4 w-4 text-charcoal-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products, notes, calculators..."
              aria-label="Search listings"
              className="w-full h-9 pl-9 pr-9 py-1.5 rounded-xl bg-white/90 border border-charcoal-200 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:bg-white focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 transition-all duration-200"
            />
            <kbd
              className="absolute right-2.5 hidden xl:inline-flex items-center px-1.5 py-0.5 rounded border border-charcoal-200 bg-charcoal-50 text-[10px] font-mono text-charcoal-500 font-medium select-none"
              title="Press / to search"
            >
              /
            </kbd>
          </form>

          {/* Browse CTA */}
          <Link
            href="/listings"
            className={cn(
              "h-9 px-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center shrink-0 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none",
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
              "relative h-9 px-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 shrink-0 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none",
              pathname.startsWith("/conversations")
                ? "bg-charcoal-100 text-charcoal-900 font-bold"
                : "text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden xl:inline">Messages</span>
            {unreadMessagesCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-bold">
                {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
              </span>
            )}
          </Link>
        </div>

        {/* Right Section: Sell Item CTA | Visitor Counter | Auth CTAs / Profile */}
        <div className="flex items-center justify-end gap-2 sm:gap-2.5 shrink-0">
          {/* Mobile Notifications Shortcut */}
          {isAuthenticated && (
            <Link
              href="/notifications"
              aria-label="Notifications"
              className={cn(
                "md:hidden relative h-9 w-9 flex items-center justify-center rounded-xl text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100 transition-all duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none",
                pathname === "/notifications" && "bg-charcoal-100 text-charcoal-900"
              )}
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white shadow-xs">
                  {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                </span>
              )}
            </Link>
          )}

          {/* Sell Item CTA - Desktop & Tablet only */}
          <Link
            href="/listings/create"
            className="hidden sm:inline-flex h-9 items-center gap-1.5 px-3 sm:px-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-[0_3px_10px_0_rgba(249,90,30,0.25)] transition-all duration-200 shrink-0 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
          >
            <Plus className="h-4 w-4" />
            <span>Sell Item</span>
          </Link>

          {/* Unique Visitor Counter (Positioned immediately after Sell Item CTA) */}
          <VisitorPill />

          {/* Auth Actions / Profile Dropdown */}
          {isLoading ? (
            <div className="flex items-center p-1">
              <div className="h-8 w-8 rounded-full bg-charcoal-100 ring-1 ring-charcoal-200/80 animate-pulse" />
            </div>
          ) : isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="h-9 flex items-center gap-1.5 p-1 rounded-xl hover:bg-charcoal-100 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-label="User profile menu"
              >
                <Avatar
                  name={user?.name || user?.email || "Student"}
                  src={user?.profileImageUrl}
                  size="sm"
                />
                <ChevronDown className="h-3.5 w-3.5 text-charcoal-500 hidden sm:block" />
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

                  {user?.role === "ADMIN" && (
                    <Link
                      href="/admin/reports"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50/70 hover:bg-rose-100 hover:text-rose-900 transition-colors focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none mb-1 border border-rose-200/50"
                    >
                      <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                      <span>Moderation Queue</span>
                    </Link>
                  )}

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
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                href="/login"
                className="h-9 inline-flex items-center px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold text-charcoal-700 hover:bg-charcoal-100 hover:text-charcoal-900 transition-all duration-200 shrink-0 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="h-9 inline-flex items-center px-3 sm:px-3.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all duration-200 shrink-0 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
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
