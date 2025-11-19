import express from "express";
import {
  createConsultation,
  getAllConsultations,
  getConsultationById,
  updateConsultation,
  deleteConsultation
} from "../controllers/consultation.controller.js";

const router = express.Router();

router.post("/", createConsultation);           // Create
router.get("/", getAllConsultations);          // Get all
router.get("/:id", getConsultationById);       // Get by ID
router.put("/:id", updateConsultation);        // Update
router.delete("/:id", deleteConsultation);     // Delete

export default router;
