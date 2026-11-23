import { z } from "zod";

export const recordVisitSchema = z.object({
    visitorId: z
        .string({
            message: "visitorId must be a valid string",
        })
        .trim()
        .min(8, "visitorId must be at least 8 characters")
        .max(128, "visitorId cannot exceed 128 characters"),
});

export type RecordVisitInput = z.infer<typeof recordVisitSchema>;
