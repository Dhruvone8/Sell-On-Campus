import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/auth/tokens.js";
import { prisma } from "../lib/prisma.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const accessToken = req.cookies?.accessToken;

        if (!accessToken) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const { payload } = await verifyAccessToken(accessToken);

        if (payload.type !== "access") {
            return res.status(401).json({ message: "Invalid access token" });
        }

        if (typeof payload.sub !== "string") {
            return res.status(401).json({ message: "Invalid access token" });
        }

        req.userId = payload.sub;
        next();

    } catch {
        return res.status(401).json({ message: "Invalid access token" });
    }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { role: true, status: true },
        });

        if (!user || user.status !== "ACTIVE") {
            return res.status(403).json({ message: "Account is inactive or suspended" });
        }

        if (user.role !== "ADMIN") {
            return res.status(403).json({ message: "Admin access required" });
        }

        next();
    } catch (error) {
        console.error("RequireAdmin middleware error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}