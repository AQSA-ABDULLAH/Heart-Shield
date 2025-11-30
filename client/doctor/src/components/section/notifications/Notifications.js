import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaBell, FaCheckDouble } from "react-icons/fa";
import { getUserIdFromToken } from "../../../utils/auth"; // (Aap ka auth helper)

const DoctorNotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCount, setNewCount] = useState(0);
  
  const API_URL = process.env.REACT_APP_API_URL;
  const doctorId = getUserIdFromToken(); // Logged-in doctor ki ID

  // --- 1. Notifications Fetch Karein ---
  const fetchNotifications = useCallback(async () => {
    if (!doctorId) {
      setError("No doctor ID found. Please log in.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      // (Naya route istemal karein)
      const res = await axios.get(
        `${API_URL}/api/notifications/doctor/${doctorId}`, 
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setNotifications(res.data.notifications);
      setNewCount(res.data.newCount);
      setError(null);
    } catch (err) {
      setError("Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  }, [API_URL, doctorId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // --- 2. Sabko "Read" Mark Karein ---
  const handleMarkAllRead = async () => {
    if (!doctorId || newCount === 0) return;
    try {
      const token = localStorage.getItem("access_token");
      await axios.patch(
        // (Naya route istemal karein)
        `${API_URL}/api/notifications/doctor/mark-read/${doctorId}`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      // Refresh karein
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto p-8">
      <div className="flex flex-col gap-5">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <p className="text-sm text-gray-500 mb-4">
          Updates and messages regarding patient cases.
        </p>
        {newCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition"
          >
            <FaCheckDouble />
            Mark All as Read ({newCount} new)
          </button>
        )}
      </div>

      {loading && <p>Loading notifications...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && (
        <div className="bg-white overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem key={notification._id} notification={notification} />
              ))
            ) : (
              <li className="p-6 text-center text-gray-500">
                You have no notifications.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

// --- Single Notification Item (Helper) ---
const NotificationItem = ({ notification }) => {
  const getIcon = (type) => {
    switch(type) {
      case 'APPOINTMENT_BOOKED':
        return <FaBell className="text-blue-500" />;
      case 'ACCOUNT_APPROVED':
        return <FaCheckDouble className="text-green-500" />;
      case 'ACCOUNT_REJECTED':
        return <FaBell className="text-red-500" />;
      default:
        return <FaBell className="text-gray-400" />;
    }
  };

  return (
    <li className={`p-6 flex items-start gap-4 ${notification.isNew ? "bg-red-50" : "bg-white"}`}>
      <div className="text-2xl mt-1">
        {getIcon(notification.type)}
      </div>
      <div className="flex-1">
        <p className={`text-gray-700 ${notification.isNew ? "font-semibold" : ""}`}>
          {notification.message}
        </p>
        <span className="text-sm text-gray-400">
          {new Date(notification.createdAt).toLocaleString()}
        </span>
      </div>
      {notification.isNew && (
        <div className="w-3 h-3 bg-red-500 rounded-full mt-2" title="New"></div>
      )}
    </li>
  );
};

export default DoctorNotificationsPanel;