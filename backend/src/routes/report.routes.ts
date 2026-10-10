import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { validate, validateQuery } from "../middleware/validate.middleware.js";
import {
    createReport,
    listReports,
    getReportById,
    resolveReport,
} from "../controllers/report.controller.js";
import {
    createReportSchema,
    resolveReportSchema,
    reportQuerySchema,
} from "../validators/report.validator.js";
import { reportRateLimiters } from "../utils/rate-limit.util.js";

const router = Router();

// Student: Submit a report
router.post("/", requireAuth, reportRateLimiters.createReport, validate(createReportSchema), createReport);

// Admin: View and resolve reports
router.get("/", requireAuth, requireAdmin, validateQuery(reportQuerySchema), listReports);
router.get("/:id", requireAuth, requireAdmin, getReportById);
router.post("/:id/resolve", requireAuth, requireAdmin, validate(resolveReportSchema), resolveReport);

export default router;
