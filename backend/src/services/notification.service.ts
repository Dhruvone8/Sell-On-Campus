import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/error.js";
import { paginationSchema } from "../validators/listing.validator.js";

function encodeNotificationCursor(createdAt: Date, id: string) {
    return Buffer.from(
        JSON.stringify({
            createdAt: createdAt.toISOString(),
            id,
        }),
    ).toString("base64url");
}

function decodeNotificationCursor(cursor: string) {
    try {
        const decoded = JSON.parse(
            Buffer.from(cursor, "base64url").toString("utf-8"),
        );

        if (typeof decoded.createdAt !== "string" || typeof decoded.id !== "string") {
            throw new Error();
        }

        const createdAt = new Date(decoded.createdAt);

        if (Number.isNaN(createdAt.getTime())) {
            throw new Error();
        }

        return {
            createdAt,
            id: decoded.id,
        };
    } catch {

        throw new AppError("Invalid notification cursor", 400);
    }
}

export async function getUserNotifications(userId: string, limit: number, cursor?: string) {
    const decodedCursor = cursor ? decodeNotificationCursor(cursor) : undefined;

    const notifications = await prisma.notification.findMany({
        where: {
            userId
        },

        orderBy: [
            { createdAt: "desc" },
            { id: "desc" },
        ],

        ...(decodedCursor ? {
            cursor: {
                createdAt_id: {
                    createdAt: decodedCursor.createdAt,
                    id: decodedCursor.id,
                },
            },
            skip: 1,
        } : {}),

        take: limit + 1,

        select: {
            id: true,
            message: true,
            isRead: true,
            conversationId: true,
            createdAt: true,
        },
    });

    const hasMore = notifications.length > limit;

    if (hasMore) {
        notifications.pop();
    }

    const nextNotification = notifications.length > 0 ? notifications[notifications.length - 1] : null;

    const nextCursor = hasMore && nextNotification ? encodeNotificationCursor(nextNotification.createdAt, nextNotification.id) : null

    return {
        notifications, pagination: {
            nextCursor, hasMore,
        },
    };
}