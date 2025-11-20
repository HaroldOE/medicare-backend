import createConnection from "./db.js";

const db = await createConnection();

export const createTransactionsTable = async () => {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS transactions(
        transaction_id INT AUTO_INCREMENT PRIMARY KEY,
        medicine_id INT,
        from_location VARCHAR(255),
        to_location VARCHAR(255),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    console.log("Transactions table created successfully");
  } catch (error) {
    console.error("An error occurred while creating transactions table", error);
    throw error;
  }
};

export const Transactions = {
  // Create
  async create(data) {
    const { medicine_id, from_location, to_location, timestamp } = data;
    const [result] = await db.execute(
      `INSERT INTO transactions (medicine_id, from_location, to_location, timestamp)
       VALUES (?, ?, ?, ?)`,
      [medicine_id, from_location, to_location, timestamp]
    );
    return result.insertId;
  },

  // Get all
  async findAll() {
    const [rows] = await db.execute(
      "SELECT * FROM transactions ORDER BY created_at DESC"
    );
    return rows;
  },

  // Get by ID
  async findById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM transactions WHERE transaction_id = ?",
      [id]
    );
    return rows[0];
  },

  // Update
  async update(id, data) {
    const { medicine_id, from_location, to_location, timestamp } = data;
    const [result] = await db.execute(
      `UPDATE transactions 
       SET medicine_id = ?, from_location = ?, to_location = ?, timestamp = ?
       WHERE transaction_id = ?`,
      [medicine_id, from_location, to_location, timestamp, id]
    );
    return result.affectedRows;
  },

  // Delete
  async delete(id) {
    const [result] = await db.execute(
      "DELETE FROM transactions WHERE transaction_id = ?",
      [id]
    );
    return result.affectedRows;
  },
};
