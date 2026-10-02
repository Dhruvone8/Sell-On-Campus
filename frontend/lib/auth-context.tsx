"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { UserProfile } from "./types";
import { API_URL } from "./constants";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = React.useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = React.useState(0);

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
  }, [verifyAndRefreshAuth]);

  const logout = React.useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setUnreadMessagesCount(0);
      setUnreadNotificationsCount(0);
      router.push("/login");
      router.refresh();
    }
  }, [router]);

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
  }, [verifyAndRefreshAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        unreadMessagesCount,
        setUnreadMessagesCount,
        unreadNotificationsCount,
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
