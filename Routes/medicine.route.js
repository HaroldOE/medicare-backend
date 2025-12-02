import express from "express";
import { 
  deleteMedicineController, 
  findAllMedicineController, 
  getMedicineByIdController, 
  medicineController, 
  updateMedicineController 
} from "../Controller/medicine.controller.js";

const medicineRouter = express.Router();

// Create new medicine
medicineRouter.post("/", medicineController );

// Get all medicines
medicineRouter.get("/", findAllMedicineController );

// Get medicine by ID
medicineRouter.get("/:id", getMedicineByIdController );

// Update medicine by ID
medicineRouter.put("/:id", updateMedicineController );

// Delete medicine by ID
medicineRouter.delete("/:id", deleteMedicineController );

export default medicineRouter;
