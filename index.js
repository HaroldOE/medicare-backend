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
