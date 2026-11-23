import { prisma } from "../lib/prisma.js";
import { getCache, setCache } from "../lib/cache/cache.js";

const STATS_VISITORS_CACHE_KEY = "stats:total_visitors";
const CACHE_TTL_SECONDS = 60; // 60-second cache TTL

export async function getTotalVisitors(): Promise<number> {
    try {
        const cached = await getCache<number>(STATS_VISITORS_CACHE_KEY);
        if (typeof cached === "number") {
            return cached;
        }

        const count = await prisma.siteVisitor.count();
        await setCache(STATS_VISITORS_CACHE_KEY, count, CACHE_TTL_SECONDS);
        return count;
    } catch (err) {
        console.error("[StatsService] Error getting visitor count:", err);
        return 0;
    }
}

export async function recordVisitor(visitorId: string): Promise<number> {
    const cleanId = visitorId.trim();

    try {
        const existing = await prisma.siteVisitor.findUnique({
            where: { visitorId: cleanId },
            select: { id: true },
        });

        if (!existing) {
            await prisma.siteVisitor.create({
                data: { visitorId: cleanId },
            });

            // Update cached count in Redis if already cached
            const cached = await getCache<number>(STATS_VISITORS_CACHE_KEY);
            if (typeof cached === "number") {
                await setCache(STATS_VISITORS_CACHE_KEY, cached + 1, CACHE_TTL_SECONDS);
            }
        } else {
            await prisma.siteVisitor.update({
                where: { visitorId: cleanId },
                data: { lastSeenAt: new Date() },
            }).catch(() => {});
        }
    } catch (err) {
        console.error("[StatsService] Error recording visitor:", err);
    }

    return getTotalVisitors();
}
