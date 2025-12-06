import { Doctor } from "../models/doctor.model.js";

// import { Doctor } from "../models/doctor.model.js";
import { User } from "../models/user.model.js"; // assumes you have User model
import bcrypt from "bcrypt";
import { sendEmail } from "../core/email.js";

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
export const DoctorController = {
  // Create a doctor
  async create(req, res) {
    try {
      const {
        name,
        email,
        specialization,
        license,
        availability,
        dob,
        phone_number,
        location,
        rating,
        password,
      } = req.body;
      console.log(req.body);
      if (!name || !email || !password || !dob) {
        return res
          .status(400)
          .json({ error: "Name, email, password, and DOB are required" });
      }

      // 1️⃣ Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "Email already registered" });
      }

      // 2️⃣ Create the user
      const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
      const userId = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "doctor",
      });

      // 3️⃣ Create doctor record
      const doctorId = await Doctor.create({
        name,
        email,
        specialization,
        license,
        availability,
        dob,
        phone_number,
        location,
        rating: rating ?? 0,
        password,
        user_id: userId, // optional if you want to store link
      });

      // 4️⃣ Optional: send welcome email
      await sendEmail({
        to: email,
        subject: "Welcome to MediCare",
        html: `<p>Hello Dr. ${name},</p>
               <p>Your account has been created successfully.</p>
               <p>Email: ${email}</p>
               <p>Please keep your password safe.</p>`,
      });

      res.status(201).json({
        message: "Doctor created successfully",
        doctorId,
        userId,
      });
    } catch (error) {
      console.error("Error creating doctor:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all doctors
  async findAll(req, res) {
    try {
      const doctors = await Doctor.findAll();
      res.json(doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get doctor by ID
  async findById(req, res) {
    try {
      const doctor = await Doctor.findById(req.params.id);
      if (!doctor) return res.status(404).json({ message: "Doctor not found" });
      res.json(doctor);
    } catch (error) {
      console.error("Error fetching doctor:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update doctor
  async update(req, res) {
    try {
      const affected = await Doctor.update(req.params.id, req.body);
      res.json({ message: `${affected} record(s) updated` });
    } catch (error) {
      console.error("Error updating doctor:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete doctor
  async delete(req, res) {
    try {
      const affected = await Doctor.delete(req.params.id);
      res.json({ message: `${affected} record(s) deleted` });
    } catch (error) {
      console.error("Error deleting doctor:", error);
      res.status(500).json({ error: error.message });
    }
  },
};
