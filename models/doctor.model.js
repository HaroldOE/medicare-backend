import createConnection from "./db.js";

const db = await createConnection();

// Create Doctors table
export const createDoctorsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS Doctors (
        doctor_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        specialization VARCHAR(255),
        license VARCHAR(100),
        availability VARCHAR(255),
        rating DECIMAL(3,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
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
    const { user_id, name, specialization, license, availability, rating } =
      data;
    const [result] = await db.execute(
      `INSERT INTO Doctors (user_id, name, specialization, license, availability, rating)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, name, specialization, license, availability, rating]
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
    const { name, specialization, license, availability, rating } = data;
    const [result] = await db.execute(
      `UPDATE Doctors SET name = ?, specialization = ?, license = ?, availability = ?, rating = ?, updated_at = CURRENT_TIMESTAMP
       WHERE doctor_id = ?`,
      [name, specialization, license, availability, rating, doctor_id]
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
