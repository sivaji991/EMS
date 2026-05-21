import {Router} from "express";
import {protect, protectAdmin} from"../middleware/auth.js";
import { createPayslip, getPayslip, getPayslipById,deletePayslip } from "../controllers/payslipController.js";

const payslipRouter = Router();

payslipRouter.post("/", protect, protectAdmin, createPayslip );
payslipRouter.get("/", protect, getPayslip );
payslipRouter.get("/:id", protect, getPayslipById );
payslipRouter.delete("/:id",protect,protectAdmin,deletePayslip)

export default payslipRouter;


