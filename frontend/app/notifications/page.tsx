"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCheck, ChevronRight, Inbox, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useInboxStore } from "@/lib/stores/inbox.store";
import { useNotificationsStore } from "@/lib/stores/notifications.store";
import { useSocket } from "@/lib/socket-context";
import { NotificationItem, NotificationData } from "@/components/notifications/notification-item";
import { API_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "unread";

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const setUnreadNotificationsCount = useInboxStore((s) => s.setUnreadNotificationsCount);
  const { subscribe } = useSocket();

  // ── Store selectors ──────────────────────────────────────────────────────
  const notifications  = useNotificationsStore((s) => s.notifications);
  const isLoading      = useNotificationsStore((s) => s.isLoading);
  const isMarkingAll   = useNotificationsStore((s) => s.isMarkingAll);
  const nextCursor     = useNotificationsStore((s) => s.nextCursor);
  const hasMore        = useNotificationsStore((s) => s.hasMore);
  const isLoadingMore  = useNotificationsStore((s) => s.isLoadingMore);

  // ── Store actions ────────────────────────────────────────────────────────
  const setNotifications    = useNotificationsStore((s) => s.setNotifications);
  const appendNotifications = useNotificationsStore((s) => s.appendNotifications);
  const prependNotification = useNotificationsStore((s) => s.prependNotification);
  const markOneRead         = useNotificationsStore((s) => s.markOneRead);
  const markAllRead         = useNotificationsStore((s) => s.markAllRead);
  const setIsLoading        = useNotificationsStore((s) => s.setIsLoading);
  const setIsMarkingAll     = useNotificationsStore((s) => s.setIsMarkingAll);
  const setNextCursor       = useNotificationsStore((s) => s.setNextCursor);
  const setHasMore          = useNotificationsStore((s) => s.setHasMore);
  const setIsLoadingMore    = useNotificationsStore((s) => s.setIsLoadingMore);

  // ── Local UI state (tab selection — page-only, no cross-component need) ──
  const [activeTab, setActiveTab] = React.useState<FilterTab>("all");

  // Fetch initial notifications
  const fetchNotifications = React.useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    // Capture session generation BEFORE first await — guards against stale
    // responses repopulating the store after logout or account switch.
    const gen = useAuthStore.getState().sessionGeneration;

    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/notifications?limit=25`, {
        method: "GET",
        credentials: "include",
      });

      // ── Session guard ─────────────────────────────────────────────────
      if (useAuthStore.getState().sessionGeneration !== gen) return;

      if (res.ok) {
        const data = await res.json();

        // ── Session guard ───────────────────────────────────────────────
        if (useAuthStore.getState().sessionGeneration !== gen) return;

        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          const unread = data.notifications.filter((n: NotificationData) => !n.isRead).length;
          setUnreadNotificationsCount(unread);
        }
        if (data.pagination) {
          setNextCursor(data.pagination.nextCursor || null);
          setHasMore(Boolean(data.pagination.hasMore));
        }
      }
    } catch (err) {
      if (useAuthStore.getState().sessionGeneration !== gen) return;
      console.error("Failed to load notifications:", err);
    } finally {
      if (useAuthStore.getState().sessionGeneration === gen) {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, setUnreadNotificationsCount, setNotifications, setIsLoading, setNextCursor, setHasMore]);

  React.useEffect(() => {
    let isMounted = true;
    async function init() {
      await Promise.resolve();
      if (!isMounted) return;
      await fetchNotifications();
    }
    init();

    return () => {
      isMounted = false;
    };
  }, [fetchNotifications]);

  // Real-time live notifications via WebSocket
  React.useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = subscribe("notification:new", (data: unknown) => {
      const newNotif = data as NotificationData;
      if (newNotif && newNotif.id) {
        prependNotification(newNotif);
        setUnreadNotificationsCount((prev) => prev + 1);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, subscribe, setUnreadNotificationsCount, prependNotification]);

  // Load more notifications using cursor
  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;

    // Capture generation before the await — same stale-write guard as fetchNotifications.
    const gen = useAuthStore.getState().sessionGeneration;
    setIsLoadingMore(true);

    try {
      const res = await fetch(
        `${API_URL}/api/notifications?limit=25&cursor=${encodeURIComponent(nextCursor)}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      // ── Session guard ───────────────────────────────────────────────────
      if (useAuthStore.getState().sessionGeneration !== gen) return;

      if (res.ok) {
        const data = await res.json();

        // ── Session guard ─────────────────────────────────────────────────
        if (useAuthStore.getState().sessionGeneration !== gen) return;

        if (Array.isArray(data.notifications)) {
          appendNotifications(data.notifications);
        }
        if (data.pagination) {
          setNextCursor(data.pagination.nextCursor || null);
          setHasMore(Boolean(data.pagination.hasMore));
        }
      }
    } catch (err) {
      if (useAuthStore.getState().sessionGeneration !== gen) return;
      console.error("Failed to load more notifications:", err);
    } finally {
      if (useAuthStore.getState().sessionGeneration === gen) {
        setIsLoadingMore(false);
      }
    }
  };

  // Mark single notification as read
  const handleMarkRead = async (id: string) => {
    markOneRead(id);
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
    markAllRead();
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

  // Filtered notification list
  const filteredNotifications = React.useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, activeTab]);

  const unreadTotal = React.useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-charcoal-400 font-medium mb-6">
        <Link href="/" className="hover:text-charcoal-700 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-charcoal-800 font-semibold">Notifications</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-200/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 tracking-tight font-jakarta">
              Notifications
            </h1>
            {unreadTotal > 0 && (
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500 text-white shadow-xs">
                {unreadTotal} new
              </span>
            )}
          </div>
          <p className="text-sm text-charcoal-500 mt-1">
            Stay updated on buyer inquiries, messages, and campus listing activity.
          </p>
        </div>

        {unreadTotal > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl bg-charcoal-100 hover:bg-charcoal-200 text-charcoal-800 text-xs font-bold transition-all duration-150 cursor-pointer active:scale-95 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
          >
            <CheckCheck className="w-4 h-4 text-brand-600" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mt-6 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={cn(
            "px-4 py-2.5 min-h-[40px] rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none",
            activeTab === "all"
              ? "bg-charcoal-900 text-white shadow-xs"
              : "bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200 hover:text-charcoal-900"
          )}
        >
          All ({notifications.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("unread")}
          className={cn(
            "px-4 py-2.5 min-h-[40px] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none",
            activeTab === "unread"
              ? "bg-charcoal-900 text-white shadow-xs"
              : "bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200 hover:text-charcoal-900"
          )}
        >
          <span>Unread</span>
          {unreadTotal > 0 && (
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                activeTab === "unread"
                  ? "bg-brand-500 text-white"
                  : "bg-brand-100 text-brand-700"
              )}
            >
              {unreadTotal}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List Body */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-charcoal-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          <p className="text-sm font-medium">Loading your notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="py-16 px-4 bg-white rounded-3xl border border-charcoal-200/80 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-charcoal-100 mx-auto flex items-center justify-center text-charcoal-400 mb-4">
            {activeTab === "unread" ? (
              <Inbox className="w-8 h-8" />
            ) : (
              <Bell className="w-8 h-8" />
            )}
          </div>
          <h3 className="text-base font-bold text-charcoal-900 font-jakarta">
            {activeTab === "unread"
              ? "No unread notifications"
              : "No notifications yet"}
          </h3>
          <p className="text-xs sm:text-sm text-charcoal-500 max-w-sm mx-auto mt-1">
            {activeTab === "unread"
              ? "You're all caught up! When someone messages you about an item, you'll see it here."
              : "When someone inquires about an item you listed or sends a message, notifications will appear here."}
          </p>

          <div className="mt-6">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold shadow-xs transition-transform active:scale-95"
            >
              Browse Campus Marketplace
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="pt-6 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-charcoal-200 text-charcoal-800 text-xs font-bold hover:bg-charcoal-50 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                {isLoadingMore && <Loader2 className="w-4 h-4 animate-spin text-brand-500" />}
                <span>{isLoadingMore ? "Loading more..." : "Load earlier notifications"}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
