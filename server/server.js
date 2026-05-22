import express from "express";
import cors from "cors";
import "dotenv/config"
import multer from "multer";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import employeesRouter from "./routes/employeeRoutes.js";

import profileRouter from "./routes/profileRoutes.js";
import attendanceRouter from "./routes/attendanceRoutes.js";

import leaveRouter from "./routes/leaveRoutes.js";

import payslipRouter from "./routes/payslipsRoutes.js";

import dashboardRouter from "./routes/dashboardRoutes.js";


import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"


const app = express();
const PORT = process.env.PORT || 4000;

//Middleware
// app.use(cors())
// app.use(cors({
//   origin: [
//     "http://localhost:5173",
//     "https://sivaji-ems.vercel.app",
//     "https://ems-7svt.onrender.com",
//     "https://ems-k8gdx34en-sivaji-avulamandas-projects.vercel.app",
//   ],
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));
app.use(cors({
  origin: function(origin, callback){

    if(!origin) return callback(null, true);

    if(
      origin.includes("localhost") ||
      origin.includes("vercel.app")
    ){
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },

  credentials: true
}));
app.use(express.json())
app.use(multer().none())

//Routes
app.get("/",(req,res)=>res.send("Server is running."))
app.use("/api/auth", authRouter)
app.use("/api/employees", employeesRouter)

app.use("/api/profile", profileRouter)
app.use("/api/attendance", attendanceRouter )

app.use("/api/leave", leaveRouter )
app.use("/api/payslips", payslipRouter )

app.use("/api/dashboard", dashboardRouter )

app.use("/api/inngest", serve({ client: inngest, functions }));

await connectDB()

app.listen(PORT,()=>console.log(`Sever running on PORT ${PORT}`))

