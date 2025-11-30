const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Patient ID (optional for doctor notifications)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patients", 
      required: false, 
    },

    // Doctor ID (optional for patient notifications)
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctors",
      required: false, 
    },

    // Notification message
    message: {
      type: String,
      required: true,
    },

    // Is it new?
    isNew: {
      type: Boolean,
      default: true,
    },

    // Redirect link
    link: {
      type: String,
      default: "#",
    },

    // Notification type
    type: {
      type: String,
      enum: [
        "ECG_UPLOAD",
        "REPORT_READY",
        "DOCTOR_VIEWED",
        "APPOINTMENT_BOOKED",
        "PRESCRIPTION_ADDED",
        "ACCOUNT_APPROVED",
        "ACCOUNT_REJECTED",
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("notifications", notificationSchema);
module.exports = Notification;
