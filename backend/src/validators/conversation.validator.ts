import { z } from "zod";

export const createConversationSchema = z.object({
    listingId: z.string().min(1),
});

export const createMessageSchema = z.object({
  content: z.string().trim().min(1).max(1000),
});