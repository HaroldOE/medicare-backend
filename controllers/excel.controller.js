// excel.controller.js (ESM)

import db from "../models/db.js";
import {
  readExcelSheet,
  buildBatchInsert,
  generateExcel,
} from "../helper/excel.helper.js";

// Define the sheets to process for injection in dependency order
const tablesToProcess = [
  { name: "Doctors", sheet: "Doctors" },
  { name: "Patients", sheet: "Patients" },
  { name: "Appointments", sheet: "Appointments" },
  { name: "consultation", sheet: "Consultation" },
];

/**
 * Handles the file upload and data injection. (POST /api/data/inject)
 */
export async function injectData(req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res
      .status(400)
      .send(
        'No files were uploaded. Please upload a file with the field name "excel".'
      );
  }

  const excelFile = req.files.excel;
  if (!excelFile.name.endsWith(".xlsx")) {
    return res
      .status(400)
      .send("Invalid file format. Please upload an .xlsx file.");
  }

  const results = {};
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction(); // Start Transaction

    for (const tableInfo of tablesToProcess) {
      const { name, sheet } = tableInfo;

      // 1. Read and transform data
      const rawData = await readExcelSheet(excelFile.data, sheet);

      if (rawData.length === 0) {
        results[name] = {
          status: "Skipped",
          message: `No data found in sheet "${sheet}".`,
        };
        continue;
      }

      // 2. Build the batch insert query
      const { sql, values } = buildBatchInsert(name, rawData);

      if (sql) {
        // 3. Execute the batch insert
        // Use IGNORE for tables with UNIQUE constraints
        let finalSql = sql;
        if (["Doctors", "Patients", "Appointments"].includes(name)) {
          finalSql = sql.replace("INSERT INTO", "INSERT IGNORE INTO");
        }

        const [result] = await connection.execute(finalSql, values);

        results[name] = {
          status: "Success",
          insertedRows: result.affectedRows,
          message: `${result.affectedRows} rows processed for table ${name}.`,
        };
      }
    }

    await connection.commit(); // Commit Transaction

    res.status(200).json({
      message: "Data injection completed successfully.",
      details: results,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback(); // Rollback on error
    }
    console.error("Database Injection Error:", error);
    res.status(500).json({
      message:
        "An error occurred during data injection. Transaction rolled back.",
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * Handles the data export and file download. (GET /api/data/export)
 */
export async function exportData(req, res) {
  let connection;

  try {
    connection = await db.getConnection();

    // Define tables to export and their columns (for cleaner output than SELECT *)
    const tablesToExport = [
      {
        name: "Doctors",
        sql: "SELECT doctor_id, name, email, specialization, license, availability, phone_number, location, rating FROM Doctors",
      },
      {
        name: "Patients",
        sql: "SELECT patient_id, name, email, phone, location, medical_history FROM Patients",
      },
      {
        name: "Appointments",
        sql: "SELECT appointment_id, patient_id, doctor_id, appointment_date, reason, status FROM Appointments",
      },
      {
        name: "consultation",
        sql: "SELECT patient_id, doctor_id, date, symptoms, diagnosis, prescription FROM consultation",
      },
    ];

    const dataSets = [];

    for (const table of tablesToExport) {
      const [rows] = await connection.execute(table.sql);
      dataSets.push({
        sheetName: table.name,
        data: rows,
      });
    }

    const excelBuffer = await generateExcel(dataSets);

    // Send the Excel file to the client
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Healthcare_Data_Export_${Date.now()}.xlsx`
    );
    res.send(excelBuffer);
  } catch (error) {
    console.error("Data Export Error:", error);
    res.status(500).json({
      message: "An error occurred during data export.",
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
