"use client";

import * as React from "react";
import { Bell, BellOff, BellRing, Loader2, X } from "lucide-react";
import { usePushNotifications } from "@/lib/hooks/use-push-notifications";

interface PushNotificationBannerProps {
  /** If true, shows a compact card/row version suitable for settings or sidebars */
  compact?: boolean;
}

export function PushNotificationBanner({ compact = false }: PushNotificationBannerProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const [dismissed, setDismissed] = React.useState(false);

  // If push is not supported by the browser, don't show the banner
  if (!isSupported) {
    return null;
  }

  // If user dismissed the prompt in this session, hide it
  if (dismissed && !isSubscribed) {
    return null;
  }

  // When already subscribed: Show status with an option to disable/manage
  if (isSubscribed) {
    if (compact) {
      return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-medium">
            <BellRing className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Push notifications are active</span>
          </div>
          <button
            type="button"
            onClick={unsubscribe}
            disabled={isLoading}
            className="text-xs text-charcoal-500 hover:text-charcoal-800 underline font-semibold transition-colors disabled:opacity-50"
          >
            {isLoading ? "Updating..." : "Disable"}
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 mb-6 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-emerald-900 font-jakarta">Push notifications are active</p>
            <p className="text-emerald-700 text-xs">
              You will receive real-time device notifications when buyers or sellers message you.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={unsubscribe}
          disabled={isLoading}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-semibold text-charcoal-600 bg-white border border-charcoal-200 hover:bg-charcoal-50 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Disable"}
        </button>
      </div>
    );
  }

  // If browser permission was explicitly denied
  if (permission === "denied") {
    if (compact) return null;

    return (
      <div className="flex items-start justify-between gap-3 p-4 mb-6 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs sm:text-sm text-amber-900">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
            <BellOff className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold font-jakarta text-amber-950">Notifications are blocked</p>
            <p className="text-amber-800 text-xs mt-0.5 leading-relaxed">
              Browser notifications are blocked. To receive alerts when buyers message you, click the lock / tune icon in your address bar and toggle Notifications to &quot;Allow&quot;.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg text-amber-600 hover:text-amber-900 transition-colors shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Default state: Prompt user to enable
  return (
    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 mb-6 rounded-2xl bg-gradient-to-r from-brand-50/80 via-orange-50/50 to-white border border-brand-200/70 shadow-xs">
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-brand-500 text-white shrink-0 shadow-xs">
          <Bell className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-bold text-charcoal-900 font-jakarta">
            Never miss a buyer&apos;s message
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-0.5">
            Enable instant notifications on your phone or desktop even when your tab is closed.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="px-3 py-2 text-xs font-semibold text-charcoal-500 hover:text-charcoal-800 transition-colors cursor-pointer"
        >
          Maybe later
        </button>
        <button
          type="button"
          onClick={subscribe}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs sm:text-sm font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enabling...</span>
            </>
          ) : (
            <>
              <Bell className="w-4 h-4" />
              <span>Enable Notifications</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
