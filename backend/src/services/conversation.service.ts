import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../lib/error.js";
import { sendToUser } from "../websocket/websocket.manager.js";

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
            status: true,
        },
    });

    if (!listing) throw new AppError("Listing Not Found", 404);

    if (listing.sellerId == buyerId) {
        throw new AppError("You cannot start a conversation with yourself", 400);
    }

    if (listing.status === "SOLD") {
        throw new AppError("This listing is already sold", 400);
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
            sellerId: listing.sellerId,

            participants: {
                create: [
                    { userId: buyerId },
                    { userId: listing.sellerId },
                ],
            },
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

    const recipientId = conversation.buyerId === senderId ? conversation.sellerId : conversation.buyerId;

    const result = await prisma.$transaction(async (tx) => {
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

        const notification = await tx.notification.create({
            data: {
                message: "You have a new message",
                userId: recipientId,
                conversationId: conversation.id
            }
        });

        await tx.conversation.update({
            where: {
                id: conversation.id,
            },
            data: {
                updatedAt: new Date(),
            },
        });

        return { message, notification };
    });

    sendToUser(recipientId, { type: "message:new", data: result.message });
    sendToUser(recipientId, { type: "notification:new", data: result.notification });

    return result.message;
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
            participants: {
                select: {
                    userId: true,
                    lastReadSequence: true,
                },
            },
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

    // Extract read sequences for both participants
    const userParticipant = conversation.participants.find(p => p.userId === userId);
    const peerParticipant = conversation.participants.find(p => p.userId !== userId);

    return {
        messages, pagination: {
            nextCursor: messages.length > 0 ? messages[0]?.sequence : null, hasMore
        },
        userLastReadSequence: userParticipant?.lastReadSequence ?? 0,
        peerLastReadSequence: peerParticipant?.lastReadSequence ?? 0,
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
            messageSequence: true,

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

            participants: {
                where: {
                    userId,
                },

                select: {
                    lastReadSequence: true,
                }
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

    const unreadFilters: Prisma.MessageWhereInput[] = [];

    for (const conversation of conversations) {
        const participant = conversation.participants[0];

        if (!participant) {
            continue;
        }

        if (conversation.messageSequence > participant.lastReadSequence) {
            unreadFilters.push({
                conversationId: conversation.id,
                sequence: {
                    gt: participant.lastReadSequence,
                },
                senderId: {
                    not: userId,
                },
            });
        }
    }

    const unreadCountMap = new Map<string, number>();

    if (unreadFilters.length > 0) {
        const unreadCounts = await prisma.message.groupBy({
            by: ["conversationId"],
            where: {
                OR: unreadFilters,
            },
            _count: {
                _all: true,
            },
        });

        for (const item of unreadCounts) {
            unreadCountMap.set(item.conversationId, item._count._all);
        }
    }

    const result = conversations.map((conversation) => {
        const otherUser = conversation.buyer.id === userId ? conversation.seller : conversation.buyer;

        return {
            id: conversation.id,
            listing: conversation.listing,
            otherUser,
            lastMessage: conversation.messages[0] ?? null,
            unreadCount: unreadCountMap.get(conversation.id) ?? 0,
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

export async function markConversationRead(conversationId: string, userId: string, lastReadSequence: number) {
    const conversation = await prisma.conversation.findUnique({
        where: {
            id: conversationId,
        },
        select: {
            id: true,
            messageSequence: true,
            sellerId: true,
            buyerId: true
        },
    });

    if (!conversation) {
        throw new AppError("Conversation not found", 404);
    }

    const participant = await prisma.conversationParticipant.findUnique({
        where: {
            conversationId_userId: {
                conversationId: conversation.id,
                userId,
            },
        },

        select: {
            id: true,
            lastReadSequence: true,
        },
    });

    if (!participant) {
        throw new AppError("You are not a participant in this conversation", 403);
    }

    if (lastReadSequence > conversation.messageSequence) {
        throw new AppError("Cannot mark messages as read before they exist", 400);
    }

    if (lastReadSequence < participant.lastReadSequence) {
        throw new AppError("Read sequence cannot move backwards", 400,);
    }

    if (lastReadSequence === participant.lastReadSequence) {
        return;
    }

    const updatedParticipant = await prisma.conversationParticipant.update({
        where: {
            id: participant.id,
        },

        data: {
            lastReadSequence
        },
    });

    const otherUserId = conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId;

    sendToUser(otherUserId, { type: "conversation:read", data: { conversationId, lastReadSequence } });

    return updatedParticipant;
}

export async function getConversationById(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
        where: {
            id: conversationId,
        },
        select: {
            id: true,
            updatedAt: true,
            messageSequence: true,
            buyerId: true,
            sellerId: true,

            listing: {
                select: {
                    id: true,
                    title: true,
                    price: true,
                    status: true,
                },
            },

            buyer: {
                select: {
                    id: true,
                    name: true,
                    profileImageUrl: true,
                },
            },

            seller: {
                select: {
                    id: true,
                    name: true,
                    profileImageUrl: true,
                },
            },

            participants: {
                where: {
                    userId,
                },
                select: {
                    lastReadSequence: true,
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
                    createdAt: true,
                },
            },
        },
    });

    if (!conversation) {
        throw new AppError("Conversation not found", 404);
    }

    const isParticipant = conversation.buyerId === userId || conversation.sellerId === userId;
    if (!isParticipant) {
        throw new AppError("You are not a participant in this conversation", 403);
    }

    const participant = conversation.participants[0];
    let unreadCount = 0;

    if (participant && conversation.messageSequence > participant.lastReadSequence) {
        unreadCount = await prisma.message.count({
            where: {
                conversationId: conversation.id,
                sequence: {
                    gt: participant.lastReadSequence,
                },
                senderId: {
                    not: userId,
                },
            },
        });
    }

    const otherUser = conversation.buyer.id === userId ? conversation.seller : conversation.buyer;

    return {
        id: conversation.id,
        listing: conversation.listing,
        otherUser,
        lastMessage: conversation.messages[0] ?? null,
        unreadCount,
    };
}