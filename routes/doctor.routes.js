import express from "express";
import { DoctorController } from "../controllers/doctor.controller.js";

const doctorsRouter = express.Router();

doctorsRouter.post("/", DoctorController.create); // Create doctor
doctorsRouter.get("/", DoctorController.findAll); // Get all doctors
doctorsRouter.get("/:id", DoctorController.findById); // Get doctor by ID
doctorsRouter.put("/:id", DoctorController.update); // Update doctor
doctorsRouter.delete("/:id", DoctorController.delete); // Delete doctor

export default doctorsRouter;
