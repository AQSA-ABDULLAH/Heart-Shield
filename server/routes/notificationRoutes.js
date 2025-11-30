const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notifications/notificationController');

// Patient specific route
router.get('/patient/:patientId', notificationController.getPatientNotifications);
router.patch('/patient/mark-read/:patientId', notificationController.markAllAsRead);

// Doctor specific route (Separated function)
router.get('/doctor/:doctorId', notificationController.getDoctorNotifications);
router.patch('/doctor/mark-read/:doctorId', notificationController.markAllAsRead);

module.exports = router;