import { Router } from "express";
import { asyncHandler } from "../utils/asyncWrapper.js";
const router = Router();
import { createAgent ,editAgent, agentLogin} from "../controllers/agent.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

router.post("/create",authMiddleware, asyncHandler(createAgent));
router.post("/login", asyncHandler(agentLogin));
router.patch("/edit/:id", asyncHandler(editAgent));
// router.post("/login", asyncHandler(userLogin));

export default router;