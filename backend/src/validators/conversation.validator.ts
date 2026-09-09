import { z } from "zod";

export const createConversationSchema = z.object({
    listingId: z.string().min(1),
});