import createConnection from "./db.js";

const db = await createConnection();
export default db;

export const CreateMedTable = async () => {
  try {
    await db.query(`
            CREATE TABLE IF NOT EXISTS medicine (
        id INT AUTO_INCREMENT PRIMARY KEY,
        med_name VARCHAR(255), 
        manufacturer VARCHAR(255) ,
        batch_number VARCHAR(255),
        expiry_date VARCHAR(255),
        price INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
            `);
    console.log("medicine Table created Successfully");
  } catch (error) {
    console.error("error occured while creating medicine table", error);
  }
};

export const createMedicine = async (medicine) => {
  try {
    const { med_name, manufacturer, batch_number, expiry_date, price } =
      medicine;
    const query = `INSERT INTO medicine (med_name, manufacturer, batch_number,expiry_date, price) VALUES(?,?,?,?,?)`;
    // const hashedpassword = bcrypt.hash(password, 10);
    await db.query(query, [
      med_name,
      manufacturer,
      batch_number,
      expiry_date,
      price,
    ]);
    console.log("medicine created successfully");
  } catch (error) {
    console.error("an error occured creating medicine", medicine);
    throw error;
  }
};

export const findAllMedicine = async () => {
  try {
    const [row] = await db.query(`SELECT * FROM medicine`);
    console.log("all medicine found successfully");
    return row;
  } catch (error) {
    console.error("an error occurred fetching all medicine", error);
    throw error;
  }
};

export const getMedicineById = async (id) => {
  try {
    const [row] = await db.query(
      `SELECT * FROM medicine
            WHERE id = ?`,
      [id]
    );
    console.log("medicine id true");
    return row;
  } catch (error) {
    console.error("an error occurred getting by id");
    throw error;
  }
};
export const deleteMedicine = async (id) => {
  try {
    const [row] = await db.query(
      `
        DELETE  FROM medicine
        WHERE ID = ?`,
      [id]
    );
    console.log("medicine deleted");
  } catch (error) {
    console.error("an error occured deleting ");
    throw error;
  }
};

export const updateMedicine = async (id, data) => {
  try {
    const { med_name, manufacturer, batch_number, expiry_date, price } = data;

    const query = `
      UPDATE medicine
      SET
        med_name = ?,
        manufacturer = ?,
        batch_number = ?,
        expiry_date = ?,
        price = ?
      WHERE id = ?
    `;

    const [result] = await db.query(query, [
      med_name,
      manufacturer,
      batch_number,
      expiry_date,
      price,
      id,
    ]);

    console.log("medicine updated");
    return result;
  } catch (error) {
    console.error("error updating medicine", error);
    throw error;
  }
};
