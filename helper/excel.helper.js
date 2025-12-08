// excel.helper.js (ESM - FINAL & CORRECTED)

import ExcelJS from "exceljs";

/**
 * Maps ACTUAL CSV/EXCEL headers to database column names for injection.
 */
const columnMappings = {
  Doctors: {
    doctor_id: "doctor_id",
    full_name: "name", // Mapped from CSV 'full_name'
    email: "email",
    phone_number: "phone_number",
    location: "location",
    dob: "dob",
    specialization: "specialization",
    license: "license",
    availability: "availability",
    rating: "rating",
    password: "password",
    // Columns like 'created_at' are auto-excluded.
  },
  Patients: {
    patient_id: "patient_id",
    full_name: "name", // Mapped from CSV 'full_name'
    email_address: "email", // Mapped from CSV 'email_address'
    phone: "phone",
    password: "password",
    dob: "dob",
    location: "location",
    medical_history: "medical_history",
    // Columns like 'created_at', 'updated_visit' are auto-excluded.
  },
  Appointments: {
    appointment_id: "appointment_id",
    patient_id: "patient_id",
    doctor_id: "doctor_id",
    date: "date_part", // Temporary key for transformation
    time: "time_part", // Temporary key for transformation
    // Note: 'reason' is missing in CSV, will be null in DB
    status: "status",
    // Columns like 'location', 'created_at' are auto-excluded.
  },
  Consultation: {
    patient_id: "patient_id",
    doctor_id: "doctor_id",
    date: "date", // Maps directly to DB DATETIME
    symptoms: "symptoms",
    diagnosis: "diagnosis",
    prescription: "prescription",
    // Columns like 'consult_id' (auto-increment), 'created_at' are auto-excluded.
  },
};

/**
 * Reads a specific sheet from the Excel buffer and transforms the data for DB insertion.
 */
export async function readExcelSheet(excelBuffer, sheetName) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(excelBuffer);

  const worksheet = workbook.getWorksheet(sheetName);
  if (!worksheet) {
    // Fallback for case sensitivity or slight naming variations
    const possibleSheetName = Object.keys(columnMappings).find(
      (key) => key.toLowerCase() === sheetName.toLowerCase()
    );
    if (possibleSheetName) sheetName = possibleSheetName;
    else throw new Error(`Sheet named "${sheetName}" not found.`);
  }

  const headerRow = worksheet.getRow(1);
  const headers = [];
  headerRow.eachCell((cell) => headers.push(cell.text));

  const mapping = columnMappings[sheetName];

  const data = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header row

    const rowData = {};
    let tempDatePart = null;
    let tempTimePart = null;
    let isEmptyRow = true;

    row.eachCell((cell, colNumber) => {
      const excelHeader = headers[colNumber - 1];
      const dbColumn = mapping[excelHeader];

      if (!dbColumn) return; // Skip unmapped columns (like created_at, consult_id, location in Appointments)

      let cellValue = cell.value;

      // --- Special Handling for Appointments Date/Time Combination ---
      if (sheetName === "Appointments") {
        if (dbColumn === "date_part") {
          tempDatePart = cellValue;
          return;
        }
        if (dbColumn === "time_part") {
          tempTimePart = cellValue;
          return;
        }
      }

      // --- Default Value Transformation ---
      if (dbColumn.includes("date") || dbColumn.includes("dob")) {
        if (cellValue instanceof Date) {
          rowData[dbColumn] = cellValue.toISOString().slice(0, 10); // DATE format
        } else if (typeof cellValue === "number" && cell.isDate) {
          const excelDate = new Date(Date.UTC(0, 0, cellValue - 1));
          rowData[dbColumn] = excelDate.toISOString().slice(0, 10);
        } else {
          rowData[dbColumn] = String(cellValue || "").trim() || null;
        }
      } else if (dbColumn === "rating") {
        rowData[dbColumn] = parseFloat(cellValue) || 0.0;
      } else {
        rowData[dbColumn] = cellValue != null ? String(cellValue).trim() : null;
      }

      if (rowData[dbColumn] !== null && String(rowData[dbColumn]).length > 0) {
        isEmptyRow = false;
      }
    });

    // --- Post-Row Processing for Appointments (Combining Date and Time) ---
    if (sheetName === "Appointments" && tempDatePart) {
      isEmptyRow = false; // Row must have a date/time

      let dateStr =
        tempDatePart instanceof Date
          ? tempDatePart.toISOString().slice(0, 10)
          : String(tempDatePart);
      let timeStr =
        tempTimePart instanceof Date
          ? tempTimePart.toISOString().slice(11, 19)
          : String(tempTimePart);

      // Handle time part formatting (Excel often gives date objects for time)
      if (timeStr && timeStr.includes(":")) {
        // Time is already formatted (e.g., HH:mm:ss)
      } else if (timeStr && timeStr.length > 5 && timeStr.length < 10) {
        // Common case where time is stored as fractional day (0.xx) in cell.value
        const timeObject = new Date(
          0,
          0,
          0,
          0,
          0,
          0,
          timeStr * 24 * 3600 * 1000
        );
        timeStr = timeObject.toISOString().slice(11, 19);
      } else {
        // Fallback or if time is a simple string
        timeStr = tempTimePart || "00:00:00";
      }

      rowData["appointment_date"] = `${dateStr} ${timeStr}`;

      // Remove temporary keys if they somehow made it into rowData
      delete rowData.date_part;
      delete rowData.time_part;
    }

    if (!isEmptyRow && Object.keys(rowData).length > 0) {
      data.push(rowData);
    }
  });

  return data;
}

/**
 * Constructs a single INSERT statement for batch insertion.
 */
export function buildBatchInsert(tableName, data) {
  if (data.length === 0) {
    return { sql: "", values: [] };
  }

  // Filter out auto-increment keys if present
  const columns = Object.keys(data[0]).filter(
    (col) => col !== "consult_id" && col !== "id"
  );

  const placeholders = `(${columns.map(() => "?").join(", ")})`;
  const valuePlaceholders = data.map(() => placeholders).join(", ");

  const sql = `INSERT INTO ${tableName} (${columns.join(
    ", "
  )}) VALUES ${valuePlaceholders}`;
  const values = data.flatMap((row) => columns.map((col) => row[col]));

  return { sql, values };
}

/**
 * Generates an Excel file buffer from database results. (Used for Export)
 */
export async function generateExcel(dataSets) {
  const workbook = new ExcelJS.Workbook();

  for (const dataSet of dataSets) {
    const { sheetName, data } = dataSet;
    if (data.length === 0) continue;

    const worksheet = workbook.addWorksheet(sheetName);

    const columns = Object.keys(data[0]).map((key) => ({
      header: key.replace(/_/g, " ").toUpperCase(),
      key: key,
      width: 25,
    }));

    worksheet.columns = columns;
    worksheet.addRows(data);

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };
    });
  }

  return workbook.xlsx.writeBuffer();
}
