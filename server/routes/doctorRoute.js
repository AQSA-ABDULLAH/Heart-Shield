const express = require('express');
const { DoctorController } = require('../controllers/doctor/doctorRegistration'); 
const { doctorLogin } = require('../controllers/doctor/doctorLogin');
const ApprovedController = require("../controllers/doctor/adminApproved");
const { getApprovedDoctors } = require('../controllers/consult-doctor/ConsultController');
const { getDoctorCases } = require('../controllers/consult-doctor/doctorCaseController');
const { DoctorForgetPasswordController } = require('../controllers/doctor/doctorForgetPassword');
const router = express.Router();
require("../db/connection")

// PUBLIC ROUTES
router.post("/doctor_signUp", DoctorController.doctorRegistration);
router.patch("/approved", ApprovedController.approved);
router.patch("/reject", ApprovedController.reject);
router.post("/doctor_signIn", doctorLogin);
router.get("/get-doctors", ApprovedController.getAllDoctors);
router.get("/get-user/:id", ApprovedController.getDoctor);
router.get('/approved-list', getApprovedDoctors);
router.get('/review-cases/:doctorId', getDoctorCases);
router.put("/update-profile/:doctorId", DoctorController.updateProfile);
router.put("/change-password/:doctorId", DoctorController.changePassword);
router.delete("/delete-account/:doctorId", DoctorController.deleteAccount);
router.post("/forget-password", DoctorForgetPasswordController.forgetPassword);
router.post("/reset-password", DoctorForgetPasswordController.resetPassword);
router.patch("/update-password", DoctorForgetPasswordController.updatePassword);

router.post("/mail_verification/:id",DoctorController.mailVerification )
// "http://localhost:3000/mail-verification?id='+savedUser._id+'"

module.exports = router;