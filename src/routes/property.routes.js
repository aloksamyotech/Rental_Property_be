import { Router } from "express";
import { asyncHandler } from "../utils/asyncWrapper.js";
const router = Router();
import { createProperty,editProperty,getProperty,deleteProperty,getVacantProperty,uploadProperty} from "../controllers/property.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../core/config/multer.js";
//LandLord Routes........................................................

router.post("/register", upload.array('files', 10), asyncHandler(createProperty));
router.put("/editproperty", asyncHandler(editProperty));
router.patch("/delete", asyncHandler(deleteProperty));
router.get("/getproperty", asyncHandler(getProperty));
router.get("/vacantproperty", asyncHandler(getVacantProperty));
// router.post('/upload', upload.array('files', 10), asyncHandler(uploadProperty))

export default router;
