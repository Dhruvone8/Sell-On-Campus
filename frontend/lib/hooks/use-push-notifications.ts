"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth-context";
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
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          setIsSubscribed(true);
          // If authenticated, ensure the backend has this active subscription in DB
          if (isAuthenticated) {
            await saveSubscriptionToServer(subscription);
          }
        } else {
          setIsSubscribed(false);
        }
      } catch (err) {
        console.error("[Push] Error checking subscription status:", err);
      }
    }

    // Register the service worker and check initial status
    registerServiceWorker().then(() => {
      checkSubscription();
    });
  }, [isAuthenticated]);

  const subscribe = React.useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error("Push notifications are not supported on this browser.");
      return false;
    }

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

      // 2. Ensure Service Worker is ready
      const registration = await navigator.serviceWorker.ready;

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

      // Create a fresh subscription with the verified public key
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as unknown as BufferSource,
      });

      // 4. Send subscription keys to backend
      const saved = await saveSubscriptionToServer(subscription);

      if (saved) {
        setIsSubscribed(true);
        toast.success("Push notifications enabled!");
        return true;
      } else {
        toast.error("Failed to register subscription on the server.");
        return false;
      }
    } catch (err) {
      console.error("[Push] Error subscribing to push:", err);
      toast.error("An error occurred while enabling notifications.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const unsubscribe = React.useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

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

      setIsSubscribed(false);
      toast.success("Push notifications disabled.");
      return true;
    } catch (err) {
      console.error("[Push] Error unsubscribing from push:", err);
      toast.error("Failed to disable notifications.");
      return false;
    } finally {
      setIsLoading(false);
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
