const Patient = require("../../models/Patient");
const Doctor = require("../../models/Doctor");

exports.getAdminDashboardData = async (req, res) => {
  try {
    // 1. Parallel queries run karein (Faster execution)
    const [totalPatients, totalDoctors] = await Promise.all([
      Patient.countDocuments({}), // Saare patients count karein
      Doctor.countDocuments({})   // Saare doctors count karein
    ]);

    // Agar aapko sirf 'Verified' doctors count karne hain to ye use karein:
    // Doctor.countDocuments({ is_verified: true })

    // 2. Response bhejein
    res.status(200).json({
      success: true,
      data: {
        totalPatients, // Frontend pe 2456 ki jagah ye value ayegi
        totalDoctors   // Frontend pe 186 ki jagah ye value ayegi
      }
    });

  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching admin data", 
      error: error.message 
    });
  }
};