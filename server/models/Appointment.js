const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patients", // Correct: Matches your Patient model
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctors", // Correct: Matches your Doctor model
      required: true,
    },
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EcgData", // CORRECTED: Must match your EcgData model name
      required: true, // Changed: A consultation is for a report
    },
    status: {
      type: String,
      enum: ["pending", "view", "completed"],
      default: "pending",
      required: true,
    },
    risk: {
      type: String,
      enum: ["Low Risk", "High Risk", "Unknown"],
      default: "Low Risk",
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model("appointments", appointmentSchema);
module.exports = Appointment;
