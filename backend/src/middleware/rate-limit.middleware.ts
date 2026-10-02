import type { Request, Response, NextFunction, RequestHandler } from "express";
import redis from "../lib/cache/redis.js";

interface RateLimitOptions {
    windowSeconds: number;
    maxRequests: number;
    keyPrefix: string;
    keyGenerator?: (req: Request) => string;
}

export function rateLimit(options: RateLimitOptions): RequestHandler {
    const { windowSeconds, maxRequests, keyPrefix,
        keyGenerator = (req: Request) => req.ip || "unknown" } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
        const identifier = keyGenerator(req);

        const key = `rate-limit:${keyPrefix}:${identifier}`;

        try {
            const count = await redis.incr(key);

            if (count === 1) {
                await redis.expire(key, windowSeconds);
            }

            const remaining = Math.max(maxRequests - count, 0);

            res.setHeader("X-RateLimit-Limit", maxRequests);
            res.setHeader("X-RateLimit-Remaining", remaining);

            if (count > maxRequests) {
                res.status(429).json({
                    message: "Too many requests. Please try again later."
                });

                return;
            }

            next();
        }

        catch (error) {
            console.error("Rate Limiter Redis Error: ", error);
            next();
        }
    }
}
