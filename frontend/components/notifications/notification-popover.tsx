"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CheckCheck, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useInboxStore } from "@/lib/stores/inbox.store";
import { useSocket } from "@/lib/socket-context";
import { NotificationItem, NotificationData } from "./notification-item";
import { API_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function NotificationPopover() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const unreadNotificationsCount = useInboxStore((s) => s.unreadNotificationsCount);
  const setUnreadNotificationsCount = useInboxStore((s) => s.setUnreadNotificationsCount);
  const { subscribe } = useSocket();

  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isMarkingAll, setIsMarkingAll] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Fetch recent notifications when popover is opened
  const fetchRecentNotifications = React.useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/notifications?limit=8`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          const unread = data.notifications.filter((n: NotificationData) => !n.isRead).length;
          setUnreadNotificationsCount(unread);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, setUnreadNotificationsCount]);

  // Subscribe to live WebSocket notifications
  React.useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = subscribe("notification:new", (data: unknown) => {
      const newNotif = data as NotificationData;
      if (newNotif && newNotif.id) {
        setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
        setUnreadNotificationsCount((prev) => prev + 1);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, subscribe, setUnreadNotificationsCount]);

  // Toggle popover
  const handleToggle = () => {
    if (!isOpen) {
      setIsOpen(true);
      fetchRecentNotifications();
    } else {
      setIsOpen(false);
    }
  };

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Close popover on route change
  const prevPathnameRef = React.useRef(pathname);
  React.useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      timer = setTimeout(() => setIsOpen(false), 0);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [pathname]);

  // Mark single notification as read
  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));

    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    if (isMarkingAll) return;
    setIsMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadNotificationsCount(0);

    try {
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PATCH",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="relative shrink-0" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className={cn(
          "relative p-2 rounded-xl text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100 transition-all duration-200 ease-out hover:scale-[1.05] active:scale-[0.95] cursor-pointer",
          isOpen && "bg-charcoal-100 text-charcoal-900",
          pathname === "/notifications" && "bg-charcoal-100 text-charcoal-900"
        )}
      >
        <Bell className="h-5 w-5" />

        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white shadow-xs animate-in zoom-in-50 duration-200">
            {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
          </span>
        )}
      </button>

      {/* Floating Popover Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-xl border border-charcoal-200/80 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Popover Header */}
          <div className="px-4 py-3 border-b border-charcoal-100 flex items-center justify-between bg-charcoal-50/50">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-charcoal-900 font-jakarta">Notifications</h3>
              {unreadNotificationsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-700">
                  {unreadNotificationsCount} new
                </span>
              )}
            </div>

            {unreadNotificationsCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isMarkingAll}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications Scroll List */}
          <div className="max-h-[360px] overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
            {isLoading ? (
              <div className="py-10 flex flex-col items-center justify-center text-charcoal-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                <span className="text-xs font-medium">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-charcoal-100 mx-auto flex items-center justify-center text-charcoal-400 mb-2">
                  <Bell className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-charcoal-800">You&apos;re all caught up!</h4>
                <p className="text-[11px] text-charcoal-500 mt-0.5">
                  No new notifications right now.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  compact
                  onMarkRead={handleMarkRead}
                  onNavigate={() => setIsOpen(false)}
                />
              ))
            )}
          </div>

          {/* Popover Footer */}
          <div className="p-2 border-t border-charcoal-100 bg-charcoal-50/50">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold text-charcoal-700 hover:text-brand-600 hover:bg-white transition-all text-center"
            >
              <span>View all notifications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
