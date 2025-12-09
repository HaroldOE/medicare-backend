// // excel.helper.js (ESM - FINAL & CORRECTED)

import ExcelJS_pkg from "exceljs";
const { Workbook } = ExcelJS_pkg; // Destructure the Workbook constructor

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
  },
  // FIX 1: Changed key from "Appointments" (plural) to "Appointment" (singular)
  // to match the sheet name passed from the controller.
  Appointment: {
    appointment_id: "appointment_id",
    patient_id: "patient_id",
    doctor_id: "doctor_id",
    date: "date_part", // Temporary key for transformation
    time: "time_part", // Temporary key for transformation
    status: "status",
  },
  Consultations: {
    patient_id: "patient_id",
    doctor_id: "doctor_id",
    date: "date", // Maps directly to DB DATETIME
    symptoms: "symptoms",
    diagnosis: "diagnosis",
    prescription: "prescription",
  },
};

/**
 * Reads a specific sheet from the Excel buffer and transforms the data for DB insertion.
 */
export async function readExcelSheet(excelBuffer, sheetName) {
  const workbook = new Workbook();
  await workbook.xlsx.load(excelBuffer);

  // Sheet name lookup, including case-insensitive matching
  let worksheet = workbook.getWorksheet(sheetName);

  if (!worksheet) {
    // This custom lookup block remains, ensuring we try to get the sheet
    // even if case or singular/plural doesn't exactly match the mapping key.
    const sheetMapKey = Object.keys(columnMappings).find(
      (key) => key.toLowerCase() === sheetName.toLowerCase()
    );

    if (sheetMapKey) {
      const actualSheetName = workbook.worksheets.find(
        (s) => s.name.toLowerCase() === sheetName.toLowerCase()
      )?.name;

      if (actualSheetName) {
        worksheet = workbook.getWorksheet(actualSheetName);
        sheetName = sheetMapKey;
      }
    }

    if (!worksheet) {
      throw new Error(
        `Sheet named "${sheetName}" not found in the Excel file.`
      );
    }
  }

  const headerRow = worksheet.getRow(1);
  const headers = [];
  headerRow.eachCell((cell) =>
    headers.push(
      String(cell.text)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "")
    )
  );

  const mapping = columnMappings[sheetName];

  // Defensive check for mapping existence before proceeding
  if (!mapping) {
    throw new Error(
      `Configuration error: No column mapping found for sheet/key "${sheetName}".`
    );
  }

  const data = [];

  // FIX: Only include non-empty rows, and use rowNumber check for header
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header row

    const rowData = {};
    let tempDatePart = null;
    let tempTimePart = null;

    row.eachCell((cell, colNumber) => {
      const excelHeader = headers[colNumber - 1];
      const dbColumn = mapping[excelHeader];

      if (!dbColumn) return; // Skip unmapped columns

      let cellValue = cell.value;

      // Clean cellValue if it's an object (RichText, Date, etc.)
      if (cellValue && typeof cellValue === "object") {
        if (cellValue.text) {
          cellValue = cellValue.text;
        } else if (cellValue instanceof Date) {
          // Keep as Date object for date/time combination later if needed
        }
      }

      // --- Special Handling for Appointments Date/Time Combination ---
      // This check is now for "Appointment" (singular) which is the correct mapping key
      if (sheetName === "Appointment") {
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
    });

    // --- Post-Row Processing for Appointments (Combining Date and Time) ---
    if (sheetName === "Appointment" && tempDatePart) {
      let dateStr = null;
      if (tempDatePart instanceof Date) {
        dateStr = tempDatePart.toISOString().slice(0, 10);
      } else if (typeof tempDatePart === "string") {
        dateStr = tempDatePart.split(" ")[0]; // Handle YYYY-MM-DD
      }

      let timeStr = null;
      if (tempTimePart instanceof Date) {
        timeStr = tempTimePart.toLocaleTimeString("en-GB", {
          hour12: false,
        });
      } else if (typeof tempTimePart === "string") {
        timeStr = tempTimePart.split(" ")[0]; // Handle HH:MM:SS
      }

      if (dateStr && timeStr) {
        // NOTE: The DB column is 'appointment_date' as per your export function
        rowData["appointment_date"] = `${dateStr} ${timeStr}`;
      } else if (dateStr) {
        rowData["appointment_date"] = dateStr;
      } else {
        rowData["appointment_date"] = null;
      }

      // Remove temporary keys (Only delete them here inside the combining block)
      delete rowData.date_part;
      delete rowData.time_part;
    }

    // REMOVED DUPLICATE/MISPLACED KEY DELETION BLOCK HERE

    // Final check for 'consultation' table missing reason
    if (sheetName === "Consultation" && rowData.location !== undefined) {
      rowData.reason = rowData.location;
      delete rowData.location;
    }

    // Robust Row Validation based on Primary Key before pushing.
    const primaryKeyCandidates = ["appointment_id", "doctor_id", "patient_id"];
    const dbPrimaryKey = primaryKeyCandidates.find((key) =>
      rowData.hasOwnProperty(key)
    );

    // Only push if a mapped primary key exists AND has a non-empty value
    if (
      dbPrimaryKey &&
      rowData[dbPrimaryKey] &&
      String(rowData[dbPrimaryKey]).length > 0
    ) {
      data.push(rowData);
    }
    // Fallback: check if any data was extracted if no clear primary key is defined in rowData
    else if (!dbPrimaryKey && Object.keys(rowData).length > 0) {
      data.push(rowData);
    }
  });

  return data;
}

/**
 * Constructs a single INSERT statement for batch insertion.
 */
export function buildBatchInsert(tableName, data) {
  // CRITICAL FIX: Filter out any null, undefined, or empty objects.
  const cleanedData = data.filter(
    (row) => row && typeof row === "object" && Object.keys(row).length > 0
  );

  if (cleanedData.length === 0) {
    // Graceful return if no data remains after filtering
    return { sql: "", values: [] };
  }

  // Use defensive object key extraction, providing an empty object as a fallback
  const columns = Object.keys(cleanedData[0] || {}).filter(
    (col) => col !== "consult_id" && col !== "id"
  );

  // Guard against rows having no valid columns (e.g., all were filtered out)
  if (columns.length === 0) {
    return { sql: "", values: [] };
  }

  const placeholders = `(${columns.map(() => "?").join(", ")})`;
  const valuePlaceholders = cleanedData.map(() => placeholders).join(", ");

  const sql = `INSERT INTO ${tableName} (${columns.join(
    ", "
  )}) VALUES ${valuePlaceholders}`;
  const values = cleanedData.flatMap((row) => columns.map((col) => row[col]));

  return { sql, values };
}

/**
 * Generates an Excel file buffer from database results. (Used for Export)
 */
export async function generateExcel(dataSets) {
  const workbook = new Workbook();

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
