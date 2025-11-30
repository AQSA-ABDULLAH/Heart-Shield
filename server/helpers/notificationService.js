const Notification = require('../models/notificationModel');

// -------------------------------------------------------
// 🔔 1. Patient Notification Helper
// -------------------------------------------------------
const createNotification = async (patientId, message, type, link) => {
  try {
    const notification = new Notification({
      user: patientId,      // patient field
      message: message,
      type: type,
      link: link || "#",
      isNew: true
    });

    await notification.save();
    console.log(`Patient Notification → ${message}`);
  } catch (error) {
    console.error("Error creating patient notification:", error);
  }
};


// -------------------------------------------------------
// 🔔 2. Doctor Notification Helper
// -------------------------------------------------------
const createDoctorNotification = async (doctorId, message, type, link) => {
  try {
    const notification = new Notification({
      doctor: doctorId,    // doctor field
      message: message,
      type: type,
      link: link || "#",
      isNew: true
    });

    await notification.save();
    console.log(`Doctor Notification → ${message}`);
  } catch (error) {
    console.error("Error creating doctor notification:", error);
  }
};


module.exports = {
  createNotification,
  createDoctorNotification
};
