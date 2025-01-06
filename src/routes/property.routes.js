import { Router } from "express";
import { asyncHandler } from "../utils/asyncWrapper.js";
const router = Router();
import { createProperty,editProperty,getProperty,deleteProperty} from "../controllers/property.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
// import { deleteProperty } from "../services/property.services.js";

//LandLord Routes........................................................

router.post("/register", asyncHandler(createProperty));
router.put("/editproperty", asyncHandler(editProperty));
router.patch("/delete", asyncHandler(deleteProperty))
router.get("/getproperty", asyncHandler(getProperty));

export default router;