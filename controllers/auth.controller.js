import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/user.model.js";
import { error } from "console";

const JWT_SECRET = process.env.JWT_SECRET_KEY;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRATION || "1h";
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
const RESET_EXPIRES_MIN = parseInt(
  process.env.PASSWORD_RESET_TOKEN_EXPIRES_MIN || "60",
  10
);

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

  requestPasswordReset: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Email required" });

      const user = await User.findByEmail(email);
      if (!user)
        return res.json({ message: "If email exists, reset token generated" });

      const tokenPlain = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + RESET_EXPIRES_MIN * 60 * 1000);

      await User.deleteAllResetTokensForUser(user.user_id);
      await User.createPasswordResetToken(user.user_id, tokenPlain, expiresAt);

      // TODO: send tokenPlain via email in production
      res.json({
        message: "Password reset token generated",
        token: tokenPlain,
        expires_at: expiresAt,
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
