// controllers/importController.js
import XLSX from "xlsx";
import fs from "fs/promises";
import { importPatientsAndDoctors } from "../helper/excel.helper.js";
import ExcelJS from "exceljs";
import { generateExcelWorkbook } from "../helper/excel.helper.js";

export const uploadMediChainExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const workbook = XLSX.readFile(req.file.path);

    if (
      !workbook.SheetNames.includes("Patients") &&
      !workbook.SheetNames.includes("Doctors")
    ) {
      await fs.unlink(req.file.path);
      return res
        .status(400)
        .json({ error: "Invalid file: Missing required sheets" });
    }

    const result = await importPatientsAndDoctors(workbook);

    await fs.unlink(req.file.path);

    res.status(200).json({
      message: "Bulk import completed successfully",
      summary: {
        patientsImported: result.patientsImported,
        doctorsImported: result.doctorsImported,
        skipped: result.skipped.length,
        errors: result.errors.length,
      },
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (err) {
    if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
    console.error("Import error:", err);
    res.status(500).json({
      error: "Import failed",
      message: err.message,
    });
  }
};

// controllers/exportController.js

export const exportDataToExcel = async (req, res) => {
  try {
    const workbook = await generateExcelWorkbook();

    // Set headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=MediChain_Data_Export_${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );

    // Stream the Excel file to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({
      error: "Export failed",
      message: err.message,
    });
  }
};
