import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function createConnection() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST, // force 127.0.0.1 if not set
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      // port: Number(process.env.DB_PORT) || 3306,

      // THESE ARE THE MISSING LINES THAT FIX ETIMEDOUT
      connectTimeout: 30000, // 30 seconds (default is only 10000)
      acquireTimeout: 30000,
      timeout: 30000,

      // Keep your existing settings
      waitForConnections: true,
      connectionLimit: 100, // you can lower this to 10-20 in dev if you want
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    console.log("✅ Database connection established successfully");
    return pool;
  } catch (error) {
    console.error("an error occured ", error);
    throw error;
  }
}

export default createConnection;
