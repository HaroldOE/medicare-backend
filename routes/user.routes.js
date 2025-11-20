import express from "express";
import { userController } from "../controllers/user.controller.js";
import { authenticate, authorizeRole } from "../core/auth.js";

const router = express.Router();

// Pass function references, NOT calls or objects
router.post("/", userController.create); // <--- add this

router.get(
  "/",
  authenticate,
  authorizeRole("doctor", "patient"),
  userController.findAll
);
router.get("/:id", authenticate, userController.findOne);
router.put("/:id", authenticate, userController.update);
router.delete("/:id", authenticate, userController.delete);

export default router;
