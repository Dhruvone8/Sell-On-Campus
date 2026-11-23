import type { Request, Response } from "express";
import { getTotalVisitors, recordVisitor } from "../services/stats.service.js";

export async function getVisitors(_req: Request, res: Response) {
    try {
        const totalVisitors = await getTotalVisitors();
        return res.status(200).json({ totalVisitors });
    } catch (error) {
        console.error("[StatsController] Error getting visitor count:", error);
        return res.status(500).json({ message: "Failed to get visitor count" });
    }
}

export async function recordVisit(req: Request, res: Response) {
    try {
        const { visitorId } = req.body;
        if (!visitorId || typeof visitorId !== "string" || !visitorId.trim()) {
            return res.status(400).json({ message: "A valid visitorId is required" });
        }

        const totalVisitors = await recordVisitor(visitorId);
        return res.status(200).json({ totalVisitors });
    } catch (error) {
        console.error("[StatsController] Error recording visitor:", error);
        return res.status(500).json({ message: "Failed to record visitor" });
    }
}

