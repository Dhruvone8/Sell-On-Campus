import { API_URL } from "./constants";

/**
 * Converts a base64 string to a Uint8Array.
 * The browser's PushManager requires applicationServerKey to be a Uint8Array.
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Registers the Service Worker at /sw.js with root scope.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    return registration;
  } catch (err) {
    console.error("[Push] Service Worker registration failed:", err);
    return null;
  }
}

/**
 * Fetches the VAPID public key from the backend.
 */
export async function getVapidPublicKey(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/api/notifications/push/public-key`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch VAPID public key: ${res.status}`);
    }

    const data = await res.json();
    return data.publicKey || null;
  } catch (err) {
    console.error("[Push] Error getting VAPID public key:", err);
    return null;
  }
}

/**
 * Sends the browser's PushSubscription object to the backend to persist in PostgreSQL.
 */
export async function saveSubscriptionToServer(
  subscription: PushSubscription
): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/notifications/push/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(subscription),
    });

    return res.ok;
  } catch (err) {
    console.error("[Push] Error saving subscription to server:", err);
    return false;
  }
}

/**
 * Informs the backend to remove an existing push subscription.
 */
export async function deleteSubscriptionFromServer(
  endpoint: string
): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/notifications/push/unsubscribe`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ endpoint }),
    });

    return res.ok;
  } catch (err) {
    console.error("[Push] Error removing subscription from server:", err);
    return false;
  }
}
