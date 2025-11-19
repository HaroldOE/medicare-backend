import createConnection from "../db.js";

const db = await createConnection();

export const User = {
  // Create user
  async create(data) {
    const { email, password, role } = data;
    const [result] = await db.execute(
      `INSERT INTO Users (email, password, role) VALUES (?, ?, ?)`,
      [email, password, role]
    );
    return result.insertId;
  },

  // Get all users
  async findAll() {
    const [rows] = await db.execute(
      "SELECT * FROM Users ORDER BY created_at DESC"
    );
    return rows;
  },

  // Get user by ID
  async findById(user_id) {
    const [rows] = await db.execute(
      "SELECT * FROM Users WHERE user_id = ?",
      [user_id]
    );
    return rows[0];
  },

  // Update user
  async update(user_id, data) {
    const { email, password, role } = data;
    const [result] = await db.execute(
      `UPDATE Users SET email = ?, password = ?, role = ? WHERE user_id = ?`,
      [email, password, role, user_id]
    );
    return result.affectedRows;
  },

  // Delete user
  async delete(user_id) {
    const [result] = await db.execute(
      "DELETE FROM Users WHERE user_id = ?",
      [user_id]
    );
    return result.affectedRows;
  }
};
