import createConnection from "./db.js";

const db = await createConnection();

export const createInventoryTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        inventory_id INT AUTO_INCREMENT PRIMARY KEY,
        clinic_id INT NOT NULL,
        medicine_id INT NOT NULL,
        quantity INT NOT NULL,
        reorder_level INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("Inventory table created successfully");
  } catch (error) {
    console.error("Error creating Inventory table:", error);
    throw error;
  }
};

export const Inventory = {
  // CREATE
  async create(data) {
    const { clinic_id, medicine_id, quantity, reorder_level } = data;

    const [result] = await db.execute(
      `INSERT INTO inventory (clinic_id, medicine_id, quantity, reorder_level)
       VALUES (?, ?, ?, ?)`,
      [clinic_id, medicine_id, quantity, reorder_level]
    );

    return result.insertId;
  },

  // READ – Get All
  async findAll() {
    const [rows] = await db.execute(
      "SELECT * FROM inventory ORDER BY created_at DESC"
    );

    return rows;
  },

  // READ – Get by ID
  async findById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM inventory WHERE inventory_id = ?",
      [id]
    );

    return rows[0];
  },

  // UPDATE
  async update(id, data) {
    const { clinic_id, medicine_id, quantity, reorder_level } = data;

    const [result] = await db.execute(
      `UPDATE inventory
       SET clinic_id = ?, medicine_id = ?, quantity = ?, reorder_level = ?
       WHERE inventory_id = ?`,
      [clinic_id, medicine_id, quantity, reorder_level, id]
    );

    return result.affectedRows;
  },

  // DELETE
  async delete(id) {
    const [result] = await db.execute(
      "DELETE FROM inventory WHERE inventory_id = ?",
      [id]
    );

    return result.affectedRows;
  },
};
