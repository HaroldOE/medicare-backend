import { 
  createMedicine, 
  findAllMedicine, 
  deleteMedicine, 
  getMedicineById, 
  updateMedicine 
} from "../model/medicine.model.js";

// CREATE MEDICINE
export const medicineController = async (req, res) => {
  try {
    const { med_name, manufacturer, batch_number, expiry_date, price } = req.body;

    if (!med_name || !manufacturer || !batch_number || !expiry_date || !price) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    await createMedicine({ med_name, manufacturer, batch_number, expiry_date, price });

    return res.status(201).json({
      success: true,
      message: "Medicine created successfully",
    });

  } catch (error) {
    console.error("Error creating medicine", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred creating medicine",
      error: error.message,
    });
  }
};

// GET ALL MEDICINE
export const findAllMedicineController = async (req, res) => {
  try {
    const allMedicine = await findAllMedicine();

    return res.status(200).json({
      success: true,
      message: "All medicine fetched successfully",
      data: allMedicine,
    });

  } catch (error) {
    console.error("Error fetching medicine", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching medicine",
      error: error.message,
    });
  }
};

// GET MEDICINE BY ID
export const getMedicineByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required",
      });
    }

    const medicine = await getMedicineById(id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: `No medicine found with id ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Medicine found",
      data: medicine,
    });

  } catch (error) {
    console.error("Error getting medicine by ID", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE MEDICINE
export const deleteMedicineController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required",
      });
    }

    const medicine = await getMedicineById(id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: `No medicine found with id ${id}`,
      });
    }

    await deleteMedicine(id);

    return res.status(200).json({
      success: true,
      message: "Medicine deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting medicine", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE MEDICINE
export const updateMedicineController = async (req, res) => {
  try {
    const { id } = req.params;
    const { med_name, manufacturer, batch_number, expiry_date, price } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required",
      });
    }

    const update = { med_name, manufacturer, batch_number, expiry_date, price };

    Object.keys(update).forEach(
      (key) => update[key] === undefined && delete update[key]
    );

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
    }

    const existing = await getMedicineById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `No medicine found with id ${id}`,
      });
    }

    await updateMedicine(id, update);

    const updated = await getMedicineById(id);

    return res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      data: updated,
    });

  } catch (error) {
    console.error("Error updating medicine", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
