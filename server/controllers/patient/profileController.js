const Patient = require("../../models/Patient");
const bcrypt = require("bcryptjs");

// GET /get-patients
const EXCLUDED_PATIENT_IDS = ["682a630550eb09e5a9e3c3aa"];

const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find({
      deletedAt: null,
      _id: { $nin: EXCLUDED_PATIENT_IDS },
    });

    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: "Error fetching patients", error });
  }
};


// GET /get-patient/:id
const getPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      deletedAt: null,
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: "Error fetching patient", error });
  }
};

// DELETE /delete-patient/:id (Soft Delete)
const deletePatient = async (req, res) => {
  try {
    const deletedPatient = await Patient.findByIdAndDelete(req.params.id);

    if (!deletedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res
      .status(200)
      .json({
        message: "Patient deleted permanently",
        patient: deletedPatient,
      });
  } catch (error) {
    res.status(500).json({ message: "Error deleting patient", error });
  }
};

// NAYA FUNCTION: Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    
    // Step 1: Request body se authenticated user ki ID lena (jo auth middleware ne add ki hai)
    const userId = req.userId;

    // Validation 1: Check karein naya password aur confirm password match karte hain
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New passwords do not match." });
    }

    // Step 2: User ko database se fetch karna (middleware ne already req.patient mein daal diya hai)
    const patient = req.patient;

    // Step 3: Current password ko verify karna
    const isMatch = await bcrypt.compare(currentPassword, patient.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid current password." });
    }

    // Step 4: Naye password ko hash karna
    // Note: Aapko apne Patient model ke pre-save hook ko check karna chahiye.
    // Agar wahan password hashing ho rahi hai, toh yahan direct save kar sakte hain.
    // Agar nahi, toh yahan hash karna zaroori hai.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Step 5: Naya hashed password database mein update karna
    patient.password = hashedPassword;
    
    // (Optional Security Step) Purane tokens ko invalidate karna (sirf current ko chhod kar)
    // patient.tokens = patient.tokens.filter(tokenDoc => tokenDoc.token === req.token);

    await patient.save();

    res.status(200).json({ message: "Password updated successfully." });

  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error updating password", error });
  }
};

module.exports = {
  getAllPatients,
  getPatient,
  deletePatient,
  changePassword, 
};

