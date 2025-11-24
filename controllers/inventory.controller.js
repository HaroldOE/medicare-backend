import { Inventory } from "../models/inventory.model.js";

export const InventoryController = {
  // CREATE
  async create(req, res) {
    try {
      const id = await Inventory.create(req.body);
      res.status(201).json({ message: "Inventory created", inventory_id: id });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to create inventory record",
        error: error.message,
      });
    }
  },

  // GET ALL
  async getAll(req, res) {
    try {
      const data = await Inventory.findAll();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory records" });
    }
  },

  // GET BY ID
  async getById(req, res) {
    try {
      const record = await Inventory.findById(req.params.id);

      if (!record) {
        return res.status(404).json({ error: "Inventory record not found" });
      }

      res.json(record);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory record" });
    }
  },

  // UPDATE
  async update(req, res) {
    try {
      const result = await Inventory.update(req.params.id, req.body);

      if (!result) {
        return res.status(404).json({ error: "Inventory record not found" });
      }

      res.json({ message: "Inventory updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update inventory record" });
    }
  },

  // DELETE
  async delete(req, res) {
    try {
      const result = await Inventory.delete(req.params.id);

      if (!result) {
        return res.status(404).json({ error: "Inventory record not found" });
      }

      res.json({ message: "Inventory deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete inventory record" });
    }
  },
};
