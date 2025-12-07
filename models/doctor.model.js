import createConnection from "./db.js";

const db = await createConnection();

// Create Doctors table
export const createDoctorsTable = async () => {
  try {
    // await db.query(`SET FOREIGN_KEY_CHECKS = 0`);
    // await db.query(`DROP TABLE IF EXISTS Doctors`);
    // await db.query(`SET FOREIGN_KEY_CHECKS = 1`);

    // console.log("Doctors table dropped successfully");

    // Create table
    await db.query(`
      CREATE TABLE IF NOT EXISTS Doctors (
        doctor_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        specialization VARCHAR(255),
        license VARCHAR(100),
        availability VARCHAR(255),
        dob DATE NOT NULL,
        phone_number VARCHAR(50),
        location VARCHAR(255),
        rating DECIMAL(3,2) DEFAULT 0,
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Doctors table created successfully");
  } catch (error) {
    console.error("Error creating Doctors table", error);
    throw error;
  }
};

// Doctors model
export const Doctor = {
  async create(data) {
    const {
      name,
      email,
      specialization,
      license,
      availability,
      phone_number,
      dob,
      location,
      rating = 0,
      password,
    } = data;

    const [result] = await db.execute(
      `INSERT INTO Doctors 
    (name, email, specialization, license, availability, phone_number, dob, rating, location, password)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        specialization,
        license,
        availability,
        phone_number,
        dob,
        rating,
        location,
        password,
      ]
    );

    return result.insertId;
  },
  async findAll() {
    const [rows] = await db.execute(
      "SELECT * FROM Doctors ORDER BY created_at DESC"
    );
    return rows;
  },

  async findById(doctor_id) {
    const [rows] = await db.execute(
      "SELECT * FROM Doctors WHERE doctor_id = ?",
      [doctor_id]
    );
    return rows[0];
  },

  async update(doctor_id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) return 0; // nothing to update

    // Dynamically build SET part of SQL
    const setStr =
      fields.map((field) => `${field} = ?`).join(", ") +
      ", updated_at = CURRENT_TIMESTAMP";

    const [result] = await db.execute(
      `UPDATE Doctors SET ${setStr} WHERE doctor_id = ?`,
      [...values, doctor_id]
    );

    return result.affectedRows;
  },

  async delete(doctor_id) {
    const [result] = await db.execute(
      "DELETE FROM Doctors WHERE doctor_id = ?",
      [doctor_id]
    );
    return result.affectedRows;
  },
};
