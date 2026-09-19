import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateQuery } from "../middleware/validate.middleware.js";
import { notificationsQuerySchema } from "../validators/notification.validator.js";
import { getUserNotifications, markNotificationRead } from "../controllers/notification.controller.js";

const router = Router();

router.get("/", requireAuth, validateQuery(notificationsQuerySchema), getUserNotifications);
router.patch("/:notificationId/read", requireAuth, markNotificationRead)

export default router;