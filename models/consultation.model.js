import createConnection from "./db.js";

const db = await createConnection();

export const createConsultationTable = async () => {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS consultation (
      consult_id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id VARCHAR(10) NOT NULL,
      doctor_id INT NOT NULL,
      date DATETIME,
      symptoms TEXT,
      diagnosis TEXT,
      prescription TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    console.log("Consultation table created successfully");
  } catch (error) {
    console.error("An error occurred creating consultation table", error);
    throw error;
  }
};

export const Consultation = {
  // Create
  async create(data) {
    const { patient_id, doctor_id, date, symptoms, diagnosis, prescription } =
      data;
    const [result] = await db.execute(
      `INSERT INTO consultation (patient_id, doctor_id, date, symptoms, diagnosis, prescription)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_id, doctor_id, date, symptoms, diagnosis, prescription]
    );
    return result.insertId;
  },

  // Get all
  async findAll() {
    const [rows] = await db.execute(
      "SELECT * FROM consultation ORDER BY created_at DESC"
    );
    return rows;
  },

  // Get by ID
  async findById(consult_id) {
    const [rows] = await db.execute(
      "SELECT * FROM consultation WHERE consult_id = ?",
      [consult_id]
    );
    return rows[0];
  },

  // Update
  async update(consult_id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) return 0; // nothing to update

    // Dynamically create SET clause
    const setStr =
      fields.map((field) => `${field} = ?`).join(", ") +
      ", updated_at = CURRENT_TIMESTAMP";

    const [result] = await db.execute(
      `UPDATE consultation SET ${setStr} WHERE consult_id = ?`,
      [...values, consult_id]
    );

    return result.affectedRows;
  },

  // Delete
  async delete(consult_id) {
    const [result] = await db.execute(
      "DELETE FROM consultation WHERE consult_id = ?",
      [consult_id]
    );
    return result.affectedRows;
  },
};
