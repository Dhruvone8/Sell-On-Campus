import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error("REDIS_URL is not defined");
}

const redis = createClient({ url: redisUrl });

redis.on("error", (error) => {
    console.error("Redis Client Error: ", error);
});

export async function connectRedis() {
    if (!redis.isOpen) {
        await redis.connect();
    }
}

export default redis;