const mongoose = require("mongoose");
const Notification = require("../../models/notificationModel");

const notificationController = {

  // -----------------------------------------------------------
  // 1. GET DOCTOR NOTIFICATIONS (Strictly for Doctors)
  // -----------------------------------------------------------
  getDoctorNotifications: async (req, res) => {
    // ... imports
    try {
        const { doctorId } = req.params;

        // 1. Validation: Agar ID undefined hai ya valid format nahi hai
        if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
            console.log("❌ Invalid or Missing Doctor ID");
            return res.status(400).json({ success: false, message: "Invalid Doctor ID." });
        }

        // 2. Strict Object ID conversion
        const objectId = new mongoose.Types.ObjectId(doctorId);
        
        // 3. Filter banana (Sirf ek baar declare karein)
        const filter = { doctor: objectId };
        

        // 4. Query Database
        // Note: Hum specifically check kar rahe hain ke 'doctor' field match ho
        const notifications = await Notification.find(filter).sort({ createdAt: -1 });
        
        const newCount = await Notification.countDocuments({ 
            doctor: objectId, 
            isNew: true 
        });

        return res.status(200).json({ success: true, notifications, newCount });

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  },

  // -----------------------------------------------------------
  // 2. GET PATIENT NOTIFICATIONS (Strictly for Patients)
  // -----------------------------------------------------------
  getPatientNotifications: async (req, res) => {
    try {
      const { patientId } = req.params;

      if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
        return res.status(400).json({ success: false, message: "Invalid Patient ID." });
      }

      // STRICT FILTER: Sirf wo notifications jisme 'user' field match kare
      const filter = { user: new mongoose.Types.ObjectId(patientId) };

      const notifications = await Notification.find(filter).sort({ createdAt: -1 });
      const newCount = await Notification.countDocuments({ ...filter, isNew: true });

      return res.status(200).json({ success: true, notifications, newCount });

    } catch (error) {
      return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  },

  // -----------------------------------------------------------
  // 3. MARK ALL AS READ
  // -----------------------------------------------------------
  markAllAsRead: async (req, res) => {
    try {
      const { patientId, doctorId } = req.params;
      let filter = {};

      if (patientId && mongoose.Types.ObjectId.isValid(patientId)) {
        filter = { user: new mongoose.Types.ObjectId(patientId), isNew: true };
      } 
      else if (doctorId && mongoose.Types.ObjectId.isValid(doctorId)) {
        filter = { doctor: new mongoose.Types.ObjectId(doctorId), isNew: true };
      } 
      else {
        return res.status(400).json({ success: false, message: "Invalid ID provided." });
      }

      await Notification.updateMany(filter, { $set: { isNew: false } });

      return res.status(200).json({ success: true, message: "Notifications marked as read." });

    } catch (error) {
      return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }
};

module.exports = notificationController;