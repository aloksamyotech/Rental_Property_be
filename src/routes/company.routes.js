import { Router } from "express";
import { asyncHandler } from "../utils/asyncWrapper.js";
const router = Router();
import { authMiddleware } from "../middlewares/auth.middleware.js";
//LandLord Routes........................................................
// import { userLogin,userRegistration } from "../controllers/user.controller.js";
import {companyRegistration, companyLogin, getAllCompany,editCompany, deleteCompany} from "../controllers/company.controller.js"

router.post("/register", asyncHandler(companyRegistration));
router.get("/getAllCompanies", asyncHandler(getAllCompany))
router.post("/login", asyncHandler(companyLogin));
router.put("/edit", asyncHandler(editCompany));
router.patch("/delete", asyncHandler(deleteCompany));

export default router;
