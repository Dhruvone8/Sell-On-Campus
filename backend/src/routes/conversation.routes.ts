import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate, validateQuery } from "../middleware/validate.middleware.js";
import {
    createConversation, createMessage, getConversationMessages, getUserConversations, markConversationRead
} from "../controllers/conversation.controller.js";
import {
    conversationMessagesQuerySchema, createConversationSchema, createMessageSchema, userConversationsQuerySchema,
    markConversationReadSchema
} from "../validators/conversation.validator.js";
import { conversationRateLimiters } from "../utils/rate-limit.util.js";

const router = Router();

router.get("/", requireAuth, validateQuery(userConversationsQuerySchema), getUserConversations)
router.get("/:conversationId/messages", requireAuth, validateQuery(conversationMessagesQuerySchema), getConversationMessages)
router.post("/", requireAuth, validate(createConversationSchema), createConversation);
router.post("/:conversationId/messages", requireAuth, conversationRateLimiters.sendMessage, validate(createMessageSchema), createMessage);
router.patch("/:conversationId/read", requireAuth, validate(markConversationReadSchema), markConversationRead)

export default router;