import type { Request, Response } from "express";
import { AppError } from "../lib/error.js";
import { saveSubscription, removeSubscription } from "../services/push.service.js";

// 1. Return the VAPID Public key to the frontend
export async function getVapidPublicKey(_req: Request, res: Response) {
    const publicKey = process.env.VAPID_PUBLIC_KEY

    if (!publicKey) {
        throw new AppError("Push notifications are not configured on the server", 500);
    }

    return res.status(200).json({ publicKey });
}

// Save the browser's subscription for the logged-in user
export async function subscribeToPush(req: Request, res: Response) {
    const userId = req.userId;

    if (!userId) {
        throw new AppError("UnAuthenticated", 401);
    }

    const { endpoint, keys } = req.body;

    await saveSubscription(userId, { endpoint, keys });

    return res.status(201).json({ message: "Push Subscription registered successfully" })
}

// Remoce the browser's subscription
export async function unsubscribeFromPush(req: Request, res: Response) {
    const userId = req.userId;

    if (!userId) {
        throw new AppError("UnAuthenticated", 401);
    }

    const { endpoint } = req.body;

    await removeSubscription(endpoint, userId);

    return res.status(200).json({ message: "Push Subscription removed successfully" })
}