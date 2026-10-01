import redis from "./redis.js";

export async function getCache<T>(key: string): Promise<T | null> {
    try {
        const value = await redis.get(key);

        if (!value) {
            return null;
        }

        return JSON.parse(value) as T;
    } catch (error) {
        console.error(`Redis GET failed for key ${key}:`, error);
        return null;
    }
}

export async function setCache<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
        await redis.set(key, JSON.stringify(value), { EX: ttl });
    } catch (error) {
        console.error(`Redis SET failed for key ${key}:`, error);
    }
}

export async function deleteCache(key: string): Promise<void> {
    try {
        await redis.del(key);
    } catch (error) {
        console.error(`Redis DELETE failed for key ${key}:`, error);
    }
}