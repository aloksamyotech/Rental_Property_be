import { Router } from "express";
import { asyncHandler } from "../utils/asyncWrapper.js";
const router = Router();
import { createAgent ,editAgent, agentLogin, getAllAgent,deleteAgent} from "../controllers/agent.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
// import { deleteAgent } from "../services/agent.services.js";
// import { editAgent } from "../services/agent.services.js";
//LandLord Routes........................................................
// import { userLogin,userRegistration } from "../controllers/user.controller.js";

router.post("/register", asyncHandler(createAgent));
router.post("/login", asyncHandler(agentLogin));
router.put("/edit", asyncHandler(editAgent));
router.get("/getAllAgent", asyncHandler(getAllAgent));
router.patch("/delete", asyncHandler(deleteAgent));
// router.post("/login", asyncHandler(userLogin));

export default router;