import * as webpush from "web-push";
import { prisma } from "../lib/prisma.js";
import { isValidPushEndpoint } from "../validators/notification.validator.js";

// 1. Initialize web-push with VAPID Keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "https://selloncampus.site";

if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} else {
    console.warn("[PushService] VAPID keys not configured in environment variables.");
}

// 2. Define the shape of notification payload
export interface PushPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, unknown>;
}

export interface SubscriptionData {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

// 3. Save or update a browser subscription for a user
export async function saveSubscription(userId: string, subscription: SubscriptionData) {
    return prisma.pushSubscription.upsert({
        where: {
            endpoint: subscription.endpoint,
        },
        update: {
            userId,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
        },
        create: {
            userId,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth
        },
    });
}

// 4. Remove a subscription when a user unsubscribes or logs out
export async function removeSubscription(endpoint: string, userId: string) {
    return prisma.pushSubscription.deleteMany({
        where: {
            endpoint,
            userId,
        },
    });
}

// 5. Send a push notification to all active devices of a user
export async function sendPushNotification(userId: string, payload: PushPayload) {
    if (!vapidPublicKey || !vapidPrivateKey) {
        return;
    }

    // Find all registered devices for this recipient
    const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId },
    });

    if (subscriptions.length === 0) {
        return;
    }

    const payloadString = JSON.stringify(payload);

    // Send concurrently to all devices with finite timeout and endpoint verification
    const sendPromises = subscriptions.map(async (sub) => {
        if (!isValidPushEndpoint(sub.endpoint)) {
            console.warn(`[PushService] Skipping untrusted endpoint for user ${userId}: ${sub.endpoint}`);
            return;
        }

        const target = {
            endpoint: sub.endpoint,
            keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
            },
        };

        try {
            await webpush.sendNotification(target, payloadString, { timeout: 10000 });
            console.log(`[PushService] Push delivered successfully to device ${sub.id.slice(0, 8)}`);
        } catch (error: any) {
            if (error.statusCode === 404 || error.statusCode === 410) {
                console.log(`[PushService] Removing expired subscription for user ${userId}`);
                await prisma.pushSubscription.delete({
                    where: { id: sub.id },
                }).catch(() => { });
            } else {
                console.error("[PushService] Failed to send push: ", error.statusCode || error.name, error.message || error);
            }
        }
    });

    await Promise.allSettled(sendPromises);
}