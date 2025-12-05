import createConnection from "./db.js";

const db = await createConnection();

export const AppointmentModel = {
  // 1. CREATE TABLE FUNCTION
  createAppointmentTable: async () => {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS Appointments (
          appointment_id INT AUTO_INCREMENT PRIMARY KEY,
          patient_id INT NOT NULL,
          doctor_id INT NOT NULL,
          appointment_date DATETIME NOT NULL,
          reason TEXT,
          status ENUM('pending', 'approved', 'cancelled', 'completed') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE CASCADE,
          FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id) ON DELETE CASCADE
        )
      `);
      console.log("Appointments table created or already exists");
    } catch (err) {
      console.error("Error creating Appointments table:", err);
    }
  },

  // 2. CREATE NEW APPOINTMENT
  create: async (patient_id, doctor_id, appointment_date, reason) => {
    const [result] = await db.query(
      `INSERT INTO Appointments (patient_id, doctor_id, appointment_date, reason)
       VALUES (?, ?, ?, ?)`,
      [patient_id, doctor_id, appointment_date, reason]
    );
    return result.insertId;
  },

  // 3. GET APPOINTMENTS BY PATIENT
  getPatientAppointments: async (patient_id) => {
    const [rows] = await db.query(
      `SELECT A.*, D.name AS doctor_name, D.specialization
       FROM Appointments A
       JOIN Doctors D ON A.doctor_id = D.doctor_id
       WHERE A.patient_id = ?
       ORDER BY A.appointment_date DESC`,
      [patient_id]
    );
    return rows;
  },

  // 4. GET APPOINTMENTS BY DOCTOR
  getDoctorAppointments: async (doctor_id) => {
    const [rows] = await db.query(
      `SELECT A.*, P.name AS patient_name
       FROM Appointments A
       JOIN Patients P ON A.patient_id = P.patient_id
       WHERE A.doctor_id = ?
       ORDER BY A.appointment_date DESC`,
      [doctor_id]
    );
    return rows;
  },

  // 5. UPDATE APPOINTMENT STATUS
  updateStatus: async (appointment_id, status) => {
    const [result] = await db.query(
      `UPDATE Appointments SET status = ? WHERE appointment_id = ?`,
      [status, appointment_id]
    );
    return result;
  },
};
