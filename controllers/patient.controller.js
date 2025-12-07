import { Patient } from "../models/patient.model.js";
import { sendEmail } from "../core/email.js";
import bcrypt from "bcrypt";
// import jwt
import dotenv from "dotenv";
dotenv.config();

export const patientController = {
  async create(req, res) {
    try {
      const { name, email, phone, password } = req.body;

      console.log("Patient registration attempt:", req.body);

      // 1. Validate input
      if (!name || !email || !phone || !password) {
        return res.status(400).json({
          success: false,
          message: "All fields (name, email, phone, password) are required",
        });
      }

      // 2. Check if email already exists
      const existingUser = await Patient.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }

      // 3. Hash password
      const hashedPassword = await bcrypt.hash(
        password,
        Number(process.env.BCRYPT_SALT_ROUNDS)
      );

      // 4. Create patient in DB
      const patientId = await Patient.create({
        name,
        email,
        phone,
        password: hashedPassword,
      });

      // 5. Send welcome email
      await sendEmail({
        to: email,
        subject: "Welcome to MediCare!",
        html: `
        <h2>Hello ${name}!</h2>
        <p>Thank you for registering with <strong>MediCare</strong>.</p>
        <p>Your patient account has been created successfully.</p>
        <p>You can now book appointments, view doctors, and manage your health.</p>
        <br>
        <p>We’re so glad you’re here!</p>
        <p><strong>The MediCare Team</strong></p>
      `,
      });

      // 6. Return success (NO TOKEN HERE)
      return res.status(201).json({
        success: true,
        message: "Patient registered successfully",
        user: {
          patient_id: patientId,
          name,
          email,
          phone,
        },
      });
    } catch (error) {
      console.error("Patient registration error:", error);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Registration failed",
        error: error.message,
      });
    }
  },

  findAll: async (req, res) => {
    try {
      const patients = await Patient.findAll();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  findById: async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id);
      res.json(patient);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const affected = await Patient.update(req.params.id, req.body);
      res.json({ message: `${affected} record(s) updated` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const affected = await Patient.delete(req.params.id);
      res.json({ message: `${affected} record(s) deleted` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
