import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { getMyProfile, updateMyProfile } from "../controllers/user.controller.js";
import { updateProfileSchema } from "../validators/user.validator.js";

const router = Router();

router.get("/me", requireAuth, getMyProfile);
router.patch("/me", requireAuth, validate(updateProfileSchema), updateMyProfile);

export default router;
