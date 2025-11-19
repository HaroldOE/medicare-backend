import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// import cretetables
import { createConsultationTable } from "./models/consultation.model.js";

// import consultationRouter from "./routes/consultaion.routes.js";
import consultationRouter from "./routes/consultation.routes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

// Create necessary tables
await createConsultationTable();

app.use("/api/consultations", consultationRouter);
app.get("/api/test", (req, res) => {
  return res.status(200).json({ message: "everywhere good" });
});

app.listen(PORT, () => {
  console.log(`server is listening on http://localhost:${PORT}`);
});
