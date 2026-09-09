import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createConversation } from "../controllers/conversation.controller.js";
import { createConversationSchema } from "../validators/conversation.validator.js";

const router = Router();

router.post("/", requireAuth, validate(createConversationSchema), createConversation);

export default router;