// import { Patient } from "../models/patient.model.js";
// import { sendEmail } from "../core/email.js";
// import bcrypt from "bcrypt";
// // import jwt
// import dotenv from "dotenv";
// dotenv.config();

// export const patientController = {
//   async create(req, res) {
//     try {
//       const { name, email, phone, password } = req.body;

//       console.log("Patient registration attempt:", req.body);

//       // 1. Validate input
//       if (!name || !email || !phone || !password) {
//         return res.status(400).json({
//           success: false,
//           message: "All fields (name, email, phone, password) are required",
//         });
//       }

//       // 2. Check if email already exists
//       const existingUser = await Patient.findByEmail(email);
//       if (existingUser) {
//         return res.status(409).json({
//           success: false,
//           message: "Email already registered",
//         });
//       }

//       // 3. Hash password
//       const hashedPassword = await bcrypt.hash(
//         password,
//         Number(process.env.BCRYPT_SALT_ROUNDS)
//       );

//       // 4. Create patient in DB
//       const patientId = await Patient.create({
//         name,
//         email,
//         phone,
//         password: hashedPassword,
//       });

//       // 5. Send welcome email
//       await sendEmail({
//         to: email,
//         subject: "Welcome to MediCare!",
//         html: `
//         <h2>Hello ${name}!</h2>
//         <p>Thank you for registering with <strong>MediCare</strong>.</p>
//         <p>Your patient account has been created successfully.</p>
//         <p>You can now book appointments, view doctors, and manage your health.</p>
//         <br>
//         <p>We’re so glad you’re here!</p>
//         <p><strong>The MediCare Team</strong></p>
//       `,
//       });

//       // 6. Return success (NO TOKEN HERE)
//       return res.status(201).json({
//         success: true,
//         message: "Patient registered successfully",
//         user: {
//           patient_id: patientId,
//           name,
//           email,
//           phone,
//         },
//       });
//     } catch (error) {
//       console.error("Patient registration error:", error);

//       if (error.code === "ER_DUP_ENTRY") {
//         return res.status(409).json({
//           success: false,
//           message: "Email already in use",
//         });
//       }

//       return res.status(500).json({
//         success: false,
//         message: "Registration failed",
//         error: error.message,
//       });
//     }
//   },

//   findAll: async (req, res) => {
//     try {
//       const patients = await Patient.findAll();
//       res.json(patients);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   findById: async (req, res) => {
//     try {
//       const patient = await Patient.findById(req.params.id);
//       res.json(patient);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   update: async (req, res) => {
//     try {
//       const affected = await Patient.update(req.params.id, req.body);
//       res.json({ message: `${affected} record(s) updated` });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   delete: async (req, res) => {
//     try {
//       const affected = await Patient.delete(req.params.id);
//       res.json({ message: `${affected} record(s) deleted` });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },
// };

import { Patient } from "../models/patient.model.js";
import { sendEmail } from "../core/email.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

export const patientController = {
  // CREATE PATIENT
  async create(req, res) {
    try {
      const {
        name,
        email,
        phone,
        password,
        dob, // optional
        location, // optional → saved as NULL if missing
        medical_history, // optional
      } = req.body;

      console.log("Patient registration attempt:", { name, email, phone });

      // 1. Required fields validation
      if (!name || !email || !phone || !password) {
        return res.status(400).json({
          success: false,
          message: "Name, email, phone, and password are required",
        });
      }

      // 2. Check if email already exists
      const existingPatient = await Patient.findByEmail(email);
      if (existingPatient) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }

      // 3. Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // 4. Create patient — model auto-generates patient_id (P001, P002...)
      const { patient_id } = await Patient.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: hashedPassword,
        dob: dob || null,
        location: location || null,
        medical_history: medical_history || null,
      });

      // 5. Send welcome email
      try {
        await sendEmail({
          to: email,
          subject: "Welcome to MediCare – Your Health Journey Begins!",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
              <h2 style="color: #1e40af;">Hello ${name}!</h2>
              <p>Thank you for joining <strong>MediCare</strong>.</p>
              <p>Your patient account has been created successfully.</p>
              <div style="background:#f3f4f6;padding:15px;border-radius:8px;margin:20px 0;">
                <p><strong>Your Patient ID:</strong> <span style="font-size:1.2em;color:#1e40af;">${patient_id}</span></p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
              </div>
              <p>You can now book appointments, view doctors, and manage your medical records.</p>
              <p>We’re so glad you’re here!</p>
              <br>
              <p><strong>The MediCare Team</strong></p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.warn("Welcome email failed (non-critical):", emailErr.message);
        // Don't fail registration because of email
      }

      // 6. Success response
      return res.status(201).json({
        success: true,
        message: "Patient registered successfully",
        data: {
          patient_id,
          name,
          email,
          phone,
          dob: dob || null,
          location: location || null,
        },
      });
    } catch (error) {
      console.error("Patient registration error:", error);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          success: false,
          message: "Email or phone already in use",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Registration failed",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  },

  // GET ALL PATIENTS
  async findAll(req, res) {
    try {
      const patients = await Patient.findAll();
      res.json({
        success: true,
        count: patients.length,
        data: patients,
      });
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // GET PATIENT BY patient_id (P001, P002...)
  async findById(req, res) {
    try {
      const { id } = req.params; // this is patient_id like "P005"
      const patient = await Patient.findById(id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }

      res.json({ success: true, data: patient });
    } catch (error) {
      console.error("Error fetching patient:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // UPDATE PATIENT
  async update(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Prevent changing critical fields
      delete updates.patient_id;
      delete updates.id;
      delete updates.email; // consider separate endpoint for email change
      delete updates.password; // use change-password endpoint

      const affected = await Patient.update(id, updates);

      if (affected === 0) {
        return res.status(404).json({
          success: false,
          message: "Patient not found or no changes made",
        });
      }

      res.json({
        success: true,
        message: "Patient updated successfully",
      });
    } catch (error) {
      console.error("Error updating patient:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // DELETE PATIENT
  async delete(req, res) {
    try {
      const { id } = req.params;
      const affected = await Patient.delete(id);

      if (affected === 0) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }

      res.json({
        success: true,
        message: "Patient deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting patient:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

export default patientController;
