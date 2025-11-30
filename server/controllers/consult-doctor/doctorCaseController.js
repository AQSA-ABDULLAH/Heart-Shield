const Appointment = require('../../models/Appointment');
const { createNotification, createDoctorNotification } = require("../../helpers/notificationService");
const Doctor = require('../../models/Doctor');
/**
 * @desc    Get all cases for a specific doctor
 * @route   GET /api/doctor/review-cases/:doctorId
 * @access  Public (ID passed in URL)
 */
exports.getDoctorCases = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required." });
    }

    // ✅ Fetch appointments with populated patient and report
    const appointments = await Appointment.find({
      doctor: doctorId,
      status: { $in: ["pending", "view"] },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "patient",
        select: "fullName",
      })
      .populate({
        path: "report",
        select: "createdAt analysisResult",
      });

    const formattedCases = appointments.map((app) => {
      // ✅ Safely read Overall_Risk as a number
      const rawRisk = app.report?.analysisResult?.Overall_Risk;
      const riskPercent = Number(rawRisk) || 0;

      // ✅ Determine risk label
      const riskLabel =
        riskPercent >= 0.50 ? "High Risk" : "Low Risk";

      return {
        appointmentId: app._id,
        name: app.patient?.fullName || "N/A",
        date: app.report
          ? new Date(app.report.createdAt).toLocaleDateString()
          : "N/A",
        risk: riskLabel,
        riskValue: riskPercent, // <-- optional, to verify in frontend
        riskColor:
          riskLabel === "High Risk"
            ? "bg-red-100 text-red-600 border-red-300"
            : "bg-green-100 text-green-600 border-green-300",
      };
    });

    res.status(200).json(formattedCases);
  } catch (error) {
    console.error("Error fetching doctor cases:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * @desc    Get details for a single case
 * @route   GET /api/appointment/case/:appointmentId/:doctorId
 * @access  Public (IDs passed in URL)
 */
exports.getCaseDetails = async (req, res) => {
  try {
    const { appointmentId, doctorId } = req.params;

    if (!appointmentId || !doctorId) {
      return res.status(400).json({ message: 'Appointment ID and Doctor ID are required.' });
    }

    // Find the appointment, ensuring it belongs to THIS doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: doctorId // <-- Security check using doctorId from URL
    })
    .populate({
        path: 'patient',
        select: 'fullName age gender' // Base patient info
    })
    .populate({
        path: 'report', // Get all info from the ECG report
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Case not found or access denied.' });
    }
    
    // Mark as 'viewed' if it was 'pending'
    if (appointment.status === 'pending') {
      appointment.status = 'view';
      await appointment.save();

      // --- 2. NOTIFICATION LOGIC (Scenario 3) ---
        try {
            const doctor = await Doctor.findById(doctorId).select("fullName");
            const doctorName = doctor ? doctor.fullName : 'Doctor';

            await createNotification(
                appointment.patient._id, // Populated patient ka ID
                `Dr. ${doctorName} has started reviewing your report.`,
                'DOCTOR_VIEWED',
                `/appointment-status/${appointment._id}`
            );
        } catch (notificationError) {
            console.error("Failed to create notification:", notificationError);
        }
        // ------------------------------------------
    }

    // --- 💡 FIXED: Populate caseDetails to match frontend ---
    const riskPercent = appointment.report?.analysisResult?.Overall_Risk || 0;
    const riskLabel = riskPercent >= 50 ? "High Risk" : "Low Risk";

    const caseDetails = {
      patient: {
        name: appointment.patient?.fullName || 'N/A',
        // Prioritize data from the report, fall back to patient profile
        age: appointment.report?.age || appointment.patient?.age || 'N/A',
        gender: appointment.report?.gender || appointment.patient?.gender || 'N/A',
        cholesterol: appointment.report?.cholesterolLevel || 'N/A',
        smoking: appointment.report?.smokingHistory || 'N/A',
        bp: appointment.report?.bloodPressure || 'N/A'
      },
      ecg: {
        filePath: appointment.report?.ecgFilePath || null
      },
      aiRisk: {
        riskLabel: riskLabel, // This is what the frontend expects
      },
      notes: appointment.notes || '' // Pre-fill existing notes
    };
    
    res.status(200).json(caseDetails);

  } catch (error) {
    console.error('Error fetching case details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * @desc    Review and complete a case
 * @route   POST /api/appointment/review/:appointmentId/:doctorId
 * @access  Public (IDs passed in URL)
 */

exports.reviewCase = async (req, res) => {
  try {
    const { appointmentId, doctorId } = req.params;
    const { notes, finalRisk } = req.body;

    if (!notes || !finalRisk) {
      return res.status(400).json({
        message: "Notes and final risk decision are required.",
      });
    }

    // ✅ Populate 'patient' here to get the name for the notification message
    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId, doctor: doctorId },
      {
        notes,
        risk: finalRisk,
        status: "completed",
      },
      { new: true }
    ).populate("patient", "fullName"); // <-- Patient name fetch kar rahe hain

    if (!appointment) {
      return res
        .status(404)
        .json({ message: "Case not found or access denied." });
    }

    // --- 🔔 NOTIFICATION LOGIC ---
    try {
        // 1. Notify Patient (Existing)
        const doctor = await Doctor.findById(doctorId).select("fullName");
        const doctorName = doctor ? doctor.fullName : 'Doctor';

        await createNotification(
            appointment.patient._id, 
            `Dr. ${doctorName} has reviewed your case and added a prescription.`,
            'PRESCRIPTION_ADDED',
            `/appointment-status/${appointment._id}`
        );

        // 2. Notify Doctor (NEW ADDITION ✅)
        const patientName = appointment.patient ? appointment.patient.fullName : "the patient";
        
        await createDoctorNotification(
            doctorId,
            `You have successfully reviewed ${patientName}'s case.`,
            'PRESCRIPTION_ADDED',
            `/doctor/dashboard` // Ya jo link doctor ko chahiye
        );

    } catch (notificationError) {
        console.error("Failed to create notification:", notificationError);
    }
    // -----------------------------

    res.status(200).json({
      message: "Case reviewed and completed successfully.",
      appointment,
    });
  } catch (error) {
    console.error("Error reviewing case:", error);
    res.status(500).json({ message: "Server error" });
  }
};