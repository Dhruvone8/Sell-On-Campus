import type { Request, Response } from "express";
import {
    createReport as createReportService,
    listReports as listReportsService,
    getReportById as getReportByIdService,
    resolveReport as resolveReportService,
} from "../services/report.service.js";
import { AppError } from "../lib/error.js";

export async function createReport(req: Request, res: Response) {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const { reason, description, listingId, reportedUserId } = req.body;

        const report = await createReportService({
            reporterId: userId,
            reason,
            description,
            listingId,
            reportedUserId,
        });

        return res.status(201).json({
            message: "Report submitted successfully",
            report,
        });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        console.error("Create report error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function listReports(_req: Request, res: Response) {
    try {
        const query = res.locals.validatedQuery as {
            page: number;
            limit: number;
            status?: any;
            reason?: any;
        };

        const result = await listReportsService(query);

        return res.status(200).json(result);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        console.error("List reports error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getReportById(req: Request, res: Response) {
    try {
        const { id } = req.params;

        if (!id || typeof id !== "string") {
            return res.status(400).json({ message: "Invalid report ID" });
        }

        const report = await getReportByIdService(id);

        return res.status(200).json({ report });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        console.error("Get report by ID error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function resolveReport(req: Request, res: Response) {
    try {
        const adminId = req.userId;

        if (!adminId) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const { id } = req.params;

        if (!id || typeof id !== "string") {
            return res.status(400).json({ message: "Invalid report ID" });
        }

        const { action, notes } = req.body;

        const result = await resolveReportService({
            reportId: id,
            adminId,
            action,
            notes,
        });

        return res.status(200).json(result);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        console.error("Resolve report error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
