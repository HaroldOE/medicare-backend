import express from "express";
import { InventoryController } from "../controllers/inventory.controller.js";

const inventoryRouter = express.Router();

// CREATE
inventoryRouter.post("/", InventoryController.create);

// READ ALL
inventoryRouter.get("/", InventoryController.getAll);

// READ BY ID
inventoryRouter.get("/:id", InventoryController.getById);

// UPDATE
inventoryRouter.put("/:id", InventoryController.update);

// DELETE
inventoryRouter.delete("/:id", InventoryController.delete);

export default inventoryRouter;
