// excel.route.js (ESM)

import express from "express";
import { injectData, exportData } from "../controllers/excel.controller.js";

const router = express.Router();

// Route for file upload and data injection (POST)
router.post("/upload", injectData);

// Route for data download and excel export (GET)
router.get("/download", exportData);

export default router;
