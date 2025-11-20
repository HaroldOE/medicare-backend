import express from "express";
import { TransactionsController } from "./transactions.controller.js";

const router = express.Router();

// Create
router.post("/", TransactionsController.create);

// Get All
router.get("/", TransactionsController.getAll);

// Get One
router.get("/:id", TransactionsController.getById);

// Update
router.put("/:id", TransactionsController.update);

// Delete
router.delete("/:id", TransactionsController.delete);

export default router;
