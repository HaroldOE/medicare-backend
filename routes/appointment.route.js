// routes/appointmentRoutes.js
import express from "express";
import { AppointmentController } from "../controllers/appointment.controller.js";

const appointmentRouter = express.Router();

// BOOK APPOINTMENT
appointmentRouter.post("/", AppointmentController.create);

// GET ALL APPOINTMENTS FOR PATIENT
appointmentRouter.get(
  "/patient/:patientId",
  AppointmentController.getByPatient
);

// GET ALL APPOINTMENTS FOR DOCTOR
appointmentRouter.get("/doctor/:doctorId", AppointmentController.getByDoctor);

// UPDATE APPOINTMENT STATUS
appointmentRouter.put(
  "/status/:appointmentId",
  AppointmentController.updateStatus
);

export default appointmentRouter;
