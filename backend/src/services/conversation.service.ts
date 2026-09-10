import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/error.js";

export async function createConversation(listingId: string, buyerId: string) {
    const listing = await prisma.listing.findUnique({
        where: {
            id: listingId
        },
        select: {
            id: true,
            sellerId: true,
        },
    });

    if (!listing) throw new AppError("Listing Not Found", 404);

    if (listing.sellerId == buyerId) {
        throw new AppError("You cannot start a conversation with yourself", 400);
    }

    const existingConversation = await prisma.conversation.findUnique({
        where: {
            listingId_buyerId_sellerId: {
                listingId,
                buyerId,
                sellerId: listing.sellerId,
            },
        },
    });

    if (existingConversation) {
        return existingConversation;
    }

    return prisma.conversation.create({
        data: {
            listingId,
            buyerId,
            sellerId: listing.sellerId
        },
    });
}

export async function createMessage(conversationId: string, senderId: string, content: string) {
    const conversation = await prisma.conversation.findUnique({
        where: {
            id: conversationId,
        },
        select: {
            id: true,
            buyerId: true,
            sellerId: true
        },
    });

    if (!conversation) {
        throw new AppError("Conversation Not Found", 404);
    }

    const isParticipant = conversation.buyerId === senderId || conversation.sellerId === senderId;

    if (!isParticipant) {
        throw new AppError("You are not a participant in this conversation", 403)
    }

    return prisma.message.create({
        data: {
            content,
            conversationId: conversation.id,
            senderId
        }
    })
}