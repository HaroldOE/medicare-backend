import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import { sendEmail } from "../core/email.js";
import { doctorsTemplate, patientTemplate } from "../models/email.templates.js";
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

export const userController = {
  create: async (req, res) => {
    try {
      const { email, password, role } = req.body;

      if (!email || !password || !role)
        return res
          .status(400)
          .json({ error: "Email, password, role, name required" });

      if (!["patient", "doctor"].includes(role.toLowerCase()))
        return res
          .status(400)
          .json({ error: "Role must be 'patient' or 'doctor'" });

      const existing = await User.findByEmail(email);
      if (existing)
        return res.status(409).json({ error: "Email already registered" });

      const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

      const user_id = await User.create({
        email,
        password: hashed,
        role: role.toLowerCase(),
      });

      // Load template
      const template =
        role === "doctor"
          ? doctorsTemplate.replace(/{{name}}/g, email)
          : patientTemplate.replace(/{{name}}/g, email);

      // Send email
      await sendEmail({
        to: email,
        subject: "Welcome to MediChain",
        html: template,
      });

      res.status(201).json({
        message: "User created",
        user: { user_id, email, role: role.toLowerCase() },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  findAll: async (req, res) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  findOne: async (req, res) => {
    try {
      const user_id = parseInt(req.params.id, 10);
      const user = await User.findById(user_id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  update: async (req, res) => {
    try {
      const user_id = parseInt(req.params.id, 10);
      if (req.user.user_id !== user_id)
        return res.status(403).json({ error: "Forbidden" });

      const updates = {};
      if (req.body.email) {
        const existing = await User.findByEmail(req.body.email);
        if (existing && existing.user_id !== user_id)
          return res.status(409).json({ error: "Email exists" });
        updates.email = req.body.email;
      }

      if (req.body.password)
        updates.password = await bcrypt.hash(
          req.body.password,
          BCRYPT_SALT_ROUNDS
        );
      if (req.body.role) updates.role = req.body.role;

      const affected = await User.update(user_id, updates);
      if (!affected) return res.status(400).json({ error: "No changes made" });

      const updated = await User.findById(user_id);
      res.json({ message: "Profile updated", user: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  delete: async (req, res) => {
    try {
      const user_id = parseInt(req.params.id, 10);
      if (req.user.user_id !== user_id)
        return res.status(403).json({ error: "Forbidden" });

      await User.delete(user_id);
      res.json({ message: "Account deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
