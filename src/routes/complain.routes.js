import { Router } from "express";
import { asyncHandler } from "../utils/asyncWrapper.js";
const router = Router();
import { authMiddleware } from "../middlewares/auth.middleware.js";
//LandLord Routes........................................................
// import { userLogin,userRegistration } from "../controllers/user.controller.js";
import { complainRegistration } from "../controllers/complaint.controller.js";

router.post("/register", asyncHandler(complainRegistration));


export default router;
