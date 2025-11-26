import express from "express";
import{medicineController} from "../Controller/medicine.controller.js";
const medicineRouter = express.Router();

medicineRouter.post("/", medicineController.create );
