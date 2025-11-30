const Patient = require("../../models/Patient.js");
const { hashPassword } = require("../../helpers/hashPassword");
const { createToken } = require("../../helpers/jwt");
const compileEmailTemplate = require("../../helpers/compile-email-template.js");
const mailer = require("../../libs/mailer.js");
const bcrypt = require("bcrypt");

class UserController {
  // User Registration
  static userRegistration = async (req, res) => {
    try {
      const { fullName, email, phoneNumber, password, confirmPassword, age } =
        req.body;

      if (!fullName || !email || !password || !confirmPassword || !age) {
        return res
          .status(422)
          .json({ error: "Please fill in all fields properly" });
      }

      const userExist = await Patient.findOne({ email });
      if (userExist) {
        return res.status(422).json({ error: "User already exists" });
      }

      if (password !== confirmPassword) {
        return res.status(422).json({
          error: "Password and Confirm Password don't match",
        });
      }

      const hashedPassword = await hashPassword(password);

      const newUser = new Patient({
        fullName,
        email,
        phoneNumber,
        password: hashedPassword,
        age,
        is_admin: false,
        is_verified: false,
      });

      const savedUser = await newUser.save();

      // Create JWT Token
      const token = createToken(savedUser, savedUser.is_admin, "1d");

      // Add token to the user's tokens array
      savedUser.tokens.push({ token });
      await savedUser.save();

      console.log("User saved successfully, preparing to send email...");

      // Email template
      const template = await compileEmailTemplate({
        fileName: "register.mjml",
        data: { fullName },
      });

      try {
        await mailer.sendMail(email, "Mail Verification", template);
        return res.status(201).json({
          status: "success",
          message: "User created successfully",
          token,
        });
      } catch (emailError) {
        console.error("Failed to send registration email:", emailError);
        return res.status(500).json({
          error: "User registered, but failed to send email",
        });
      }
    } catch (error) {
      console.error("Error in user registration:", error);
      return res.status(500).json({ error: "Failed to register" });
    }
  };

  // Email Verification
  static mailVerification = async (req, res) => {
    try {
      const id = req.params.id;
      const user = await Patient.findById(id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.is_verified = true;
      await user.save();

      return res.status(200).json({
        status: "success",
        message: "Email verified successfully",
        user,
      });
    } catch (error) {
      console.error("Error in user verification:", error);
      return res.status(500).json({ error: "Failed to verify user" });
    }
  };

  // Update Profile
  static updateProfile = async (req, res) => {
    try {
      const { patientId } = req.params;
      const { fullName, email, phoneNumber } = req.body;

      // check email uniqueness if updating email
      if (email) {
        const existingUser = await Patient.findOne({
          email,
          _id: { $ne: patientId },
        });
        if (existingUser) {
          return res.status(400).json({ error: "Email already in use" });
        }
      }

      const updatedPatient = await Patient.findByIdAndUpdate(
        patientId,
        { fullName, email, phoneNumber, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select("-password -tokens");

      if (!updatedPatient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      return res.json({
        status: "success",
        message: "Profile updated successfully",
        patient: updatedPatient,
      });
    } catch (error) {
      console.error("Error in updating profile:", error);
      return res.status(500).json({ error: "Failed to update profile" });
    }
  };

  // Change Password
  static changePassword = async (req, res) => {
    try {
      const { patientId } = req.params;
      const { currentPassword, newPassword } = req.body;

      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      const isMatch = await bcrypt.compare(currentPassword, patient.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      patient.password = await bcrypt.hash(newPassword, 10);
      patient.updatedAt = new Date();
      await patient.save();

      return res.json({
        status: "success",
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error("Error in changing password:", error);
      return res.status(500).json({ error: "Failed to change password" });
    }
  };



  // Delete Account (User Initiated)
  static deleteAccount = async (req, res) => {
    try {
      const { patientId } = req.params;

      // Check if user exists
      const user = await Patient.findById(patientId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Hard Delete (Database se uda dena)
      await Patient.findByIdAndDelete(patientId);

      return res.status(200).json({
        status: "success",
        message: "Account deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      return res.status(500).json({ error: "Failed to delete account" });
    }
  };
}

module.exports = { UserController };
