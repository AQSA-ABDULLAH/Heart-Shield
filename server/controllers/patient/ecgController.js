const EcgData = require("../../models/EcgData");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const Patient = require("../../models/Patient");
const Appointment = require("../../models/Appointment");

// Python API ka URL
const PYTHON_API_URL = process.env.PYTHON_API_URL;

// POST /api/ecg/submit
const submitEcgData = async (req, res) => {
  try {
    const {
      age,
      gender,
      cholesterolLevel,
      smokingHistory,
      bloodPressure,
      patientId,
    } = req.body;

    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is missing." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No ECG file was uploaded." });
    }

    const ecgFilePath = req.file.path;
    let analysisData = { status: "Pending" };

    // --- Python AI Server ko Call Karein ---
    try {
      const aiFormData = new FormData();
      aiFormData.append("file", fs.createReadStream(ecgFilePath));

      console.log("Sending file to Python AI server...");
      const aiResponse = await axios.post(PYTHON_API_URL, aiFormData, {
        headers: aiFormData.getHeaders(),
      });

      console.log("AI Server Response:", aiResponse.data);
      analysisData = {
        status: "Completed",
        ...aiResponse.data,
      };
    } catch (aiError) {
      console.error("AI Server Error:", aiError.message);
      analysisData = { status: "Failed" };
    }

    const newEcgData = new EcgData({
      patientId,
      age,
      gender,
      cholesterolLevel,
      smokingHistory,
      bloodPressure,
      ecgFilePath,
      analysisResult: analysisData,
    });

    await newEcgData.save();

    // --- 2. NOTIFICATION LOGIC ---
    try {
        const patient = await Patient.findById(patientId).select("fullName");
        const patientName = patient ? patient.fullName.split(' ')[0] : 'Aap';

        if (analysisData.status === "Completed") {
            // Risk ko percentage mein convert karein
            const riskPercent = (analysisData.Overall_Risk * 100).toFixed(0);
            await createNotification(
                patientId,
                `Congratulations, ${patientName}! Your AI risk report is ready. Your Overall Risk is ${riskPercent}%.`,
                'REPORT_READY',
                `/report-details/${newEcgData._id}` // Patient ka report link
            );
        } else if (analysisData.status === "Failed") {
            await createNotification(
                patientId,
                `${patientName}, your ECG file has been uploaded, but the AI analysis failed. We are looking into it.`,
                'ECG_UPLOAD', // Ya 'ANALYSIS_FAILED' type
                `/ecg-history/${newEcgData._id}`
            );
        }
    } catch (notificationError) {
        console.error("Failed to create notification:", notificationError);
        // Error ko ignore karein, taake main response na ruke
    }
    // ---------------------------------


    res.status(201).json({
      message: "ECG data submitted successfully!",
      data: newEcgData,
    });
  } catch (error) {
    console.error("Error submitting ECG data:", error);
    res
      .status(500)
      .json({ message: "Error submitting ECG data", error: error.message });
  }
};

// GET /api/ecg/:patientId
const getEcgHistory = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    
    const records = await EcgData.find({ patientId: patientId })
      .sort({ createdAt: -1 })
      .lean();

    if (!records || records.length === 0) {
      return res
        .status(404)
        .json({ message: "No ECG records found for this patient." });
    }

    // 2. Patient ki saari appointments fetch karein (sirf report aur notes)
    const appointments = await Appointment.find({ patient: patientId }).select(
      "report notes"
    );

    // 3. Appointments ko ek Map mein daalein taake tezi se lookup kar sakein
    // Key = reportId (string mein), Value = notes
    const notesMap = new Map();
    appointments.forEach((app) => {
      if (app.report && app.notes) {
        notesMap.set(app.report.toString(), app.notes);
      }
    });

    // 4. EcgData records ke saath notes ko merge karein
    const recordsWithNotes = records.map((record) => {
      // Agar consultation "Done" hai, toh prescription notes dhoondein
      if (record.consultationStatus === "Done") {
        
        // Naya field 'prescriptionNotes' add karein
        // Yeh notesMap se milega, ya null hoga
        record.prescriptionNotes = notesMap.get(record._id.toString()) || null;
      }
      
      return record;
    });

    res.status(200).json(recordsWithNotes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching ECG history", error: error.message });
  }
};

