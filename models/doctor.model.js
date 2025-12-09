import createConnection from "./db.js";

const db = await createConnection();

// Create Doctors table

export const createDoctorsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS Doctors (
        id               INT AUTO_INCREMENT PRIMARY KEY,
        doctor_id        VARCHAR(10) UNIQUE NOT NULL,
        name             VARCHAR(255) NOT NULL,
        email            VARCHAR(255) NOT NULL UNIQUE,
        specialization   VARCHAR(255),
        license          VARCHAR(100),
        availability     ENUM('Available', 'Busy', 'On Leave') DEFAULT 'Available',
        dob              DATE NULL,
        phone_number     VARCHAR(50),
        location         VARCHAR(255) NULL DEFAULT NULL,   -- Explicitly allows NULL
        rating           DECIMAL(3,2) DEFAULT 0.00,
        password         VARCHAR(255),
        created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        INDEX idx_doctor_id (doctor_id),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("Doctors table created successfully");
  } catch (error) {
    console.error("Error creating Doctors table:", error);
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
      availability = "Available",
      phone_number,
      dob,
      location = null, // ← fallback to NULL if not provided
      rating = 0.0,
      password,
    } = data;

    // Auto-generate doctor_id: D001, D002, D003...
    const [last] = await db.execute(
      `SELECT doctor_id FROM Doctors ORDER BY id DESC LIMIT 1`
    );

    let nextNumber = 1;
    if (last.length > 0) {
      nextNumber = parseInt(last[0].doctor_id.replace("D", "")) + 1;
    }
    const doctor_id = `D${String(nextNumber).padStart(3, "0")}`;

    const [result] = await db.execute(
      `INSERT INTO Doctors 
     (doctor_id, name, email, specialization, license, availability, 
      phone_number, dob, location, rating, password)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        doctor_id,
        name,
        email,
        specialization || null,
        license || null,
        availability,
        phone_number || null,
        dob || null,
        location || null, // ← safely inserts NULL if missing
        rating,
        password,
      ]
    );

    return { insertId: result.insertId, doctor_id };
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
    const allowedFields = [
      "name",
      "email",
      "specialization",
      "license",
      "availability",
      "phone_number",
      "dob",
      "location",
      "rating",
      "password",
    ];

    const fields = Object.keys(data).filter(
      (f) => allowedFields.includes(f) && data[f] !== undefined
    );

    if (fields.length === 0) return 0;

    const values = fields.map((f) => (data[f] === undefined ? null : data[f]));
    const setClause = fields.map((f) => `${f} = ?`).join(", ");

    const [result] = await db.execute(
      `UPDATE Doctors SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
     WHERE doctor_id = ?`,
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
