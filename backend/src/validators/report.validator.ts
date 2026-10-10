import { z } from "zod";

export const createReportSchema = z.object({
    reason: z.enum(["FRAUD", "PROHIBITED_ITEM", "INAPPROPRIATE_CONTENT", "MISLEADING_LISTING", "HARASSMENT", "OTHER"]),
    description: z.string().trim().min(10).max(500).optional(),
    listingId: z.string().uuid().optional(),
    reportedUserId: z.string().uuid().optional(),
}).refine(
    (data) => data.listingId || data.reportedUserId,
    { message: "Either listingId or reportedUserId must be provided" }
);

export const resolveReportSchema = z.object({
    action: z.enum(["DISMISSED", "WARNING_ISSUED", "LISTING_REMOVED", "USER_SUSPENDED", "USER_BANNED"]),
    notes: z.string().trim().min(5).max(1000).optional(),
});

export const reportQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    status: z.enum(["PENDING", "REVIEWED", "RESOLVED"]).optional(),
    reason: z.enum(["FRAUD", "PROHIBITED_ITEM", "INAPPROPRIATE_CONTENT", "MISLEADING_LISTING", "HARASSMENT", "OTHER"]).optional(),
});
