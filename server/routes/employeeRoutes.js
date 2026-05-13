import {Router} from "express";
import { 
  getEmployees, 
  createEmployee, 
  updateEmployee,
  deleteEmployee
 } from "../controllers/employeeController";
 import { protect, protectAdmin } from "../middleware/auth";

const employeesRouter = Router();

employeesRouter.get("/", protect, protectAdmin , getEmployees)
employeesRouter.post("/",protect, protectAdmin , createEmployee)
employeesRouter.put("/:id",protect, protectAdmin , updateEmployee)
employeesRouter.delete("/",protect, protectAdmin , deleteEmployee)

export default employeesRouter;
