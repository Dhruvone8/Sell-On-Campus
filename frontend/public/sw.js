// Service Worker for SellOnCampus Web Push Notifications

// 1. Immediately claim control of open pages on activation
self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

// 2. Listen for incoming push events from the push server
self.addEventListener("push", (event) => {
    if (!event.data) {
        return;
    }

    try {
        const payload = event.data.json();

        const title = payload.title || "SellOnCampus";
        const options = {
            body: payload.body || "You have a new update",
            icon: payload.icon || "https://res.cloudinary.com/tiuyn5qd/image/upload/v1790494828/logo-favicon.png",
            badge: payload.badge || "https://res.cloudinary.com/tiuyn5qd/image/upload/v1790494828/logo-favicon.png",
            tag: payload.tag || "general-notification",
            renotify: true,
            data: payload.data || { url: "/" },
        };

        event.waitUntil(self.registration.showNotification(title, options));
    } catch (err) {
        console.error("[ServiceWorker] Failed to display push notification:", err);
    }
});

// 3. Listen for clicks on the notification banner
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url || "/";

    // Focus existing open tab if available, otherwise open a new window
    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clientList) => {
            // Check if there is already an open window on SellOnCampus
            for (const client of clientList) {
                if ("focus" in client) {
                    try {
                        await client.focus();
                        if ("navigate" in client) {
                            await client.navigate(targetUrl);
                        }
                        return;
                    } catch (err) {
                        console.warn("[ServiceWorker] Failed to navigate existing tab:", err);
                    }
                }
            }

            // If no tab could navigate, open a new window to the conversation URL
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});

