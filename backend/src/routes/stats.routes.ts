import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { recordVisitSchema } from "../validators/stats.validator.js";
import { getVisitors, recordVisit } from "../controllers/stats.controller.js";

const router = Router();

router.get("/visitors", getVisitors);
router.post("/visit", validate(recordVisitSchema), recordVisit);

export default router;
