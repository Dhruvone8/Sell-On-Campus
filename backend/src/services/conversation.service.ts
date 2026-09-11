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

    return prisma.$transaction(async (tx) => {
        const updatedConversation = await tx.conversation.update({
            where: {
                id: conversation.id,
            },
            data: {
                messageSequence: {
                    increment: 1,
                },
            },
            select: {
                messageSequence: true,
            }
        });

        return tx.message.create({
            data: {
                content,
                conversationId: conversation?.id,
                senderId,
                sequence: updatedConversation.messageSequence
            },
        });
    });
}

export async function getConversationMessages(conversationId: string, userId: string, limit: number, cursor?: number) {
    const conversation = await prisma.conversation.findUnique({
        where: {
            id: conversationId,
        },
        select: {
            id: true,
            buyerId: true,
            sellerId: true,
        },
    });

    if (!conversation) {
        throw new AppError("Conversation not Found", 404);
    }

    // Check if the user is the buyer / seller for the listing which conversation is related to
    const isParticipant = userId === conversation.buyerId || userId === conversation.sellerId;

    if (!isParticipant) {
        throw new AppError("You are not a participant in this conversation", 403);
    }

    const messages = await prisma.message.findMany({
        where: {
            conversationId: conversation.id,
            ...(cursor !== undefined ? {
                sequence: {
                    lt: cursor,
                },
            } : {}),
        },

        orderBy: {
            sequence: "desc",
        },

        take: limit + 1,
    });

    const hasMore = messages.length > limit;

    if(hasMore) {
        messages.pop();
    }

    messages.reverse();

    return {
        messages, pagination: {
            nextCursor: messages.length > 0 ? messages[0]?.sequence : null, hasMore
        },
    };
}