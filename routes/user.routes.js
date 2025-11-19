import express from "express";
import { userController } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/", userController.create);
userRouter.get("/", userController.findAll);
userRouter.get("/:id", userController.findById);
userRouter.put("/:id", userController.update);
userRouter.delete("/:id", userController.delete);

export default userRouter;
