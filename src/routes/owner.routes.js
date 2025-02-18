import { Router } from "express";
import { asyncHandler } from "../utils/asyncWrapper.js";
const router = Router();

//LandLord Routes........................................................
import {
  ownerLogin,
  ownerRegistration,
  getAllOwner,
  editOwner,
  deleteOwner
} from "../controllers/owner.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

router.post("/register", asyncHandler(ownerRegistration));
router.get("/getAllOwner", asyncHandler(getAllOwner));
router.post("/login", asyncHandler(ownerLogin));
router.put("/edit", asyncHandler(editOwner) );
router.patch("/delete", asyncHandler(deleteOwner));

export default router;
