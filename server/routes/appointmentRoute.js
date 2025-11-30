const express = require('express');
const router = express.Router();
const { 
  bookAppointment, 
  getApprovedReports 
} = require('../controllers/consult-doctor/appointmentController');
const { 
  getCaseDetails, 
  reviewCase 
} = require('../controllers/consult-doctor/doctorCaseController');

// Book appointment
router.post('/book-appointment', bookAppointment);

// Get case details
router.get('/case/:appointmentId/:doctorId', getCaseDetails);

// Submit review (approve/reject)
router.post('/review/:appointmentId/:doctorId', reviewCase);

// Get all approved/completed reports for a doctor
router.get('/approved-reports/:doctorId', getApprovedReports);

module.exports = router;
