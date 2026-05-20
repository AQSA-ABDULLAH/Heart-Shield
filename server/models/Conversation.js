const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    doctorId:  { type: String, required: true },
    patientId: { type: String, required: true },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    unreadDoctor:  { type: Number, default: 0 },   // unread count for doctor
    unreadPatient: { type: Number, default: 0 },   // unread count for patient
  },
  { timestamps: true }
);

// Ensure one conversation per doctor-patient pair
conversationSchema.index({ doctorId: 1, patientId: 1 }, { unique: true });

module.exports = mongoose.model("Conversation", conversationSchema);