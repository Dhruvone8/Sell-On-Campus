import type { Request, Response } from "express";
import { getTotalVisitors, recordVisitor } from "../services/stats.service.js";

export async function getVisitors(req: Request, res: Response) {
    const totalVisitors = await getTotalVisitors();
    return res.status(200).json({ totalVisitors });
}

export async function recordVisit(req: Request, res: Response) {
    const { visitorId } = req.body;
    const totalVisitors = await recordVisitor(visitorId);
    return res.status(200).json({ totalVisitors });
}
