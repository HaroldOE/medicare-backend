import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/user.model.js";
import { Patient } from "../models/patient.model.js";
// import { error } from "console";

const JWT_SECRET = process.env.JWT_SECRET_KEY;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRATION || "1h";
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
const RESET_EXPIRES_MIN = parseInt(
  process.env.PASSWORD_RESET_TOKEN_EXPIRES_MIN || "60",
  10
);
const FRONTEND_URL = process.env.FRONTEND_URL;

export const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ error: "Email and password required" });

      const user = await User.findByEmail(email);
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: "Invalid credentials" });

      const payload = {
        user_id: user.user_id,
        role: user.role,
        email: user.email,
      };
      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      return res.json({
        message: "Login successful",
        token,
        user: { user_id: user.user_id, email: user.email, role: user.role },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // controllers

  patientLogin: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

     
      const patient = await Patient.findByEmail(email.toLowerCase());

      if (!patient) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, patient.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create same JWT structure as doctor login
      const token = jwt.sign(
        {
          user_id: patient.id || patient.patient_id, // adjust to your column name
          email: patient.email,
          role: "patient",
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        message: "Login successful",
        token,
        user: {
          user_id: patient.id || patient.patient_id,
          fullname: patient.fullname,
          email: patient.email,
          role: "patient",
        },
      });
    } catch (error) {
      console.error("Patient login error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  },

  requestPasswordReset: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Email required" });

      const user = await User.findByEmail(email);
      if (!user) return res.json({ message: "user with mail not found" });

      const tokenPlain = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + RESET_EXPIRES_MIN * 60 * 1000);

      await User.deleteAllResetTokensForUser(user.user_id);
      await User.createPasswordResetToken(user.user_id, tokenPlain, expiresAt);

      const resetLink = `${FRONTEND_URL}/reset-password?token=${tokenPlain}`;

      await sendEmail({
        to: email,
        subject: "Password Reset Request",
        html: `
        <p>Hello ${user.name || ""},</p>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset it:</p>
        <a href="${resetLink}" style="padding:10px 20px;background:#0d6efd;color:white;text-decoration:none;border-radius:5px;">
          Reset Password
        </a>
        <p>This link will expire in ${RESET_EXPIRES_MIN} minutes.</p>
        <p>If you didn’t request this, please ignore it.</p>
      `,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword)
        return res
          .status(400)
          .json({ error: "Token and newPassword required" });
      if (newPassword.length < 6)
        return res
          .status(400)
          .json({ error: "Password must be at least 6 chars" });

      const tokenRow = await User.findPasswordResetToken(token);
      if (!tokenRow)
        return res.status(400).json({ error: "Invalid or expired token" });

      if (new Date(tokenRow.expires_at) < new Date()) {
        await User.deletePasswordResetTokenById(tokenRow.id);
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
      await User.update(tokenRow.user_id, { password: hashedPassword });
      await User.deleteAllResetTokensForUser(tokenRow.user_id);

      res.json({ message: "Password reset successful" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
