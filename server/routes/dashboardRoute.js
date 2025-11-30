const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/patient/dashboardController");
const doctorDashboardController = require("../controllers/doctor/doctorDashboardController");
const adminController = require("../controllers/patient/adminDashboardController");

router.get("/adminDashboard", adminController.getAdminDashboardData);
router.get("/:patientId", dashboardController.getDashboardData);
router.get("/doctor/:doctorId", doctorDashboardController.getDoctorDashboardData);


module.exports = router;