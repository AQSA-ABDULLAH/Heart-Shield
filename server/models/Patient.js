const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const patientsSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, trim: true, required: true, unique: true },
  phoneNumber: { type: String, trim: true },
  password: { type: String, required: true, trim: true },
  age: { type: Number, trim: true },
  is_admin: { type: Boolean, default: false, required: true },
  is_verified: { type: Boolean, default: false },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: { type: Date },
});

const Patient = mongoose.model("patients", patientsSchema);
module.exports = Patient;