// --- 2. ADDED NEW PDF DOWNLOAD FUNCTION ---

// GET /api/ecg/report/:recordId
const downloadEcgReport = async (req, res) => {
  try {
    const recordId = req.params.recordId;

    // Find the record AND populate the 'patientId' field
    // This replaces the patientId with the actual patient document
    // Make sure your 'ref' in EcgData schema is correct (e.g., 'patients')
    const record = await EcgData.findById(recordId).populate("patientId");

    if (!record) {
      return res.status(404).json({ message: "Report not found." });
    }
    
    // Check if patient data was populated
    if (!record.patientId) {
       return res.status(404).json({ message: "Patient data not found for this report." });
    }

    // --- Start PDF Generation ---
    const doc = new PDFDocument({ margin: 50 });

    // Set headers for PDF download
    const filename = `HeartShield-Report-${record._id}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Pipe the PDF content directly to the response
    doc.pipe(res);

    // --- Add Content to PDF ---
    
    // Header
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("HeartShield - Patient Report", { align: "center" });
    doc.moveDown(2);

    // --- Patient Details ---
    // !! IMPORTANT: Update 'name' and 'email' to match your Patient schema fields
    doc.fontSize(14).font("Helvetica-Bold").text("Patient Details");
    doc.fontSize(12).font("Helvetica").text(
      `Name: ${record.patientId.name || 'N/A'}` // e.g., record.patientId.firstName + ' ' + record.patientId.lastName
    );
    doc.text(
      `Email: ${record.patientId.email || 'N/A'}` // e.g., record.patientId.emailAddress
    );
     doc.text(
      `Patient ID: ${record.patientId._id}`
    );
    doc.moveDown(1.5);

    // --- Report & Clinical Data ---
    doc.fontSize(14).font("Helvetica-Bold").text("Submitted Report Data");
    doc.fontSize(12).font("Helvetica");
    
    // Use columns for better layout
    const col1X = 50;
    const col2X = 300;
    
    doc.text(`Report ID: ${record._id}`, col1X);
    doc.text(`Report Date: ${new Date(record.createdAt).toLocaleDateString()}`, col2X);
    doc.text(`Age: ${record.age}`, col1X);
    doc.text(`Gender: ${record.gender}`, col2X);
    doc.text(`Smoking History: ${record.smokingHistory}`, col1X);
    doc.text(`Blood Pressure: ${record.bloodPressure || "N/A"}`, col2X);
    doc.text(`Cholesterol Level: ${record.cholesterolLevel || "N/A"}`, col1X);
    doc.moveDown(1.5);

    // --- Analysis Results ---
    doc.fontSize(14).font("Helvetica-Bold").text("ECG Analysis Results");
    doc.moveDown(0.5);
    
    const result = record.analysisResult;
    doc.fontSize(12).font("Helvetica").text(
      `Analysis Status: ${result.status}`
    );

    if (result.status === "Completed") {
      // Determine risk level and color
      const isHighRisk = result.Overall_Risk > 0.5;
      const riskColor = isHighRisk ? "red" : "green";
      const riskText = isHighRisk ? "High Risk" : "Low Risk";

      doc.moveDown(0.5);
      doc
        .font("Helvetica-Bold")
        .fillColor(riskColor)
        .text(`Overall Risk: ${result.Overall_Risk.toFixed(2)} (${riskText})`);
      
      doc.moveDown(0.5);
      doc
        .font("Helvetica")
        .fillColor("black") // Reset color
        .text(`Coronary Artery Disease (CAD): ${result.CAD.toFixed(2)}`);
      doc.text(`Heart Failure (HF): ${result.HF.toFixed(2)}`);
      doc.text(`Arrhythmia (ARR): ${result.ARR.toFixed(2)}`);
    } else {
      doc.text("Analysis could not be completed for this record.");
    }
    
    // --- Finalize the PDF ---
    doc.end();

  } catch (error) {
    console.error("Error generating PDF report:", error);
    res
      .status(500)
      .json({ message: "Error generating PDF report", error: error.message });
  }
};


// --- 3. EXPORT THE NEW FUNCTION ---
module.exports = {
  submitEcgData,
  getEcgHistory,
  downloadEcgReport, // <-- Export new function
};