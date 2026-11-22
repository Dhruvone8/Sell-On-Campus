"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { useAuth, authSyncChannel } from "@/lib/auth-context";
import { useAuthStore } from "@/lib/stores/auth.store";
import {
  urlBase64ToUint8Array,
  registerServiceWorker,
  getVapidPublicKey,
  saveSubscriptionToServer,
  deleteSubscriptionFromServer,
} from "@/lib/push";

export function usePushNotifications() {
  const { isAuthenticated } = useAuth();

  const [isSupported, setIsSupported] = React.useState(false);
  const [permission, setPermission] = React.useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Separate counters for background status checks vs user actions
  // This prevents background SW registration/checks from superseding user subscribe/unsubscribe calls
  const actionIdRef = React.useRef(0);
  const checkIdRef = React.useRef(0);
  // Abort controller for in-flight subscription work
  const activeAbortControllerRef = React.useRef<AbortController | null>(null);

  // Cross-tab logout listener & push coordination
  React.useEffect(() => {
    const handleSyncMessage = (event: MessageEvent) => {
      if (event.data?.type === "LOGOUT_START") {
        actionIdRef.current++;
        checkIdRef.current++;
        activeAbortControllerRef.current?.abort();
        setIsSubscribed(false);
        setIsLoading(false);
      }
    };

    authSyncChannel?.addEventListener("message", handleSyncMessage);
    return () => {
      authSyncChannel?.removeEventListener("message", handleSyncMessage);
    };
  }, []);

  // Check browser support and existing subscription status
  React.useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setIsSupported(supported);

    if (!supported) return;

    setPermission(Notification.permission);

    async function checkSubscription() {
      const currentCheckId = ++checkIdRef.current;
      const initialGen = useAuthStore.getState().sessionGeneration;

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (checkIdRef.current !== currentCheckId) return;

        if (subscription) {
          // For authenticated users, verify backend registration before marking active
          if (isAuthenticated && useAuthStore.getState().sessionGeneration === initialGen) {
            const saved = await saveSubscriptionToServer(subscription);

            // Invalidate if a newer check or logout intervened while awaiting server save
            if (
              checkIdRef.current !== currentCheckId ||
              useAuthStore.getState().sessionGeneration !== initialGen ||
              !useAuthStore.getState().isAuthenticated
            ) {
              return;
            }

            setIsSubscribed(saved);
          } else {
            setIsSubscribed(false);
          }
        } else {
          setIsSubscribed(false);
        }
      } catch (err) {
        if (checkIdRef.current === currentCheckId) {
          console.error("[Push] Error checking subscription status:", err);
        }
      }
    }

    // Register the service worker and check initial status only if registration succeeded
    registerServiceWorker().then((reg) => {
      if (reg) {
        checkSubscription();
      }
    });
  }, [isAuthenticated]);

  const subscribe = React.useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error("Push notifications are not supported on this browser.");
      return false;
    }

    if (!useAuthStore.getState().isAuthenticated) {
      toast.error("Please sign in to enable notifications.");
      return false;
    }

    const currentActionId = ++actionIdRef.current;
    const currentGen = useAuthStore.getState().sessionGeneration;

    const controller = new AbortController();
    activeAbortControllerRef.current = controller;

    setIsLoading(true);

    try {
      // 1. Request notification permission from the user
      const userPermission = await Notification.requestPermission();
      setPermission(userPermission);

      if (userPermission !== "granted") {
        if (userPermission === "denied") {
          toast.error("Notification permission denied. Please allow it in browser settings.");
        }
        return false;
      }

      // 2. Ensure Service Worker is registered before awaiting readiness
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = (await registerServiceWorker()) || undefined;
      }
      if (!registration) {
        toast.error("Failed to initialize notification service worker.");
        return false;
      }

      await navigator.serviceWorker.ready;

      // Check if logout occurred during readiness wait
      if (
        actionIdRef.current !== currentActionId ||
        useAuthStore.getState().sessionGeneration !== currentGen ||
        !useAuthStore.getState().isAuthenticated
      ) {
        return false;
      }

      // 3. Fetch current VAPID public key from backend
      const publicKey = await getVapidPublicKey();
      if (!publicKey) {
        toast.error("Failed to load notification security key.");
        return false;
      }

      const applicationServerKey = urlBase64ToUint8Array(publicKey);

      // Unsubscribe any stale existing subscription to guarantee key alignment
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        try {
          await existingSub.unsubscribe();
        } catch {
          // ignore error if already invalidated
        }
      }

      // Check session status before creating subscription in browser
      if (
        actionIdRef.current !== currentActionId ||
        useAuthStore.getState().sessionGeneration !== currentGen ||
        !useAuthStore.getState().isAuthenticated
      ) {
        return false;
      }

      // Create a fresh subscription with the verified public key
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as unknown as BufferSource,
      });

      // Guard check: if logout started while browser was creating subscription, rollback immediately
      if (
        actionIdRef.current !== currentActionId ||
        useAuthStore.getState().sessionGeneration !== currentGen ||
        !useAuthStore.getState().isAuthenticated
      ) {
        try {
          await subscription.unsubscribe();
        } catch {
          // ignore rollback error
        }
        return false;
      }

      // 4. Send subscription keys to backend with abort signal
      const saved = await saveSubscriptionToServer(subscription, {
        signal: controller.signal,
      });

      // Post-save verification: if logout began while save was in flight, immediately purge and unsubscribe
      if (
        actionIdRef.current !== currentActionId ||
        useAuthStore.getState().sessionGeneration !== currentGen ||
        !useAuthStore.getState().isAuthenticated
      ) {
        try {
          await deleteSubscriptionFromServer(subscription.endpoint);
          await subscription.unsubscribe();
        } catch {
          // ignore cleanup error
        }
        return false;
      }

      if (saved) {
        setIsSubscribed(true);
        toast.success("Push notifications enabled!");
        return true;
      } else {
        toast.error("Failed to register subscription on the server.");
        return false;
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("[Push] Error subscribing to push:", err);
        toast.error("An error occurred while enabling notifications.");
      }
      return false;
    } finally {
      if (actionIdRef.current === currentActionId) {
        setIsLoading(false);
      }
    }
  }, [isSupported]);

  const unsubscribe = React.useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    const currentActionId = ++actionIdRef.current;
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        // Unsubscribe from browser PushManager
        await subscription.unsubscribe();
        // Notify backend to remove record from DB
        await deleteSubscriptionFromServer(endpoint);
      }

      if (actionIdRef.current === currentActionId) {
        setIsSubscribed(false);
        toast.success("Push notifications disabled.");
      }
      return true;
    } catch (err) {
      console.error("[Push] Error unsubscribing from push:", err);
      toast.error("Failed to disable notifications.");
      return false;
    } finally {
      if (actionIdRef.current === currentActionId) {
        setIsLoading(false);
      }
    }
  }, [isSupported]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  };
}
