import { Patient } from "../models/patient.model.js";
import { sendEmail } from "../core/email.js";

export const patientController = {
  create: async (req, res) => {
    try {
      const patientId = await Patient.create(req.body);
      res.json({ message: "Patient created", patientId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  findAll: async (req, res) => {
    try {
      const patients = await Patient.findAll();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  findById: async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id);
      res.json(patient);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const affected = await Patient.update(req.params.id, req.body);
      res.json({ message: `${affected} record(s) updated` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const affected = await Patient.delete(req.params.id);
      res.json({ message: `${affected} record(s) deleted` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
