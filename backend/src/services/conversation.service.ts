import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/error.js";

function encodeConversationCursor(updatedAt: Date, id: string) {
    return Buffer.from(
        JSON.stringify({
            updatedAt: updatedAt.toISOString(),
            id,
        }),
    ).toString("base64url");
}

function decodeConversationCursor(cursor: string) {
    try {
        const decoded = JSON.parse(
            Buffer.from(cursor, "base64url").toString("utf-8"),
        );

        if (typeof decoded.updatedAt !== "string" || typeof decoded.id !== "string") {
            throw new Error();
        }

        const updatedAt = new Date(decoded.updatedAt);

        if (Number.isNaN(updatedAt.getTime())) {
            throw new Error();
        }

        return {
            updatedAt,
            id: decoded.id,
        };
    } catch {
        throw new AppError("Invalid conversation cursor", 400);
    }
}


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

        const message = await tx.message.create({
            data: {
                content,
                conversationId: conversation?.id,
                senderId,
                sequence: updatedConversation.messageSequence
            },
        });

        await tx.conversation.update({
            where: {
                id: conversation.id,
            },
            data: {
                updatedAt: new Date(),
            },
        });

        return message;
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

    if (hasMore) {
        messages.pop();
    }

    messages.reverse();

    return {
        messages, pagination: {
            nextCursor: messages.length > 0 ? messages[0]?.sequence : null, hasMore
        },
    };
}

export async function getUserConversations(userId: string, limit: number, cursor?: string) {

    const decodedCursor = cursor ? decodeConversationCursor(cursor) : undefined;

    const conversations = await prisma.conversation.findMany({
        where: {
            OR: [{ buyerId: userId }, { sellerId: userId }],
            messages: { some: {} },
        },

        orderBy: [
            { updatedAt: "desc" },
            { id: "desc" }
        ],

        ...(decodedCursor
            ? {
                cursor: {
                    updatedAt_id: {
                        updatedAt: decodedCursor.updatedAt,
                        id: decodedCursor.id,
                    },
                },
                skip: 1,
            }
            : {}),

        take: limit + 1,

        select: {
            id: true,
            updatedAt: true,

            listing: {
                select: {
                    id: true,
                    title: true,
                    price: true,
                    status: true
                },
            },

            buyer: {
                select: {
                    id: true,
                    name: true,
                    profileImageUrl: true
                },
            },

            seller: {
                select: {
                    id: true,
                    name: true,
                    profileImageUrl: true
                },
            },

            messages: {
                orderBy: {
                    sequence: "desc",
                },

                take: 1,
                select: {
                    id: true,
                    content: true,
                    senderId: true,
                    sequence: true,
                    createdAt: true
                },
            },
        },
    });

    const hasMore = conversations.length > limit;

    if (hasMore) {
        conversations.pop();
    }

    const nextConversation = conversations.length > 0 ? conversations[conversations.length - 1] : null;

    const nextCursor = hasMore && nextConversation ? encodeConversationCursor(
        nextConversation.updatedAt,
        nextConversation.id,
    ) : null;

    const result = conversations.map((conversation) => {
        const otherUser = conversation.buyer.id === userId ? conversation.seller : conversation.buyer;

        return {
            id: conversation.id,
            listing: conversation.listing,
            otherUser,
            lastMessage: conversation.messages[0]
        };
    });

    return {
        conversations: result,
        pagination: {
            nextCursor,
            hasMore
        }
    };
}