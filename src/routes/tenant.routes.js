import { Router } from "express";
import { asyncHandler } from "../utils/asyncWrapper.js";
const router = Router();

import { createTenant ,tenantLogin, getTenants, editTenant, getTenantsById, deleteTenantById,mybookings} from "../controllers/tenant.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
// import { userLogin,userRegistration } from "../controllers/user.controller.js";

router.post("/register", asyncHandler(createTenant));
router.get("/getTenants", asyncHandler(getTenants));
router.get("/getTenantById", asyncHandler(getTenantsById));
router.put("/editTenant", asyncHandler(editTenant));
router.post("/login", asyncHandler(tenantLogin));
router.patch("/delete", asyncHandler(deleteTenantById));
router.get("/mybooking", asyncHandler(mybookings))

export default router;