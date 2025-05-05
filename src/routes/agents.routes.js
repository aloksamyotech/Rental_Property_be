import { Router } from "express";
import { asyncHandler } from "../utils/asyncWrapper.js";
const router = Router();
import { createAgent ,editAgent, agentLogin, getAllAgent,deleteAgent,getAgentById,changePassword} from "../controllers/agent.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

router.post("/register", asyncHandler(createAgent));
router.post("/login", asyncHandler(agentLogin));
router.put("/edit", asyncHandler(editAgent));
router.get("/getAllAgent", asyncHandler(getAllAgent));
router.patch("/delete", asyncHandler(deleteAgent));
router.get("/getAgentById", asyncHandler(getAgentById));
router.patch("/changePassword",asyncHandler(changePassword));

export default router;