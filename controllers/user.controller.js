import { User } from "../models/user.model.js";

export const userController = {
  create: async (req, res) => {
    try {
      const userId = await User.create(req.body);
      res.json({ message: "User created", userId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  findAll: async (req, res) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  findById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const affected = await User.update(req.params.id, req.body);
      res.json({ message: `${affected} record(s) updated` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const affected = await User.delete(req.params.id);
      res.json({ message: `${affected} record(s) deleted` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
