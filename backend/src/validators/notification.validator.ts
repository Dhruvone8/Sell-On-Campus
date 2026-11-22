import { z } from "zod";

export const notificationsQuerySchema = z.object({
    cursor: z.string().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});

// Validate the payload from browser's PushManager.subscribe()
export const subscribePushSchema = z.object({
    endpoint: z.string().url("Valid push endpoint URL is required"),
    keys: z.object({
        p256dh: z.string().min(1, "p256dh key is required"),
        auth: z.string().min(1, "auth key is required")
    }),
});

// Validate the endpoint when unsubscribing
export const unsubscribePushSchema = z.object({
    endpoint: z.string().url("Valid push endpoint url is required"),
})
