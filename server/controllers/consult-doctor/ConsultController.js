const Doctor = require('../../models/Doctor'); // Adjust path if your model is elsewhere

/**
 * @desc    Get all approved and verified doctors
 * @route   GET /api/doctor/approved-list
 * @access  Public (or protected, depending on your app)
 */
exports.getApprovedDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      is_approved: true   // Only approved doctors
    }).select("fullName email is_verified");

    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Server error while fetching doctors." });
  }
};
