import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { NotificationData } from "@/components/notifications/notification-item";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface NotificationsState {
  notifications: NotificationData[];
  isLoading: boolean;
  isMarkingAll: boolean;
  nextCursor: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
}

// ---------------------------------------------------------------------------
// Actions shape
// ---------------------------------------------------------------------------

interface NotificationsActions {
  setNotifications: (notifications: NotificationData[]) => void;
  /** Append a page of notifications (load-more) */
  appendNotifications: (notifications: NotificationData[]) => void;
  /** Prepend a single new notification arriving via WebSocket */
  prependNotification: (notification: NotificationData) => void;
  /** Mark a single notification as read by id */
  markOneRead: (id: string) => void;
  /** Mark all notifications as read */
  markAllRead: () => void;

  setIsLoading: (value: boolean) => void;
  setIsMarkingAll: (value: boolean) => void;
  setNextCursor: (cursor: string | null) => void;
  setHasMore: (value: boolean) => void;
  setIsLoadingMore: (value: boolean) => void;

  /** Full store reset on logout */
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const initialState: NotificationsState = {
  notifications: [],
  isLoading: true,
  isMarkingAll: false,
  nextCursor: null,
  hasMore: false,
  isLoadingMore: false,
};

export const useNotificationsStore = create<
  NotificationsState & NotificationsActions
>()(
  devtools(
    (set) => ({
      ...initialState,

      setNotifications: (notifications) =>
        set({ notifications }, false, "notifications/setNotifications"),

      appendNotifications: (incoming) =>
        set(
          (s) => ({ notifications: [...s.notifications, ...incoming] }),
          false,
          "notifications/appendNotifications"
        ),

      prependNotification: (notification) =>
        set(
          (s) => ({ notifications: [notification, ...s.notifications] }),
          false,
          "notifications/prependNotification"
        ),

      markOneRead: (id) =>
        set(
          (s) => ({
            notifications: s.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            ),
          }),
          false,
          "notifications/markOneRead"
        ),

      markAllRead: () =>
        set(
          (s) => ({
            notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
          }),
          false,
          "notifications/markAllRead"
        ),

      setIsLoading: (isLoading) =>
        set({ isLoading }, false, "notifications/setIsLoading"),

      setIsMarkingAll: (isMarkingAll) =>
        set({ isMarkingAll }, false, "notifications/setIsMarkingAll"),

      setNextCursor: (nextCursor) =>
        set({ nextCursor }, false, "notifications/setNextCursor"),

      setHasMore: (hasMore) =>
        set({ hasMore }, false, "notifications/setHasMore"),

      setIsLoadingMore: (isLoadingMore) =>
        set({ isLoadingMore }, false, "notifications/setIsLoadingMore"),

      reset: () => set(initialState, false, "notifications/reset"),
    }),
    { name: "NotificationsStore" }
  )
);
