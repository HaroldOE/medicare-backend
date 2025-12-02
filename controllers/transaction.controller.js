import { Transaction } from "../models/transaction.model.js";

export const TransactionsController = {
  async create(req, res) {
    try {
      const id = await Transaction.create(req.body);
      res.status(201).json({ message: "Transaction created", id });
    } catch (error) {
      console.error("Create transaction error:", error);
      res.status(500).json({
        message: "Failed to create transaction",
        error: error.message,
      });
    }
  },

  async getAll(req, res) {
    try {
      const data = await Transaction.findAll();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  },

  async getById(req, res) {
    try {
      const item = await Transaction.findById(req.params.id);
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  },

  async update(req, res) {
    try {
      const affected = await Transaction.update(req.params.id, req.body);
      if (!affected)
        return res.status(404).json({ message: "Transaction not found" });

      res.json({ message: "Transaction updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update transaction" });
    }
  },

  async delete(req, res) {
    try {
      const affected = await Transaction.delete(req.params.id);
      if (!affected)
        return res.status(404).json({ message: "Transaction not found" });

      res.json({ message: "Transaction deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  },
};
