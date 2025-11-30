const Patient = require("../../models/Patient");
const EcgData = require("../../models/EcgData");
const Appointment = require("../../models/Appointment");
const Notification = require("../../models/notificationModel");

exports.getDashboardData = async (req, res) => {
  try {
    const { patientId } = req.params;

    // 1. Patient ka Naam Fetch Karein
    const patient = await Patient.findById(patientId).select("fullName");
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // 2. Report Counts Fetch Karein
    // Total reports
    const totalReports = await EcgData.countDocuments({ patientId: patientId });

    // Is mahine ke reports
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const uploadsThisMonth = await EcgData.countDocuments({
      patientId: patientId,
      createdAt: { $gte: startOfMonth },
    });

    // 3. Current Risk Level Fetch Karein
    // Hum sab se latest 'completed' appointment dhoondhenge
    const latestAppointment = await Appointment.findOne({
      patient: patientId,
      status: "completed",
    }).sort({ updatedAt: -1 }); // Sab se naya review

    let currentRiskLevel = "N/A";

    if (latestAppointment && latestAppointment.risk) {
      // Doctor ka final risk (e.g., "Low Risk", "High Risk")
      // Hum UI ke hisab se "Low" ya "High" mein convert kar rahe hain
      currentRiskLevel = latestAppointment.risk.includes("Low") ? "Low" : "High";
    } else {
      // Agar koi completed appointment nahi hai, toh sab se naya AI report dekhein
      const latestReport = await EcgData.findOne({
        patientId: patientId,
        "analysisResult.status": "Completed",
      }).sort({ createdAt: -1 });

      if (latestReport && latestReport.analysisResult.Overall_Risk != null) {
        const riskValue = latestReport.analysisResult.Overall_Risk;
        // Aap ke doosre code ke mutabiq, 0.5 se oopar high risk hai
        currentRiskLevel = riskValue >= 0.5 ? "High" : "Low";
      }
    }
    
    // 4. Recent Notifications Fetch Karein
    // Dashboard par dikhane ke liye sirf 5 sab se nayi notifications
    const recentNotifications = await Notification.find({ user: patientId })
      .sort({ createdAt: -1 })
      .limit(5); // UI ke liye sirf 5 kaafi hain

    // 5. Saara Data Bhejein
    res.status(200).json({
      patientName: patient.fullName,
      uploadsThisMonth,
      totalReports,
      currentRiskLevel,
      recentNotifications,
    });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res
      .status(500)
      .json({ message: "Server error fetching dashboard data", error: error.message });
  }
};