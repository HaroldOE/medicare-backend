import { Doctor } from "../models/doctor.model.js";

export const DoctorController = {
  // Create a doctor

  async create(data) {
    const {
      user_id,
      name,
      specialization,
      license,
      availability,
      rating = 0,
      is_live = false,
    } = data;
    const [result] = await db.execute(
      `INSERT INTO Doctors (user_id, name, specialization, license, availability, rating, is_live)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, name, specialization, license, availability, rating, is_live]
    );
    return result.insertId;
  },

  // async create(req, res) {
  //   try {
  //     const doctorId = await Doctor.create(req.body);
  //     res.json({ message: "Doctor created successfully", doctorId });
  //   } catch (error) {
  //     console.error("Error creating doctor:", error);
  //     res.status(500).json({ error: error.message });
  //   }
  // },

  // Get all doctors
  async findAll(req, res) {
    try {
      const doctors = await Doctor.findAll();
      res.json(doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get doctor by ID
  async findById(req, res) {
    try {
      const doctor = await Doctor.findById(req.params.id);
      if (!doctor) return res.status(404).json({ message: "Doctor not found" });
      res.json(doctor);
    } catch (error) {
      console.error("Error fetching doctor:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update doctor
  async update(req, res) {
    try {
      const affected = await Doctor.update(req.params.id, req.body);
      res.json({ message: `${affected} record(s) updated` });
    } catch (error) {
      console.error("Error updating doctor:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete doctor
  async delete(req, res) {
    try {
      const affected = await Doctor.delete(req.params.id);
      res.json({ message: `${affected} record(s) deleted` });
    } catch (error) {
      console.error("Error deleting doctor:", error);
      res.status(500).json({ error: error.message });
    }
  },
};
