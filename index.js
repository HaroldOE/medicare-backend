import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// import endpoints
// import tables
import { createDoctorsTable } from "./models/doctor.model.js";
import { createPatientsTable } from "./models/patient.model.js";
import { createUsersTable } from "./models/user.model.js";

await createUsersTable(); // Must run BEFORE creating Patients or Doctors
await createPatientsTable();
await createDoctorsTable();

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

app.get("/api/test", (req, res) => {
  return res.status(200).json({ message: "everywhere good" });
});

app.listen(PORT, () => {
  console.log(`server is listening on http://localhost:${PORT}`);
});
