import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function createConnection() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    console.log("✅ Database connection established successfully");
    return pool;
  } catch (error) {
    console.error("an error occured ", error);
    throw error;
  }
}

export default createConnection;
