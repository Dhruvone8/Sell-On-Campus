import type { Request, Response } from 'express';
import { AppError } from "../lib/error.js";
import { 
    getUserNotifications as getUserNotificationsService, 
    markNotificationRead as markNotificationReadService,
    markAllNotificationsRead as markAllNotificationsReadService
} from '../services/notification.service.js';

export async function getUserNotifications(req: Request, res: Response) {
    const userId = req.userId;

    if (!userId) {
        throw new AppError("Unauthenticated", 401)
    }

    const { limit, cursor } = res.locals.validatedQuery;

    const result = await getUserNotificationsService(userId, limit, cursor);

    return res.status(200).json(result);
}

export async function markNotificationRead(req: Request, res: Response) {
    const userId = req.userId;
    const { notificationId } = req.params;

    if (!userId) {
        throw new AppError("Unauthenticated", 401);
    }

    if (typeof notificationId !== "string") {
        throw new AppError("Invalid notification Id", 400);
    }

    await markNotificationReadService(notificationId, userId);

    return res.status(200).json({ message: "Notification marked as read" });
}

export async function markAllNotificationsRead(req: Request, res: Response) {
    const userId = req.userId;

    if (!userId) {
        throw new AppError("Unauthenticated", 401);
    }

    await markAllNotificationsReadService(userId);

    return res.status(200).json({ message: "All notifications marked as read" });
}