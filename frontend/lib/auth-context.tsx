"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
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
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = React.useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = React.useState(0);

  const verifyAndRefreshAuth = React.useCallback(
    async (): Promise<{ authed: boolean; unreadMessages: number; unreadNotifications: number }> => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        let response = await fetch(`${apiUrl}/api/conversations?limit=10`, {
          method: "GET",
          credentials: "include",
        });

        // If access token expired, attempt automatic refresh via HTTP-only refresh token
        if (response.status === 401) {
          try {
            const refreshRes = await fetch(`${apiUrl}/api/auth/refresh`, {
              method: "POST",
              credentials: "include",
            });
            if (refreshRes.ok) {
              response = await fetch(`${apiUrl}/api/conversations?limit=10`, {
                method: "GET",
                credentials: "include",
              });
            }
          } catch {
            // Token refresh network error
          }
        }

        if (response.ok) {
          const data = await response.json();
          let totalUnreadMessages = 0;
          if (Array.isArray(data.conversations)) {
            totalUnreadMessages = data.conversations.reduce(
              (acc: number, conv: { unreadCount?: number }) => acc + (conv.unreadCount || 0),
              0
            );
          }

          let totalUnreadNotifications = 0;
          try {
            const notifRes = await fetch(`${apiUrl}/api/notifications?limit=30`, {
              method: "GET",
              credentials: "include",
            });
            if (notifRes.ok) {
              const notifData = await notifRes.json();
              if (Array.isArray(notifData.notifications)) {
                totalUnreadNotifications = notifData.notifications.filter(
                  (n: { isRead: boolean }) => !n.isRead
                ).length;
              }
            }
          } catch {
            // Non-blocking notification fetch error
          }

          return {
            authed: true,
            unreadMessages: totalUnreadMessages,
            unreadNotifications: totalUnreadNotifications,
          };
        }

        return { authed: false, unreadMessages: 0, unreadNotifications: 0 };
      } catch {
        return { authed: false, unreadMessages: 0, unreadNotifications: 0 };
      }
    },
    []
  );

  const checkAuth = React.useCallback(async () => {
    try {
      const { authed, unreadMessages, unreadNotifications } = await verifyAndRefreshAuth();
      setIsAuthenticated(authed);
      setUnreadMessagesCount(unreadMessages);
      setUnreadNotificationsCount(unreadNotifications);
    } finally {
      setIsLoading(false);
    }
  }, [verifyAndRefreshAuth]);

  const logout = React.useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      setIsAuthenticated(false);
      setUnreadMessagesCount(0);
      setUnreadNotificationsCount(0);
      router.push("/login");
      router.refresh();
    }
  }, [router]);

  React.useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      const { authed, unreadMessages, unreadNotifications } = await verifyAndRefreshAuth();
      if (!isMounted) return;
      setIsAuthenticated(authed);
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
