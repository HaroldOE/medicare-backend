import createConnection from "./db.js";

const db = await createConnection();

// Create Patients table
export const createPatientsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS Patients (
        patient_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        dob DATE NOT NULL,
        location VARCHAR(255),
        phone VARCHAR(50),
        medical_history TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
      )
    `);
    console.log("Patients table created successfully");
  } catch (error) {
    console.error("Error creating Patients table", error);
    throw error;
  }
};

// Patients model
export const Patient = {
  async create(data) {
    const { user_id, name, dob, location, phone, medical_history } = data;
    const [result] = await db.execute(
      `INSERT INTO Patients (user_id, name, dob, location, phone, medical_history)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, name, dob, location, phone, medical_history]
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
