import createConnection from "./db.js";
import crypto from "crypto";

const db = await createConnection();

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
    await db.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token_hash CHAR(64) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
      )
    `);
    console.log("Users and password_resets tables created successfully");
  } catch (err) {
    console.error("Error creating tables", err);
    throw err;
  }
};

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
      "SELECT user_id, email, role, created_at, updated_at FROM Users ORDER BY created_at DESC"
    );
    return rows;
  },

  async findById(user_id) {
    const [rows] = await db.execute("SELECT * FROM Users WHERE user_id = ?", [
      user_id,
    ]);
    return rows[0];
  },

  async findByEmail(email) {
    const [rows] = await db.execute(
      "SELECT * FROM Users WHERE email = ? LIMIT 1",
      [email]
    );
    return rows[0];
  },

  async update(user_id, data) {
    const fields = [];
    const values = [];

    if (data.email !== undefined) {
      fields.push("email = ?");
      values.push(data.email);
    }
    if (data.password !== undefined) {
      fields.push("password = ?");
      values.push(data.password);
    }
    if (data.role !== undefined) {
      fields.push("role = ?");
      values.push(data.role);
    }

    if (fields.length === 0) return 0;
    values.push(user_id);

    const sql = `UPDATE Users SET ${fields.join(
      ", "
    )}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`;
    const [result] = await db.execute(sql, values);
    return result.affectedRows;
  },

  async delete(user_id) {
    const [result] = await db.execute("DELETE FROM Users WHERE user_id = ?", [
      user_id,
    ]);
    return result.affectedRows;
  },

  // Password reset token
  async createPasswordResetToken(user_id, tokenPlain, expiresAt) {
    const tokenHash = crypto
      .createHash("sha256")
      .update(tokenPlain)
      .digest("hex");
    const [result] = await db.execute(
      "INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
      [user_id, tokenHash, expiresAt]
    );
    return result.insertId;
  },

  async findPasswordResetToken(tokenPlain) {
    const tokenHash = crypto
      .createHash("sha256")
      .update(tokenPlain)
      .digest("hex");
    const [rows] = await db.execute(
      "SELECT pr.*, u.email FROM password_resets pr JOIN Users u ON pr.user_id = u.user_id WHERE token_hash = ? LIMIT 1",
      [tokenHash]
    );
    return rows[0];
  },

  async deletePasswordResetTokenById(id) {
    await db.execute("DELETE FROM password_resets WHERE id = ?", [id]);
  },

  async deleteAllResetTokensForUser(user_id) {
    await db.execute("DELETE FROM password_resets WHERE user_id = ?", [
      user_id,
    ]);
  },
};
