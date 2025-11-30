// Is file ko 'controllers/doctor/' folder mein rakhein
const Doctor = require("../../models/Doctor"); // (Aap ke doosre controllers ke hisab se)
const Appointment = require("../../models/Appointment");
const Notification = require("../../models/notificationModel");

exports.getDoctorDashboardData = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required." });
    }

    // --- 1. Doctor ka Naam Fetch Karein ---
    const doctor = await Doctor.findById(doctorId).select("fullName");
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // --- 2. Pending Reviews Count ---
    // (Aap ke schema ke mutabiq, "pending" aur "view" status wale cases)
    const pendingReviews = await Appointment.countDocuments({
      doctor: doctorId,
      status: { $in: ["pending", "view"] },
    });

    // --- 3. Approved Reports Count ---
    // (Aap ke schema ke mutabiq, "completed" status wale cases)
    const approvedReports = await Appointment.countDocuments({
      doctor: doctorId,
      status: "completed",
    });

  // --- 4. Unread Notifications Count (FIXED) ---
    // Ab hum 0 ki jagah real count fetch karenge
    const unreadNotifications = await Notification.countDocuments({
      doctor: doctorId,
      isNew: true
    });

    // --- 5. Saara Data Bhejein ---
    res.status(200).json({
      doctorName: doctor.fullName,
      pendingReviews,
      approvedReports,
      unreadNotifications,
    });
  } catch (error) {
    console.error("Error fetching doctor dashboard data:", error);
    res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};