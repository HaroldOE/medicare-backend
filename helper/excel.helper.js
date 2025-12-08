// // helpers/importExcelHelper.js
// import XLSX from "xlsx";
// import bcrypt from "bcrypt";
// import createConnection from "../models/db.js";
// import ExcelJS from "exceljs";
// // import pool from '../models/db.js';

// const pool = await createConnection();

// /* ---------------------- PASSWORD HASHER ---------------------- */
// const hashPassword = async (plainPassword) => {
//   if (!plainPassword || plainPassword.trim() === "") return null;
//   return await bcrypt.hash(plainPassword.trim(), 10);
// };

// /* ---------------------- EXCEL DATE HANDLER ---------------------- */
// // Convert Excel serial date to YYYY-MM-DD
// const excelDateToJSDate = (serial) => {
//   if (!serial || typeof serial !== "number") return null;

//   const utcDays = Math.floor(serial - 25569);
//   const utcValue = utcDays * 86400 * 1000;
//   const dateInfo = new Date(utcValue);

//   const fractionalDay = serial - Math.floor(serial) + 0.0000001;
//   const msInDay = fractionalDay * 24 * 60 * 60 * 1000;

//   dateInfo.setTime(dateInfo.getTime() + msInDay);
//   return dateInfo.toISOString().split("T")[0];
// };

// /* ---------------------- UNIVERSAL DOB PARSER ---------------------- */
// const parseDOB = (value) => {
//   if (!value) return null;

//   // Excel serial number
//   if (typeof value === "number") return excelDateToJSDate(value);

//   // ISO format YYYY-MM-DD (already valid)
//   if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

//   // Try converting other string formats (12/30/2025 etc.)
//   const parsed = new Date(value);
//   if (!isNaN(parsed)) return parsed.toISOString().split("T")[0];

//   return null;
// };

// /* ---------------------- MAIN IMPORT FUNCTION ---------------------- */
// export const importPatientsAndDoctors = async (workbook) => {
//   const results = {
//     patientsImported: 0,
//     doctorsImported: 0,
//     skipped: [],
//     errors: [],
//   };

//   const connection = await pool.getConnection();
//   await connection.beginTransaction();

//   try {
//     /* ---------------------- PROCESS PATIENTS ---------------------- */
//     if (workbook.SheetNames.includes("Patients")) {
//       const sheet = workbook.Sheets["Patients"];
//       const data = XLSX.utils.sheet_to_json(sheet, { defval: null });

//       for (const row of data) {
//         const email = row.email_address?.trim();
//         const passwordPlain = row.password;
//         const name = row.full_name?.trim();
//         const phone = row.phone?.toString().trim() || null;
//         const location = row.location?.trim() || null;
//         const medicalHistory = row.medical_history?.trim() || null;
//         const dob = parseDOB(row.dob); // ✔ FIXED

//         if (!email || !name) {
//           results.skipped.push(`Patient skipped: missing email or name`);
//           continue;
//         }

//         try {
//           const [existingUsers] = await connection.execute(
//             "SELECT user_id FROM Users WHERE email = ?",
//             [email]
//           );

//           let userId;

//           if (existingUsers.length > 0) {
//             userId = existingUsers[0].user_id;
//           } else {
//             const hashedPassword = await hashPassword(passwordPlain);
//             const [insertResult] = await connection.execute(
//               "INSERT INTO Users (email, password, role) VALUES (?, ?, ?)",
//               [email, hashedPassword, "patient"]
//             );
//             userId = insertResult.insertId;
//           }

//           await connection.execute(
//             `INSERT INTO Patients (user_id, name, dob, location, phone, medical_history)
//              VALUES (?, ?, ?, ?, ?, ?)
//              ON DUPLICATE KEY UPDATE
//              name = VALUES(name),
//              dob = VALUES(dob),
//              location = VALUES(location),
//              phone = VALUES(phone),
//              medical_history = VALUES(medical_history)`,
//             [userId, name, dob, location, phone, medicalHistory]
//           );

//           results.patientsImported++;
//         } catch (err) {
//           results.errors.push(`Patient ${email}: ${err.message}`);
//         }
//       }
//     }

//     /* ---------------------- PROCESS DOCTORS ---------------------- */
//     if (workbook.SheetNames.includes("Doctors")) {
//       const sheet = workbook.Sheets["Doctors"];
//       const data = XLSX.utils.sheet_to_json(sheet, { defval: null });

//       for (const row of data) {
//         const email = row.email?.trim();
//         const passwordPlain = row.password;
//         const name = row.full_name?.trim();
//         const specialization = row.specialization || null;
//         const license = row.license || null;
//         const availability = row.availability || "Available";
//         const rating = row.rating || 0;
//         const dob = parseDOB(row.dob); // ✔ FIXED

//         if (!email || !name) {
//           results.skipped.push(`Doctor skipped: missing email or name`);
//           continue;
//         }

