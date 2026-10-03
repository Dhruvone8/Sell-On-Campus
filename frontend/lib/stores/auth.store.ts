import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { UserProfile } from "@/lib/types";

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: UserProfile | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  /** Reset everything on logout */
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
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

      reset: () => set(initialState, false, "auth/reset"),
    }),
    { name: "AuthStore" }
  )
);
