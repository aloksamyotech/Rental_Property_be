import { Router } from "express";
import { asyncHandler } from "../utils/asyncWrapper.js";
const router = Router();
import { authMiddleware } from "../middlewares/auth.middleware.js";
//LandLord Routes........................................................
// import { userLogin,userRegistration } from "../controllers/user.controller.js";
import { complainRegistration,allComplain ,editComplain,deleteComplain} from "../controllers/complaint.controller.js";

router.post("/register", asyncHandler(complainRegistration));
router.get("/allComplain", asyncHandler(allComplain));
router.put("/editComplain", asyncHandler(editComplain));
router.patch("/delete", asyncHandler(deleteComplain));


export default router;
