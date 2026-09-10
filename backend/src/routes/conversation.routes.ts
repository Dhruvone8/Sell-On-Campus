import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createConversation, createMessage } from "../controllers/conversation.controller.js";
import { createConversationSchema, createMessageSchema } from "../validators/conversation.validator.js";

const router = Router();

router.post("/", requireAuth, validate(createConversationSchema), createConversation);
router.post("/:conversationId/messages", requireAuth, validate(createMessageSchema), createMessage);

export default router;