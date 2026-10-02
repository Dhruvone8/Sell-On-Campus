import type { Request } from "express";
import { rateLimit } from "../middleware/rate-limit.middleware.js";

const emailKey = (req: Request) =>
    typeof req.body?.email === "string" ? req.body.email.toLowerCase().trim() : "unknown";

export const authRateLimiters = {
    otpRequest: [
        rateLimit({ windowSeconds: 15 * 60, maxRequests: 5, keyPrefix: "otp-request-ip" }),
        rateLimit({ windowSeconds: 15 * 60, maxRequests: 3, keyPrefix: "otp-request-email", keyGenerator: emailKey }),
    ],
    otpVerify: [
        rateLimit({ windowSeconds: 15 * 60, maxRequests: 10, keyPrefix: "otp-verify-ip" }),
        rateLimit({ windowSeconds: 15 * 60, maxRequests: 5, keyPrefix: "otp-verify-email", keyGenerator: emailKey }),
    ],
    login: rateLimit({ windowSeconds: 60, maxRequests: 5, keyPrefix: "login" }),
    forgotPassword: [
        rateLimit({ windowSeconds: 15 * 60, maxRequests: 5, keyPrefix: "forgot-password-ip" }),
        rateLimit({ windowSeconds: 15 * 60, maxRequests: 3, keyPrefix: "forgot-password-email", keyGenerator: emailKey }),
    ],
    forgotPasswordVerify: [
        rateLimit({ windowSeconds: 15 * 60, maxRequests: 10, keyPrefix: "forgot-password-verify-ip" }),
        rateLimit({ windowSeconds: 15 * 60, maxRequests: 5, keyPrefix: "forgot-password-verify-email", keyGenerator: emailKey }),
    ],
    resetPassword: rateLimit({ windowSeconds: 15 * 60, maxRequests: 10, keyPrefix: "reset-password-ip" }),
};

export const listingRateLimiters = {
    createListing: rateLimit({
        windowSeconds: 60 * 60,
        maxRequests: 10,
        keyPrefix: "create-listing-user",
        keyGenerator: (req: Request) => req.userId || "unknown",
    }),
};

export const conversationRateLimiters = {
    sendMessage: rateLimit({
        windowSeconds: 60,
        maxRequests: 30,
        keyPrefix: "send-message-user",
        keyGenerator: (req: Request) => req.userId || "unknown",
    }),
};

