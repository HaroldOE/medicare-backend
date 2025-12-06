// routes/importRoutes.js
import express from "express";
import multer from "multer";
import {
  uploadMediChainExcel,
  exportDataToExcel,
} from "../controllers/excel.controller.js";
// import { exportDataToExcel } from "../controllers/excel.controller.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `medichain-${unique}.xlsx`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only Excel files allowed"));
  },
});

router.post("/upload", upload.single("file"), uploadMediChainExcel);

router.get("/download", exportDataToExcel);
// router.get("/do", exportDataToExcel);

export default router;
