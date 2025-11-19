import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// import endpoints
import userRouter from "./routes/user.routes.js";
import patientRouter from "./routes/patient.route.js";
import doctorsRouter from "./routes/doctor.routes.js";

// import tables
import { createDoctorsTable } from "./models/doctor.model.js";
import { createPatientsTable } from "./models/patient.model.js";
import { createUsersTable } from "./models/user.model.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

// initialize tables
await createUsersTable(); // Must run BEFORE creating Patients or Doctors
await createPatientsTable();
await createDoctorsTable();

app.use("/api/user", userRouter);
app.use("/api/patients", patientRouter);
app.use("/api/doctors", doctorsRouter);

app.get("/api/test", (req, res) => {
  return res.status(200).json({ message: "everywhere good" });
});

app.listen(PORT, () => {
  console.log(`server is listening on http://localhost:${PORT}`);
});
