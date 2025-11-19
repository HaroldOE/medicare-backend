import createConnection from "./db.js";

const db = await createConnection();

// Create Users table
export const createUsersTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS Users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('patient','doctor') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Users table created successfully");
  } catch (error) {
    console.error("Error creating Users table", error);
    throw error;
  }
};

// Users model
export const User = {
  async create(data) {
    const { email, password, role } = data;
    const [result] = await db.execute(
      `INSERT INTO Users (email, password, role) VALUES (?, ?, ?)`,
      [email, password, role]
    );
    return result.insertId;
  },

  async findAll() {
    const [rows] = await db.execute(
      "SELECT * FROM Users ORDER BY created_at DESC"
    );
    return rows;
  },

  async findById(user_id) {
    const [rows] = await db.execute("SELECT * FROM Users WHERE user_id = ?", [
      user_id,
    ]);
    return rows[0];
  },

  async update(user_id, data) {
    const { email, password, role } = data;
    const [result] = await db.execute(
      `UPDATE Users SET email = ?, password = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [email, password, role, user_id]
    );
    return result.affectedRows;
  },

  async delete(user_id) {
    const [result] = await db.execute("DELETE FROM Users WHERE user_id = ?", [
      user_id,
    ]);
    return result.affectedRows;
  },
};
