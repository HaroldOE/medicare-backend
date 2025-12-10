import createConnection from "./db.js";

const db = await createConnection();

export const createPatientsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS Patients (
        id                INT AUTO_INCREMENT PRIMARY KEY,
        patient_id        VARCHAR(10) UNIQUE NULL,
        name              VARCHAR(255) NOT NULL,
        email             VARCHAR(255) NOT NULL UNIQUE,
        phone             VARCHAR(50),
        password          VARCHAR(255),                   
        dob               DATE NULL,
        location          VARCHAR(255) NULL,
        medical_history   TEXT NULL,
        created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_patient_id (patient_id),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("Patients table created successfully");
  } catch (error) {
    console.error("Error creating Patients table:", error);
    // Make sure FK checks are turned back on even if something fails
    // await db.query(`SET FOREIGN_KEY_CHECKS = 1;`).catch(() => {});
    throw error;
  }
};

// Patients model
export const Patient = {
  async create(data) {
    const { name, email, phone, password } = data;
    const [result] = await db.execute(
      `INSERT INTO Patients (name, email, phone, password)
       VALUES (?, ?, ?, ?)`,
      [name, email, phone, password]
    );
    return result.insertId;
  },

  async findAll() {
    const [rows] = await db.execute(
      "SELECT * FROM Patients ORDER BY created_at DESC"
    );
    return rows;
  },

  async findById(patient_id) {
    const [rows] = await db.execute(
      "SELECT * FROM Patients WHERE patient_id = ?",
      [patient_id]
    );
    return rows[0];
  },
  async findByEmail(email) {
    const [rows] = await db.query(" SELECT * FROM Patients WHERE email = ?", [
      email,
    ]);
    return rows[0];
  },

  async update(patient_id, data) {
    const { name, dob, location, phone, medical_history } = data;
    const [result] = await db.execute(
      `UPDATE Patients SET name = ?, dob = ?, location = ?, phone = ?, medical_history = ?, updated_at = CURRENT_TIMESTAMP
       WHERE patient_id = ?`,
      [name, dob, location, phone, medical_history, patient_id]
    );
    return result.affectedRows;
  },

  async delete(patient_id) {
    const [result] = await db.execute(
      "DELETE FROM Patients WHERE patient_id = ?",
      [patient_id]
    );
    return result.affectedRows;
  },
};
