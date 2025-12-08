import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fileUpload from "express-fileupload";
// import endpoints
import userRouter from "./routes/user.routes.js";
import patientRouter from "./routes/patient.route.js";
import doctorsRouter from "./routes/doctor.routes.js";
import authRoutes from "./routes/auth.routes.js";
import consultationRouter from "./routes/consultation.routes.js";
import inventoryRouter from "./routes/inventory.route.js";
import excelRouter from "./routes/excel.route.js";

// import tables
import { createDoctorsTable } from "./models/doctor.model.js";
import { createPatientsTable } from "./models/patient.model.js";
import { createUsersTable } from "./models/user.model.js";
import { createInventoryTable } from "./models/inventory.model.js";
import { createConsultationTable } from "./models/consultation.model.js";
// import { addIsLiveColumnToDoctors } from "./models/doctor.model.js";
import { AppointmentModel } from "./models/appointment.model.js";

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
await AppointmentModel.createAppointmentTable();
// await addIsLiveColumnToDoctors();

app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    tempFileDir: "/tmp/",
    useTempFiles: true,
  })
);

// define routes
app.use("/api/user", userRouter);
app.use("/api/patients", patientRouter);
app.use("/api/doctors", doctorsRouter);
app.use("/api/auth", authRoutes);
app.use("/api/consultations", consultationRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/data", excelRouter);

app.get("/api/test", (req, res) => {
  return res.status(200).json({ message: "everywhere good" });
});

app.listen(PORT, () => {
  console.log(`server is listening on http://localhost:${PORT}`);
});
