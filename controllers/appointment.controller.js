// controllers/appointmentController.js
import { AppointmentModel } from "../models/appointment.model.js";

export const AppointmentController = {
  create: async (req, res) => {
    try {
      const { patient_id, doctor_id, appointment_date, reason } = req.body;

      if (!patient_id || !doctor_id || !appointment_date) {
        return res.status(400).json({ error: "Required fields missing" });
      }

      const appointment_id = await AppointmentModel.create(
        patient_id,
        doctor_id,
        appointment_date,
        reason
      );

      res.json({
        message: "Appointment booked successfully",
        appointment_id,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  },

  getByPatient: async (req, res) => {
    try {
      const { patientId } = req.params;

      const appointments = await AppointmentModel.getPatientAppointments(
        patientId
      );

      res.json(appointments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  },

  getByDoctor: async (req, res) => {
    try {
      const { doctorId } = req.params;

      const appointments = await AppointmentModel.getDoctorAppointments(
        doctorId
      );

      res.json(appointments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const { status } = req.body;

      const valid = ["pending", "approved", "cancelled", "completed"];
      if (!valid.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      await AppointmentModel.updateStatus(appointmentId, status);

      res.json({ message: "Status updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  },
};
