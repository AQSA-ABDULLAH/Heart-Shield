const mongoose = require('mongoose');
const Appointment = require('../../models/Appointment');
const Doctor = require('../../models/Doctor');
const Patient = require('../../models/Patient'); 
const EcgData = require('../../models/EcgData');

const { 
  createNotification,
  createDoctorNotification
} = require("../../helpers/notificationService");

const sendEmailNotification = require("../../helpers/emailService"); 

// ===========================================================
// 1. BOOK APPOINTMENT
// ===========================================================
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, reportId, patientId } = req.body;

    // --- VALIDATION ---
    if (!patientId || !doctorId || !reportId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: patientId, doctorId, or reportId."
      });
    }

    // --- CHECK DOCTOR ---
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found." });
    }

    // --- CHECK PATIENT --- 
    const patient = await Patient.findById(patientId);
    if (!patient) {
        return res.status(404).json({ success: false, message: "Patient not found." });
    }

    // --- CHECK REPORT ---
    const ecgRecord = await EcgData.findById(reportId);
    if (!ecgRecord) {
      return res.status(404).json({ success: false, message: "ECG report not found." });
    }

    // --- DETERMINE RISK ---
    let determinedRisk = "Unknown";
    if (ecgRecord.analysisResult && typeof ecgRecord.analysisResult.Overall_Risk === "number") {
      determinedRisk = ecgRecord.analysisResult.Overall_Risk > 0.5 ? "High Risk" : "Low Risk";
    }

    // --- UPDATE STATUS ---
    ecgRecord.consultationStatus = "Done";
    await ecgRecord.save();

    // --- SAVE APPOINTMENT ---
    const newAppointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      report: reportId,
      status: "pending",
      risk: determinedRisk,
    });

    await newAppointment.save();

    // ==========================================================
    // 🔔 SEND IN-APP NOTIFICATIONS
    // ==========================================================
    await createNotification(
      patientId,
      `Your consultation with Dr. ${doctor.fullName} has been successfully booked.`,
      "APPOINTMENT_BOOKED",
      `/appointment-status/${newAppointment._id}`
    );

    await createDoctorNotification(
      doctorId,
      `A new appointment has been booked by a patient (${patient.fullName || 'Unknown'}).`,
      "APPOINTMENT_BOOKED",
      `/doctor-appointments/${newAppointment._id}`
    );

    // ==========================================================
    // 📧 SEND EMAIL NOTIFICATIONS
    // ==========================================================
    console.log("--------------- EMAIL DEBUGGING ---------------");
    console.log(`Doctor Email in DB: ${doctor.email}`);
    console.log(`Patient Email in DB: ${patient.email}`);
    
    // 1. Email to Doctor
    if (doctor.email) {
        const doctorEmailContent = `
            <h3>New Appointment Request</h3>
            <p>Hello Dr. ${doctor.fullName},</p>
            <p>A new appointment has been booked.</p>
            <ul>
                <li><strong>Patient:</strong> ${patient.fullName}</li>
                <li><strong>Risk Level:</strong> ${determinedRisk}</li>
                <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
            <p>Please check your dashboard for details.</p>
        `;
        // No await here to prevent blocking, but adding catch block
        sendEmailNotification(doctor.email, "New Patient Appointment", doctorEmailContent)
            .catch(err => console.error("Failed to send Doctor Email:", err));
    }

    // 2. Email to Patient
    if (patient.email) {
        const patientEmailContent = `
            <h3>Appointment Confirmed</h3>
            <p>Hello ${patient.fullName},</p>
            <p>Your appointment with <strong>Dr. ${doctor.fullName}</strong> has been successfully booked.</p>
            <p>We will notify you once the doctor reviews your report.</p>
            <p>Thank you.</p>
        `;
        sendEmailNotification(patient.email, "Appointment Booking Confirmation", patientEmailContent)
             .catch(err => console.error("Failed to send Patient Email:", err));
    }

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully.",
      appointmentId: newAppointment._id,
      doctorName: doctor.fullName,
      risk: determinedRisk
    });

  } catch (error) {
    console.error("Error in booking appointment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while booking appointment.",
      error: error.message
    });
  }
};

// ===========================================================
// 2. GET APPROVED REPORTS (Fixed & Exported)
// ===========================================================
exports.getApprovedReports = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({ success: false, message: "Doctor ID is required." });
    }

    const completedAppointments = await Appointment.find({
      doctor: doctorId,
      status: { $in: ["completed", "approved"] },
    })
      .populate("patient", "fullName age gender")
      .sort({ createdAt: -1 });

    const formattedReports = completedAppointments.map((app) => ({
      appointmentId: app._id,
      patientName: app.patient?.fullName || "Unknown",
      date: app.createdAt,
      risk: app.risk || "Unknown",
      status: app.status
    }));

    return res.status(200).json({
      success: true,
      reports: formattedReports
    });

  } catch (error) {
    console.error("Error fetching approved reports:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching approved reports.",
      error: error.message
    });
  }
};