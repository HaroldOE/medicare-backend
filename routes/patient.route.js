import express from "express";
import { patientController } from "../controllers/patient.controller.js";

const patientRouter = express.Router();

patientRouter.post("/", patientController.create); // Create patient
patientRouter.get("/", patientController.findAll); // Get all patients
patientRouter.get("/:id", patientController.findById); // Get patient by ID
patientRouter.put("/:id", patientController.update); // Update patient
patientRouter.delete("/:id", patientController.delete); // Delete patient

export default patientRouter;
