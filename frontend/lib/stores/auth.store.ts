import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { UserProfile } from "@/lib/types";

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Incremented on every logout — async callbacks compare against this to detect stale sessions */
  sessionGeneration: number;
}

interface AuthActions {
  setUser: (user: UserProfile | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  /** Increment session generation to invalidate all in-flight async fetches */
  bumpSessionGeneration: () => void;
  /** Reset everything on logout */
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  sessionGeneration: 0,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user }, false, "auth/setUser"),
      setIsAuthenticated: (isAuthenticated) =>
        set({ isAuthenticated }, false, "auth/setIsAuthenticated"),
      setIsLoading: (isLoading) =>
        set({ isLoading }, false, "auth/setIsLoading"),

      bumpSessionGeneration: () =>
        set(
          (s) => ({ sessionGeneration: s.sessionGeneration + 1 }),
          false,
          "auth/bumpSessionGeneration"
        ),

      reset: () => set(initialState, false, "auth/reset"),
    }),
    { name: "AuthStore" }
  )
);
