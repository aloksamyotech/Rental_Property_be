import { Router } from "express";
import { asyncHandler } from "../utils/asyncWrapper.js";
const router = Router();
import { authMiddleware } from "../middlewares/auth.middleware.js";
//LandLord Routes........................................................
// import { userLogin,userRegistration } from "../controllers/user.controller.js";
import {companyRegistration, universalLogin, getAllCompany,editCompany, deleteCompany,commentAndResolved} from "../controllers/company.controller.js"

router.post("/register", asyncHandler(companyRegistration));
router.get("/getAllCompanies", asyncHandler(getAllCompany))
router.post("/login", asyncHandler(universalLogin));
router.put("/edit", asyncHandler(editCompany));
router.patch("/delete", asyncHandler(deleteCompany));

router.get("/getComplaints", asyncHandler(commentAndResolved));

export default router;
