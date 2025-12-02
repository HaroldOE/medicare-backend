import { Consultation } from "../models/consultation.model.js";

export const createConsultation = async (req, res) => {
  try {
    const id = await Consultation.create(req.body);
    res.status(201).json({ message: "Consultation created", id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.findAll();
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getConsultationById = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return res.status(404).json({ message: "Consultation not found" });
    res.json(consultation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateConsultation = async (req, res) => {
  try {
    const affectedRows = await Consultation.update(req.params.id, req.body);
    if (affectedRows === 0) return res.status(404).json({ message: "Consultation not found" });
    res.json({ message: "Consultation updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteConsultation = async (req, res) => {
  try {
    const affectedRows = await Consultation.delete(req.params.id);
    if (affectedRows === 0) return res.status(404).json({ message: "Consultation not found" });
    res.json({ message: "Consultation deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
