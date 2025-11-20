import { Transactions } from "./transactions.model.js";

export const TransactionsController = {
  // Create
  async create(req, res) {
    try {
      const id = await Transactions.create(req.body);
      res.status(201).json({ message: "Transaction created", id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create transaction" });
    }
  },

  // Get all
  async getAll(req, res) {
    try {
      const data = await Transactions.findAll();
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  },

  // Get by ID
  async getById(req, res) {
    try {
      const data = await Transactions.findById(req.params.id);
      if (!data) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch transaction" });
    }
  },

  // Update
  async update(req, res) {
    try {
      const affected = await Transactions.update(req.params.id, req.body);
      if (!affected) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json({ message: "Transaction updated" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update transaction" });
    }
  },

  // Delete
  async delete(req, res) {
    try {
      const affected = await Transactions.delete(req.params.id);
      if (!affected) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json({ message: "Transaction deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  },
};
