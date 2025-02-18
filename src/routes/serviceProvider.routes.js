import { Router } from "express";
import { asyncHandler } from "../utils/asyncWrapper.js";
const router = Router();
import {createServiceProvider,getServiceProviders,editServiceProvider,deleteServiceProvider } from "../controllers/serviceprovider.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../core/config/multer.js";
//LandLord Routes........................................................

router.post("/register", asyncHandler(createServiceProvider));
router.put("/edit", asyncHandler(editServiceProvider));
router.patch("/delete", asyncHandler(deleteServiceProvider));
router.get("/getServiceProviders", asyncHandler(getServiceProviders));

export default router;
