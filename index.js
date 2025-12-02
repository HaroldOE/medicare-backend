import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// import endpoints
import userRouter from "./routes/user.routes.js";
import patientRouter from "./routes/patient.route.js";
import doctorsRouter from "./routes/doctor.routes.js";
import authRoutes from "./routes/auth.routes.js";
import consultationRouter from "./routes/consultation.routes.js";
import inventoryRouter from "./routes/inventory.route.js";

// import tables
import { createDoctorsTable } from "./models/doctor.model.js";
import { createPatientsTable } from "./models/patient.model.js";
import { createUsersTable } from "./models/user.model.js";
import { createInventoryTable } from "./models/inventory.model.js";
import { createConsultationTable } from "./models/consultation.model.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

// initialize tables
await createUsersTable(); // Must run BEFORE creating Patients or Doctors
await createPatientsTable();
await createDoctorsTable();
await createInventoryTable();
await createConsultationTable();

// define routes
app.use("/api/user", userRouter);
app.use("/api/patients", patientRouter);
app.use("/api/doctors", doctorsRouter);
app.use("/api/auth", authRoutes);
app.use("/api/consultations", consultationRouter);
app.use("/api/inventory", inventoryRouter);

app.get("/api/test", (req, res) => {
  return res.status(200).json({ message: "everywhere good" });
});

app.listen(PORT, () => {
  console.log(`server is listening on http://localhost:${PORT}`);
});
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { CreateMedTable } from "./model/medicine.model.js";
import medicineRouter from "./Routes/medicine.route.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/medicine", medicineRouter);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {

    await CreateMedTable();  
    console.log("Medicine table checked/created.");

    app.get("/api/test", (req, res) => {
      res.status(200).json({ message: "everywhere good" });
    });

    app.get("/farmers", (req, res) => {
      res.status(200).json({ message: "medicine db" });
    });

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
