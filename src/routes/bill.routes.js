import { Router } from "express";
import { asyncHandler } from "../utils/asyncWrapper.js";
const router = Router();
import { authMiddleware } from "../middlewares/auth.middleware.js";

import { createbill,getAllBill,getBillForT,getBillById,reporterDetails,changeBillStatus,deleteBill,getBillByCreaterBy} from "../controllers/bill.controller.js";



router.post("/createBill", asyncHandler(createbill));
router.post("/reporterDetails", asyncHandler(reporterDetails));
router.get("/getAllBill", asyncHandler(getAllBill));
router.get("/getBillForT", asyncHandler(getBillForT));
router.patch("/changeBillStatus", asyncHandler(changeBillStatus));
router.get("/getBillById", asyncHandler(getBillById));
router.patch("/DeleteBill", asyncHandler(deleteBill));
router.get("/getBillByAgentId", asyncHandler(getBillByCreaterBy));




export default router;

