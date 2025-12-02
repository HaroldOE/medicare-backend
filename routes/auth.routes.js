// routes/auth.js
import express from "express";
import { authController } from "../controllers/auth.controller.js";

const router = express.Router();
router.post("/login", authController.login);
router.post("/password-reset/request", authController.requestPasswordReset);
router.post("/password-reset/reset", authController.resetPassword);

export default router;
