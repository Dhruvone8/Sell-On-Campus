import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate, validateQuery } from "../middleware/validate.middleware.js";
import {
    createConversation, createMessage, getConversationMessages, getUserConversations
} from "../controllers/conversation.controller.js";
import {
    conversationMessagesQuerySchema, createConversationSchema, createMessageSchema, userConversationsQuerySchema
} from "../validators/conversation.validator.js";

const router = Router();

router.get("/", requireAuth, validateQuery(userConversationsQuerySchema), getUserConversations)
router.get("/:conversationId/messages", requireAuth, validateQuery(conversationMessagesQuerySchema), getConversationMessages)
router.post("/", requireAuth, validate(createConversationSchema), createConversation);
router.post("/:conversationId/messages", requireAuth, validate(createMessageSchema), createMessage);

export default router;