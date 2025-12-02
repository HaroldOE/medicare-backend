import express from "express";
import { TransactionsController } from "../controllers/transaction.controller.js";

const transactionRouter = express.Router();

// Create Transaction
transactionRouter.post("/", TransactionsController.create);

// Get All Transactions
transactionRouter.get("/", TransactionsController.getAll);

// Get Single Transaction
transactionRouter.get("/:id", TransactionsController.getById);

// Update Transaction
transactionRouter.put("/:id", TransactionsController.update);

// Delete Transaction
transactionRouter.delete("/:id", TransactionsController.delete);

export default transactionRouter;
