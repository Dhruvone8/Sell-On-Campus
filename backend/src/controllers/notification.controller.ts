import type { Request, Response } from 'express';
import { AppError } from "../lib/error.js";
import { getUserNotifications as getUserNotificationsService } from '../services/notification.service.js';

export async function getUserNotifications(req: Request, res: Response) {
    const userId = req.userId;

    if (!userId) {
        throw new AppError("Unauthenticated", 401)
    }

    const { limit, cursor } = res.locals.validatedQuery;

    const result = getUserNotificationsService(userId, limit, cursor);

    return res.status(200).json(result);
}