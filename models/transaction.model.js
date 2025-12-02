import createConnection from "./db.js";

const db = await createConnection();

export const createTransactionsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        transaction_id INT AUTO_INCREMENT PRIMARY KEY,
        medicine_id INT NOT NULL,
        from_location VARCHAR(255) NOT NULL,
        to_location VARCHAR(255) NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Transactions table created successfully");
  } catch (error) {
    console.error("An error occurred creating transactions table:", error);
    throw error;
  }
};

export const Transaction = {
  // CREATE
  async create(data) {
    const { medicine_id, from_location, to_location, timestamp } = data;
   
    const [result] = await db.execute(
      `INSERT INTO transactions (medicine_id, from_location, to_location, timestamp)
       VALUES (?, ?, ?, ?)`,
      [medicine_id, from_location, to_location, timestamp || new Date()]
    );
    return result.insertId;
  },

  // GET ALL
  async findAll() {
    const [rows] = await db.execute(
      "SELECT * FROM transactions ORDER BY timestamp DESC"
    );
    return rows;
  },

  // GET BY ID
  async findById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM transactions WHERE transaction_id = ?",
      [id]
    );
    return rows[0];
  },

  // UPDATE
  async update(id, data) {
    const { medicine_id, from_location, to_location, timestamp } = data;
    const [result] = await db.execute(
      `UPDATE transactions 
       SET medicine_id = ?, from_location = ?, to_location = ?, timestamp = ?
       WHERE transaction_id = ?`,
      [medicine_id, from_location, to_location, timestamp || new Date(), id]
    );
    return result.affectedRows;
  },

  // DELETE
  async delete(id) {
    const [result] = await db.execute(
      "DELETE FROM transactions WHERE transaction_id = ?",
      [id]
    );
    return result.affectedRows;
  },
};
