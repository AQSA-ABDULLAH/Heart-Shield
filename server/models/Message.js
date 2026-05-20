const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: { type: String, required: true },   // userId (doctor or patient)
    senderRole: { type: String, enum: ["doctor", "patient"], required: true },
    text: { type: String, default: "" },
    fileUrl: { type: String, default: null },      // S3 / storage URL
    fileName: { type: String, default: null },
    fileType: { type: String, default: null },     // "image" | "file"
    readBy: [{ type: String }],                   // array of userIds who read it
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);