import type { Request, Response } from "express";
import { createConversation as createConversationService, createMessage as createMessageService } from "../services/conversation.service.js";
import { AppError } from "../lib/error.js";

export async function createConversation(req: Request, res: Response) {
    const buyerId = req.userId!;

    const { listingId } = req.body;

    const conversation = await createConversationService(listingId, buyerId);

    return res.status(201).json({ conversation });
}

export async function createMessage(req: Request, res: Response) {
    const senderId = req.userId;
    const { conversationId } = req.params;
    const { content } = req.body;

    if (typeof conversationId !== "string") {
        throw new AppError("Invalid conversation ID", 400);
    }

    if (!senderId) {
        throw new AppError("Invalid sender Id", 400);
    }

    const message = await createMessageService(conversationId, senderId, content);

    return res.status(200).json({ message });
}