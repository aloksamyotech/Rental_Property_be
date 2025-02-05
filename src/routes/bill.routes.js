import { Router } from "express";
import { asyncHandler } from "../utils/asyncWrapper.js";
const router = Router();
import { authMiddleware } from "../middlewares/auth.middleware.js";

import { createbill} from "../controllers/booking.controller.js";



router.post("/createBill", asyncHandler(createbill));


export default router;

