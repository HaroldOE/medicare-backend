import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import createConnection from "./models/db.js";
// import { createAdminTable } from "./models/market_price.model.js";
// import { createFamersTable } from "./models/farmers.model.js";
await createConnection();
// await createAdminTable();
// await createFamersTable(); 

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;
app.get("/api/test", (req, res) => {
  return res.status(200).json({ message: "everywhere good" });
});

app.get("/farmers",(req, res)  => {
  return res.status(200).json({message:"farmers db"});
});

app.listen(PORT, () => {
  console.log(`server is listening on http://localhost:${PORT}`);
});
