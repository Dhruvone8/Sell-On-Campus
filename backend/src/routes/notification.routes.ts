import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate, validateQuery } from "../middleware/validate.middleware.js";
import { notificationsQuerySchema, subscribePushSchema, unsubscribePushSchema } from "../validators/notification.validator.js";
import { getUserNotifications, markNotificationRead, markAllNotificationsRead } from "../controllers/notification.controller.js";
import { getVapidPublicKey, subscribeToPush, unsubscribeFromPush } from "../controllers/push.controller.js";

const router = Router();

// In-App Notifications
router.get("/", requireAuth, validateQuery(notificationsQuerySchema), getUserNotifications);
router.patch("/read-all", requireAuth, markAllNotificationsRead);
router.patch("/:notificationId/read", requireAuth, markNotificationRead);

// Web Push Notifications
router.get("/push/public-key", getVapidPublicKey);
router.post("/push/subscribe", requireAuth, validate(subscribePushSchema), subscribeToPush);
router.delete("/push/unsubscribe", requireAuth, validate(unsubscribePushSchema), unsubscribeFromPush);

export default router;