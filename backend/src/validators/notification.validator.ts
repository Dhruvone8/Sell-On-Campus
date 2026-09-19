import { z } from "zod";

export const notificationsQuerySchema = z.object({
    cursor: z.string().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(10),
}); 