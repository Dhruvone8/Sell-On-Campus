import { prisma } from "../lib/prisma.js";
import { getCache, setCache, deleteCache } from "../lib/cache/cache.js";

const STATS_VISITORS_CACHE_KEY = "stats:total_visitors";
const CACHE_TTL_SECONDS = 60; // 60-second cache TTL

export async function getTotalVisitors(): Promise<number> {
    const cached = await getCache<number>(STATS_VISITORS_CACHE_KEY);
    if (typeof cached === "number") {
        return cached;
    }

    // Authoritative count from database
    const count = await prisma.siteVisitor.count();
    await setCache(STATS_VISITORS_CACHE_KEY, count, CACHE_TTL_SECONDS);
    return count;
}

export async function recordVisitor(visitorId: string): Promise<number> {
    const cleanId = visitorId?.trim();
    if (!cleanId) {
        throw new Error("A valid visitorId is required");
    }

    // Atomic upsert: creates a new visitor record or updates lastSeenAt if already exists.
    // Repeated registrations of an existing visitor remain successful.
    await prisma.siteVisitor.upsert({
        where: { visitorId: cleanId },
        create: { visitorId: cleanId },
        update: { lastSeenAt: new Date() },
    });

    // Invalidate cached count so subsequent reads fetch the authoritative DB count
    await deleteCache(STATS_VISITORS_CACHE_KEY);

    return getTotalVisitors();
}

