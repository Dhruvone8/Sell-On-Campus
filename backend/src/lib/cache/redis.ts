import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redis = createClient({
    url: redisUrl,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 3) {
                return false; // Stop reconnect loop if Redis is not configured
            }
            return Math.min(retries * 500, 2000);
        }
    }
});

redis.on("error", (error) => {
    // Prevent unhandled error crashes
    console.warn("Redis Warning (Client Error):", error.message || error);
});

export async function connectRedis() {
    if (!redis.isOpen) {
        await redis.connect();
    }
}

export default redis;