import express from "express";
import {
  createConsultation,
  getAllConsultations,
  getConsultationById,
  updateConsultation,
  deleteConsultation
} from "../controllers/consultation.controller.js";

const consultationRouter = express.Router();

consultationRouter.post("/", createConsultation);           // Create
consultationRouter.get("/", getAllConsultations);          // Get all
consultationRouter.get("/:id", getConsultationById);       // Get by ID
consultationRouter.put("/:id", updateConsultation);        // Update
consultationRouter.delete("/:id", deleteConsultation);     // Delete

export default consultationRouter;
