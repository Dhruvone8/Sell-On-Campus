import { z } from "zod";

const ALLOWED_PUSH_HOST_PATTERNS = [
    /(^|\.)push\.apple\.com$/i,
    /(^|\.)notify\.windows\.com$/i,
    /(^|\.)googleapis\.com$/i,
    /(^|\.)google\.com$/i,
    /(^|\.)services\.mozilla\.com$/i,
    /(^|\.)mozilla\.com$/i,
];

/**
 * Validates that a push endpoint URL belongs strictly to an authorized browser
 * push gateway over HTTPS, mitigating Server-Side Request Forgery (SSRF).
 */
export function isValidPushEndpoint(endpointUrl: string): boolean {
    try {
        const parsed = new URL(endpointUrl);
        if (parsed.protocol !== "https:") return false;
        if (parsed.port && parsed.port !== "443") return false;

        const hostname = parsed.hostname.toLowerCase();
        // Disallow direct IPv4 / IPv6 addresses
        if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(":")) {
            return false;
        }

        return ALLOWED_PUSH_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
    } catch {
        return false;
    }
}

export const notificationsQuerySchema = z.object({
    cursor: z.string().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});

// Validate the payload from browser's PushManager.subscribe()
export const subscribePushSchema = z.object({
    endpoint: z
        .string()
        .url("Valid push endpoint URL is required")
        .refine(
            isValidPushEndpoint,
            "Push endpoint must belong to an approved browser push service (Apple, Google, Mozilla, Microsoft)"
        ),
    keys: z.object({
        p256dh: z.string().min(1, "p256dh key is required"),
        auth: z.string().min(1, "auth key is required")
    }),
});

// Validate the endpoint when unsubscribing
export const unsubscribePushSchema = z.object({
    endpoint: z
        .string()
        .url("Valid push endpoint url is required")
        .refine(
            isValidPushEndpoint,
            "Push endpoint must belong to an approved browser push service"
        ),
});

