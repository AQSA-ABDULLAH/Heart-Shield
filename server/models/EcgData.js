const mongoose = require("mongoose");

const ecgDataSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patients",
      required: true,
    },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    cholesterolLevel: { type: String },
    smokingHistory: { type: String, required: true },
    bloodPressure: { type: String },
    ecgFilePath: { type: String, required: true },
    consultationStatus: {
      type: String,
      enum: ["Pending", "Done"], // 'Pending' for not requested, 'Done' for requested
      default: "Pending",
    },

    analysisResult: {
      status: {
        type: String,
        enum: ["Pending", "Completed", "Failed"],
        default: "Pending",
      },
      CAD: { type: Number },
      HF: { type: Number },
      ARR: { type: Number },
      Overall_Risk: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

const EcgData = mongoose.model("EcgData", ecgDataSchema);
module.exports = EcgData;
