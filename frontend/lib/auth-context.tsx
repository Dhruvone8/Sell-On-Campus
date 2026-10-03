"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { UserProfile } from "./types";
import { API_URL } from "./constants";
import { useAuthStore } from "./stores/auth.store";
import { useInboxStore } from "./stores/inbox.store";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Kept for backward-compatibility; prefer useInboxStore() in new code
  unreadMessagesCount: number;
  setUnreadMessagesCount: React.Dispatch<React.SetStateAction<number>>;
  unreadNotificationsCount: number;
  setUnreadNotificationsCount: React.Dispatch<React.SetStateAction<number>>;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // ── Zustand store setters ──────────────────────────────────────────────
  const setAuthUser = useAuthStore((s) => s.setUser);
  const setAuthIsAuthenticated = useAuthStore((s) => s.setIsAuthenticated);
  const setAuthIsLoading = useAuthStore((s) => s.setIsLoading);
  const resetAuth = useAuthStore((s) => s.reset);
  const bumpSessionGeneration = useAuthStore((s) => s.bumpSessionGeneration);

  const storeUnreadMessages = useInboxStore((s) => s.unreadMessagesCount);
  const storeSetUnreadMessages = useInboxStore((s) => s.setUnreadMessagesCount);
  const storeUnreadNotifications = useInboxStore((s) => s.unreadNotificationsCount);
  const storeSetUnreadNotifications = useInboxStore((s) => s.setUnreadNotificationsCount);
  const resetInbox = useInboxStore((s) => s.reset);

  // ── Local React state (mirrors store; keeps context interface stable) ──
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Sync local state up to the auth store so any component reading the store
  // stays up to date without subscribing to the context.
  React.useEffect(() => { setAuthUser(user); }, [user, setAuthUser]);
  React.useEffect(() => { setAuthIsAuthenticated(isAuthenticated); }, [isAuthenticated, setAuthIsAuthenticated]);
  React.useEffect(() => { setAuthIsLoading(isLoading); }, [isLoading, setAuthIsLoading]);

  // ── Badge-count wrappers that keep both context and store in sync ──────
  const setUnreadMessagesCount: React.Dispatch<React.SetStateAction<number>> =
    React.useCallback(
      (value) => storeSetUnreadMessages(value as number | ((prev: number) => number)),
      [storeSetUnreadMessages]
    );

  const setUnreadNotificationsCount: React.Dispatch<React.SetStateAction<number>> =
    React.useCallback(
      (value) => storeSetUnreadNotifications(value as number | ((prev: number) => number)),
      [storeSetUnreadNotifications]
    );

  const verifyAndRefreshAuth = React.useCallback(
    async (): Promise<{
      authed: boolean;
      user: UserProfile | null;
      unreadMessages: number;
      unreadNotifications: number;
    }> => {
      try {
        let userRes = await fetch(`${API_URL}/api/users/me`, {
          method: "GET",
          credentials: "include",
        });

        // If access token expired, attempt automatic refresh via HTTP-only refresh token
        if (userRes.status === 401) {
          try {
            const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
              method: "POST",
              credentials: "include",
            });
            if (refreshRes.ok) {
              userRes = await fetch(`${API_URL}/api/users/me`, {
                method: "GET",
                credentials: "include",
              });
            }
          } catch {
            // Token refresh network error
          }
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          const currentUser: UserProfile = userData.user;

          let totalUnreadMessages = 0;
          let totalUnreadNotifications = 0;

          try {
            const [convRes, notifRes] = await Promise.all([
              fetch(`${API_URL}/api/conversations?limit=20`, {
                method: "GET",
                credentials: "include",
              }).catch(() => null),
              fetch(`${API_URL}/api/notifications?limit=30`, {
                method: "GET",
                credentials: "include",
              }).catch(() => null),
            ]);

            if (convRes && convRes.ok) {
              const data = await convRes.json();
              if (Array.isArray(data.conversations)) {
                totalUnreadMessages = data.conversations.reduce(
                  (acc: number, conv: { unreadCount?: number }) => acc + (conv.unreadCount || 0),
                  0
                );
              }
            }

            if (notifRes && notifRes.ok) {
              const notifData = await notifRes.json();
              if (Array.isArray(notifData.notifications)) {
                totalUnreadNotifications = notifData.notifications.filter(
                  (n: { isRead: boolean }) => !n.isRead
                ).length;
              }
            }
          } catch {
            // Non-blocking parallel counts error
          }

          return {
            authed: true,
            user: currentUser,
            unreadMessages: totalUnreadMessages,
            unreadNotifications: totalUnreadNotifications,
          };
        }

        return { authed: false, user: null, unreadMessages: 0, unreadNotifications: 0 };
      } catch {
        return { authed: false, user: null, unreadMessages: 0, unreadNotifications: 0 };
      }
    },
    []
  );

  const checkAuth = React.useCallback(async () => {
    try {
      const { authed, user: authedUser, unreadMessages, unreadNotifications } = await verifyAndRefreshAuth();
      setIsAuthenticated(authed);
      setUser(authedUser);
      setUnreadMessagesCount(unreadMessages);
      setUnreadNotificationsCount(unreadNotifications);
    } finally {
      setIsLoading(false);
    }
  }, [verifyAndRefreshAuth, setUnreadMessagesCount, setUnreadNotificationsCount]);

  const logout = React.useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      // Bump generation FIRST — invalidates all in-flight fetch callbacks before
      // we clear the store, so stale responses can't repopulate it after the reset.
      bumpSessionGeneration();
      setIsAuthenticated(false);
      setUser(null);
      setUnreadMessagesCount(0);
      setUnreadNotificationsCount(0);
      resetAuth();
      resetInbox();
      router.push("/login");
      router.refresh();
    }
  }, [router, setUnreadMessagesCount, setUnreadNotificationsCount, resetAuth, resetInbox, bumpSessionGeneration]);

  React.useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      const { authed, user: authedUser, unreadMessages, unreadNotifications } = await verifyAndRefreshAuth();
      if (!isMounted) return;
      setIsAuthenticated(authed);
      setUser(authedUser);
      setUnreadMessagesCount(unreadMessages);
      setUnreadNotificationsCount(unreadNotifications);
      setIsLoading(false);
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifyAndRefreshAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        unreadMessagesCount: storeUnreadMessages,
        setUnreadMessagesCount,
        unreadNotificationsCount: storeUnreadNotifications,
        setUnreadNotificationsCount,
        checkAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
