"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Bell, Loader2, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { usePushNotifications } from "@/lib/hooks/use-push-notifications";

export function PushOnboardingModal() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading: pushLoading,
    subscribe,
  } = usePushNotifications();

  const [isVisible, setIsVisible] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if deep-linked via email CTA (?action=enable-push)
  const isEmailAction = searchParams?.get("action") === "enable-push";

  React.useEffect(() => {
    // Clear any existing timer on effect run
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Don't show during auth loading, on auth screens, or if push unsupported
    if (authLoading || !isAuthenticated || !isSupported) {
      setIsVisible(false);
      return;
    }

    // Don't prompt on dedicated auth pages
    if (
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/forgot-password" ||
      pathname === "/reset-password"
    ) {
      setIsVisible(false);
      return;
    }

    // Already active or blocked in browser
    if (isSubscribed || permission === "denied") {
      setIsVisible(false);
      return;
    }

    // Check session dismissal
    const dismissed = sessionStorage.getItem("soc_push_onboarding_dismissed");
    if (dismissed && !isEmailAction) {
      setIsVisible(false);
      return;
    }

    // Small delay for clean entrance after page load
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
      timerRef.current = null;
    }, isEmailAction ? 300 : 1500);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [authLoading, isAuthenticated, isSupported, isSubscribed, permission, pathname, isEmailAction]);

  const handleDismiss = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    sessionStorage.setItem("soc_push_onboarding_dismissed", "true");
    setIsVisible(false);
  };

  const handleEnable = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const success = await subscribe();
    if (success) {
      setIsVisible(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative bg-white border border-charcoal-200/90 shadow-2xl rounded-2xl p-4 sm:p-5">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-100 transition-colors cursor-pointer"
          aria-label="Dismiss notification prompt"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <div className="p-2.5 rounded-xl bg-brand-50 text-brand-500 shrink-0">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-charcoal-900 font-jakarta">
              Enable Notifications
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-0.5 leading-relaxed">
              Get real-time updates when someone messages you.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-charcoal-100">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-1.5 text-xs font-semibold text-charcoal-500 hover:text-charcoal-800 transition-colors cursor-pointer"
          >
            Later
          </button>
          <button
            type="button"
            onClick={handleEnable}
            disabled={pushLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs sm:text-sm font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {pushLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Enabling...</span>
              </>
            ) : (
              <span>Enable Notifications</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
