const express = require("express");
const { UserController } = require("../controllers/patient/userRegistration"); 
const { userLogin } = require("../controllers/patient/userLogin");
const { ForgetPasswordController } = require("../controllers/patient/forgetPassword");
const ProfileController = require("../controllers/patient/profileController");

const router = express.Router();
require("../db/connection");

// PUBLIC ROUTES
router.post("/patient_signUp", UserController.userRegistration);
router.post("/patient_signIn", userLogin);

// FORGET PASSWORD ROUTES
router.post("/forget-password", ForgetPasswordController.forgetPassword);
router.post("/reset-password", ForgetPasswordController.resetPassword);
router.patch("/update-password", ForgetPasswordController.updatePassword);

// PROTECTED ROUTES
router.put("/update-profile/:patientId", UserController.updateProfile);
router.put("/change-password/:patientId", UserController.changePassword);
router.get("/get-patients", ProfileController.getAllPatients);
router.get("/get-patient/:id", ProfileController.getPatient);
router.delete("/delete-patient/:id", ProfileController.deletePatient);
router.delete("/delete-account/:patientId", UserController.deleteAccount);

module.exports = router;