//         try {
//           const [existingUsers] = await connection.execute(
//             "SELECT user_id FROM Users WHERE email = ?",
//             [email]
//           );

//           let userId;

//           if (existingUsers.length > 0) {
//             userId = existingUsers[0].user_id;
//           } else {
//             const hashedPassword = await hashPassword(passwordPlain);
//             const [insertResult] = await connection.execute(
//               "INSERT INTO Users (email, password, role) VALUES (?, ?, ?)",
//               [email, hashedPassword, "doctor"]
//             );
//             userId = insertResult.insertId;
//           }

//           await connection.execute(
//             `INSERT INTO Doctors ( name, specialization, license, availability, rating, dob)
//              VALUES (?, ?, ?, ?, ?, ?)
//              ON DUPLICATE KEY UPDATE
//              name = VALUES(name),
//              specialization = VALUES(specialization),
//              license = VALUES(license),
//              availability = VALUES(availability),
//              rating = VALUES(rating),
//              dob = VALUES(dob)`,
//             [name, specialization, license, availability, rating, dob]
//           );

//           results.doctorsImported++;
//         } catch (err) {
//           results.errors.push(`Doctor ${email}: ${err.message}`);
//         }
//       }
//     }

//     /* ---------------------- FINISH ---------------------- */
//     await connection.commit();
//     connection.release();
//     return results;
//   } catch (err) {
//     await connection.rollback();
//     connection.release();
//     throw err;
//   }
// };

// // EXPORT
// export const generateExcelWorkbook = async () => {
//   const workbook = new ExcelJS.Workbook();

//   // === Patients Sheet ===
//   const patientsSheet = workbook.addWorksheet("Patients");

//   patientsSheet.columns = [
//     { header: "Patient ID", key: "patient_id", width: 15 },
//     { header: "Full Name", key: "name", width: 25 },
//     { header: "Email", key: "email", width: 30 },
//     { header: "Phone", key: "phone", width: 18 },
//     { header: "DOB", key: "dob", width: 15 },
//     { header: "Location", key: "location", width: 25 },
//     { header: "Medical History", key: "medical_history", width: 30 },
//     { header: "Created At", key: "created_at", width: 20 },
//   ];

//   const [patients] = await pool.query(`
//     SELECT
//       p.patient_id,
//       p.name,
//       u.email,
//       p.phone,
//       p.dob,
//       p.location,
//       p.medical_history,
//       p.created_at
//     FROM Patients p
//     JOIN Users u ON p.user_id = u.user_id
//     ORDER BY p.patient_id
//   `);

//   patients.forEach((patient) => {
//     patientsSheet.addRow({
//       ...patient,
//       dob: patient.dob ? new Date(patient.dob).toISOString().split("T")[0] : "",
//       created_at: new Date(patient.created_at).toLocaleString(),
//     });
//   });

//   // === Doctors Sheet ===
//   const doctorsSheet = workbook.addWorksheet("Doctors");

//   doctorsSheet.columns = [
//     { header: "Doctor ID", key: "doctor_id", width: 15 },
//     { header: "Full Name", key: "name", width: 25 },
//     { header: "Email", key: "email", width: 30 },
//     { header: "Phone", key: "phone_number", width: 18 },
//     { header: "Location", key: "location", width: 25 },
//     { header: "DOB", key: "dob", width: 15 },
//     { header: "Specialization", key: "specialization", width: 20 },
//     { header: "License", key: "license", width: 15 },
//     { header: "Availability", key: "availability", width: 15 },
//     { header: "Rating", key: "rating", width: 10 },
//     { header: "Created At", key: "created_at", width: 20 },
//   ];

//   const [doctors] = await pool.query(`
//     SELECT
//       d.doctor_id,
//       d.name,
//       u.email,
//       d.phone_number,
//       d.location,
//       d.dob,
//       d.specialization,
//       d.license,
//       d.availability,
//       d.rating,
//       d.created_at
//     FROM Doctors d
//     JOIN Users u ON d.user_id = u.user_id
//     ORDER BY d.doctor_id
//   `);

//   doctors.forEach((doctor) => {
//     doctorsSheet.addRow({
//       ...doctor,
//       dob: doctor.dob ? new Date(doctor.dob).toISOString().split("T")[0] : "",
//       created_at: new Date(doctor.created_at).toLocaleString(),
//     });
//   });

//   return workbook;
// };

// helper/excel.helper.js
import XLSX from "xlsx";
import bcrypt from "bcrypt";
import createConnection from "../models/db.js";
import ExcelJS from "exceljs";

/* ---------------------- PASSWORD HASHER ---------------------- */
const hashPassword = async (plainPassword) => {
  if (!plainPassword || plainPassword.trim() === "") return null;
  return await bcrypt.hash(plainPassword.trim(), 10);
};

