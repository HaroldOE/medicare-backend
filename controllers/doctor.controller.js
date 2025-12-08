// import { Doctor } from "../models/doctor.model.js";

// // import { Doctor } from "../models/doctor.model.js";
// import { User } from "../models/user.model.js"; // assumes you have User model
// import bcrypt from "bcrypt";
// import { sendEmail } from "../core/email.js";

// const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
// export const DoctorController = {
//   // Create a doctor
//   async create(req, res) {
//     try {
//       const {
//         name,
//         email,
//         specialization,
//         license,
//         availability,
//         dob,
//         phone_number,
//         location,
//         rating,
//         password,
//       } = req.body;
//       console.log(req.body);
//       if (!name || !email || !password || !dob) {
//         return res
//           .status(400)
//           .json({ error: "Name, email, password, and DOB are required" });
//       }

//       // 1️⃣ Check if user already exists
//       const existingUser = await User.findByEmail(email);
//       if (existingUser) {
//         return res.status(409).json({ error: "Email already registered" });
//       }

//       // 2️⃣ Create the user
//       const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
//       const userId = await User.create({
//         name,
//         email,
//         password: hashedPassword,
//         role: "doctor",
//       });

//       // 3️⃣ Create doctor record
//       const doctorId = await Doctor.create({
//         name,
//         email,
//         specialization,
//         license,
//         availability,
//         dob,
//         phone_number,
//         location,
//         rating: rating ?? 0,
//         password,
//         user_id: userId, // optional if you want to store link
//       });

//       // 4️⃣ Optional: send welcome email
//       await sendEmail({
//         to: email,
//         subject: "Welcome to MediCare",
//         html: `<p>Hello Dr. ${name},</p>
//                <p>Your account has been created successfully.</p>
//                <p>Email: ${email}</p>
//                <p>Please keep your password safe.</p>`,
//       });

//       res.status(201).json({
//         success: true,
//         message: "Doctor created successfully",
//         doctorId,
//         userId,
//       });
//     } catch (error) {
//       console.error("Error creating doctor:", error);
//       res.status(500).json({ success: false, error: error.message });
//     }
//   },

//   // Get all doctors
//   async findAll(req, res) {
//     try {
//       const doctors = await Doctor.findAll();
//       res.json(doctors);
//     } catch (error) {
//       console.error("Error fetching doctors:", error);
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Get doctor by ID
//   async findById(req, res) {
//     try {
//       const doctor = await Doctor.findById(req.params.id);
//       if (!doctor) return res.status(404).json({ message: "Doctor not found" });
//       res.json(doctor);
//     } catch (error) {
//       console.error("Error fetching doctor:", error);
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Update doctor
//   async update(req, res) {
//     try {
//       const affected = await Doctor.update(req.params.id, req.body);
//       res.json({ message: `${affected} record(s) updated` });
//     } catch (error) {
//       console.error("Error updating doctor:", error);
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Delete doctor
//   async delete(req, res) {
//     try {
//       const affected = await Doctor.delete(req.params.id);
//       res.json({ message: `${affected} record(s) deleted` });
//     } catch (error) {
//       console.error("Error deleting doctor:", error);
//       res.status(500).json({ error: error.message });
//     }
//   },
// };

import { Doctor } from "../models/doctor.model.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../core/email.js";

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

export const DoctorController = {
  // CREATE DOCTOR
  async create(req, res) {
    try {
      const {
        name,
        email,
        password,
        dob,
        specialization,
        license,
        availability = "Available",
        phone_number,
        location, // ← can be undefined → will be saved as NULL
        rating,
      } = req.body;

      // Required fields
      if (!name || !email || !password || !dob) {
        return res.status(400).json({
          success: false,
          error: "Name, email, password, and date of birth are required",
        });
      }

      // 1. Check if email already exists (in Users or Doctors)
      const existingUser = await User.findByEmail(email);
      const existingDoctor = await Doctor.findByEmail(email);
      if (existingUser || existingDoctor) {
        return res.status(409).json({
          success: false,
          error: "Email already registered",
        });
      }

      // 2. Hash password
      const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

      // 3. Create User first (optional but recommended)
      const userId = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "doctor",
      });

      // 4. Create Doctor — model auto-generates doctor_id (D001, D002...)
      const { doctor_id } = await Doctor.create({
        name,
        email,
        password: hashedPassword, // store hashed password in Doctors too (for login)
        dob,
        specialization: specialization || null,
        license: license || null,
        availability,
        phone_number: phone_number || null,
        location: location || null, // ← safely handles missing location → NULL
        rating: rating ?? 0.0,
        // user_id: userId,              // ← uncomment if you want to link
      });

      // 5. Send welcome email
      try {
        await sendEmail({
          to: email,
          subject: "Welcome to MediCare – Doctor Account Created",
          html: `
            <h2>Welcome, Dr. ${name}!</h2>
            <p>Your doctor account has been successfully created.</p>
            <p><strong>Doctor ID:</strong> ${doctor_id}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p>You can now log in to the doctor portal.</p>
            <p>Thank you for joining MediCare!</p>
          `,
        });
      } catch (emailErr) {
        console.warn("Welcome email failed (non-critical):", emailErr);
      }

      res.status(201).json({
        success: true,
        message: "Doctor created successfully",
        data: {
          doctor_id,
          userId,
          name,
          email,
        },
      });
    } catch (error) {
      console.error("Error creating doctor:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  },

  // GET ALL DOCTORS
  async findAll(req, res) {
    try {
      const doctors = await Doctor.findAll();
      res.json({
        success: true,
        count: doctors.length,
        data: doctors,
      });
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET DOCTOR BY doctor_id (D001, D002...)
  async findById(req, res) {
    try {
      const { id } = req.params; // this is doctor_id like "D005"
      const doctor = await Doctor.findById(id);

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      res.json({ success: true, data: doctor });
    } catch (error) {
      console.error("Error fetching doctor:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // UPDATE DOCTOR
  async update(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Prevent updating doctor_id
      delete updates.doctor_id;
      delete updates.id;

      const affected = await Doctor.update(id, updates);

      if (affected === 0) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found or no changes made",
        });
      }

      res.json({
        success: true,
        message: "Doctor updated successfully",
      });
    } catch (error) {
      console.error("Error updating doctor:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // DELETE DOCTOR
  async delete(req, res) {
    try {
      const { id } = req.params;
      const affected = await Doctor.delete(id);

      if (affected === 0) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      res.json({
        success: true,
        message: "Doctor deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting doctor:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // SET AVAILABILITY STATUS
  async setAvailability(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["Available", "Busy", "On Leave"].includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Invalid status. Use: Available, Busy, or On Leave",
        });
      }

      const affected = await Doctor.setAvailability(id, status);
      if (affected === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Doctor not found" });
      }

      res.json({ success: true, message: `Status updated to ${status}` });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

export default DoctorController;
