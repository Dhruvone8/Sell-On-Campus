import type { Request, Response } from "express";
import { createConversation as createConversationService } from "../services/conversation.service.js";
import { AppError } from "../lib/error.js";

export async function createConversation(req: Request, res: Response) {
    const buyerId = req.userId!;

    const { listingId } = req.body;

    const conversation = await createConversationService(listingId, buyerId);

    return res.status(201).json({ conversation });
}