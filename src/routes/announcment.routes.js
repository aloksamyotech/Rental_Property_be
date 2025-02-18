import { Router } from "express";
import { asyncHandler } from "../utils/asyncWrapper.js";
const router = Router();
import { authMiddleware } from "../middlewares/auth.middleware.js";

import {createAnnouncement, getAllAnnouncement,editAnnouncement, deleteAnnounment } from "../controllers/announcement.controller.js";



router.post("/create", asyncHandler(createAnnouncement));
router.get("/getAllAnnouncement", asyncHandler(getAllAnnouncement));
router.put("/editAnnouncement", asyncHandler(editAnnouncement));
router.patch("/editAnnouncement", asyncHandler(deleteAnnounment));


export default router;

