import type { Request, Response, NextFunction, RequestHandler } from "express";
import redis from "../lib/cache/redis.js";

interface RateLimitOptions {
    windowSeconds: number;
    maxRequests: number;
    keyPrefix: string;
    keyGenerator?: (req: Request) => string;
}

const rateLimitScript = `
    local count = redis.call("INCR", KEYS[1])

    if count == 1 then
        redis.call("EXPIRE", KEYS[1], ARGV[1])
    end

    return count
`;

export function rateLimit(options: RateLimitOptions): RequestHandler {
    const { windowSeconds, maxRequests, keyPrefix,
        keyGenerator = (req: Request) => req.ip || "unknown" } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
        const identifier = keyGenerator(req);

        const key = `rate-limit:${keyPrefix}:${identifier}`;

        try {
            if (!redis.isReady) {
                // Redis unavailable (e.g. Upstash temporarily unreachable) — skip rate limiting rather than hanging
                return next();
            }

            const count = await redis.eval(
                rateLimitScript,
                {
                    keys: [key],
                    arguments: [String(windowSeconds)]
                }
            ) as number;

            const remaining = Math.max(maxRequests - count, 0);

            res.setHeader("X-RateLimit-Limit", maxRequests);
            res.setHeader("X-RateLimit-Remaining", remaining);

            if (count > maxRequests) {
                const retryAfter = await redis.ttl(key);

                res.setHeader("Retry-After", Math.max(retryAfter, 1));

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

