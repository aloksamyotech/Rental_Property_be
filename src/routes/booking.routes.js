import { Router } from "express";
import { asyncHandler } from "../utils/asyncWrapper.js";
const router = Router();
import { createAgent ,editAgent, agentLogin} from "../controllers/agent.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
// import { createBooking } from "../services/booking.services.js";
import { createBooking, getAllBooking,editBooking,getBooking ,getBookingById} from "../controllers/booking.controller.js";


router.post("/create", asyncHandler(createBooking));
router.put("/editBooking", asyncHandler(editBooking));
router.get("/getBooking", asyncHandler(getBooking));
router.get("/allBooking", asyncHandler(getAllBooking));
router.get("/getBookingById", asyncHandler(getBookingById));

export default router;