/* ---------------------- MAIN IMPORT FUNCTION ---------------------- */
export const importPatientsAndDoctors = async (workbook) => {
  const results = {
    patientsImported: 0,
    doctorsImported: 0,
    skipped: [],
    errors: [],
  };
  const pool = await createConnection();
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const patientSheetName = workbook.SheetNames.find(
      (s) => s.trim() === "Patients"
    );
    const doctorSheetName = workbook.SheetNames.find(
      (s) => s.trim() === "Doctors"
    );

    // PATIENTS – ONLY COLUMNS THAT EXIST IN YOUR TABLE!
    if (patientSheetName) {
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[patientSheetName], {
        defval: null,
      });

      for (const row of data) {
        const email = row.email_address?.trim();
        const passwordPlain = row.password;
        const name = row.full_name?.trim();
        const phone = row.phone?.toString().trim() || null;

        if (!email || !name) {
          results.skipped.push(`Patient skipped: missing email/name`);
          continue;
        }

        try {
          const hashedPassword = passwordPlain
            ? await hashPassword(passwordPlain)
            : null;

          await connection.execute(
            `INSERT INTO Patients (name, email, phone, password)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               name = VALUES(name),
               phone = VALUES(phone),
               password = COALESCE(VALUES(password), password)`,
            [name, email, phone, hashedPassword]
          );

          results.patientsImported++;
        } catch (err) {
          results.errors.push(`Patient ${email}: ${err.message}`);
        }
      }
    }

    // DOCTORS – YOUR DOCTORS TABLE HAS THESE COLUMNS
    if (doctorSheetName) {
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[doctorSheetName], {
        defval: null,
      });

      for (const row of data) {
        const email = row.email?.trim();
        const passwordPlain = row.password;
        const name = row.full_name?.trim();
        const phone = row.phone_number?.toString().trim() || null;
        const location = row.location?.trim() || null;
        const specialization = row.specialization || null;
        const license = row.license || null;
        const availability = row.availability || "Available";
        const rating = row.rating || 0;
        const dobRaw = row.dob;
        const dob =
          typeof dobRaw === "number"
            ? new Date((dobRaw - 25569) * 86400 * 1000)
                .toISOString()
                .split("T")[0]
            : dobRaw || null;

        if (!email || !name) {
          results.skipped.push(`Doctor skipped: missing email/name`);
          continue;
        }

        try {
          const hashedPassword = passwordPlain
            ? await hashPassword(passwordPlain)
            : null;

          await connection.execute(
            `INSERT INTO Doctors 
             (name, email, phone_number, location, dob, specialization, license, availability, rating, password)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               name = VALUES(name), phone_number = VALUES(phone_number), location = VALUES(location),
               dob = VALUES(dob), specialization = VALUES(specialization), license = VALUES(license),
               availability = VALUES(availability), rating = VALUES(rating),
               password = COALESCE(VALUES(password), password)`,
            [
              name,
              email,
              phone,
              location,
              dob,
              specialization,
              license,
              availability,
              rating,
              hashedPassword,
            ]
          );

          results.doctorsImported++;
        } catch (err) {
          results.errors.push(`Doctor ${email}: ${err.message}`);
        }
      }
    }

    await connection.commit();
    return results;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

/* ---------------------- EXPORT FUNCTION ---------------------- */
export const generateExcelWorkbook = async () => {
  const workbook = new ExcelJS.Workbook();
  const pool = await createConnection();
  const connection = await pool.getConnection();

  try {
    // Patients
    const patientsSheet = workbook.addWorksheet("Patients");
    patientsSheet.columns = [
      { header: "Patient ID", key: "patient_id", width: 15 },
      { header: "Full Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 18 },
      { header: "Created At", key: "created_at", width: 20 },
    ];

    const [patients] = await connection.query(
      `SELECT patient_id, name, email, phone, created_at FROM Patients`
    );
    patients.forEach((p) =>
      patientsSheet.addRow({
        ...p,
        created_at: new Date(p.created_at).toLocaleString(),
      })
    );

    // Doctors
    const doctorsSheet = workbook.addWorksheet("Doctors");
    doctorsSheet.columns = [
      { header: "Doctor ID", key: "doctor_id", width: 15 },
      { header: "Full Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone_number", width: 18 },
      { header: "Location", key: "location", width: 25 },
      { header: "DOB", key: "dob", width: 15 },
      { header: "Specialization", key: "specialization", width: 20 },
      { header: "License", key: "license", width: 15 },
      { header: "Availability", key: "availability", width: 15 },
      { header: "Rating", key: "rating", width: 10 },
      { header: "Created At", key: "created_at", width: 20 },
    ];

    const [doctors] = await connection.query(`SELECT * FROM Doctors`);
    doctors.forEach((d) =>
      doctorsSheet.addRow({
        ...d,
        dob: d.dob ? new Date(d.dob).toISOString().split("T")[0] : "",
        created_at: new Date(d.created_at).toLocaleString(),
      })
    );

    return workbook;
  } finally {
    connection.release();
  }
};
