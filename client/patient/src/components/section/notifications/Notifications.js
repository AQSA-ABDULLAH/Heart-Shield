import React, { useState, useEffect } from "react";
// Import your token helper function
import { getUserIdFromToken } from "../../../utils/auth"; // <-- Change the path as needed

const NotificationsPanel = () => {
  // 1. State hooks for notifications, loading, and error
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. useEffect hook to fetch data (when the component loads)
  useEffect(() => {
    // Get patient ID from the token
    const patientId = getUserIdFromToken();

    if (!patientId) {
      setError("Login session not found. Please log in again.");
      setIsLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        // API URL from your .env variable
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

        // API call
        const response = await fetch(
          `${apiUrl}/api/notifications/patient/${patientId}`
        );

        if (!response.ok) {
          throw new Error("There was a problem fetching notifications.");
        }

        const data = await response.json();

        // Save the 'notifications' array from the backend into state
        if (data.success && data.notifications) {
          setNotifications(data.notifications);
        } else {
          throw new Error(data.message || "Incorrect data format.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []); // [] means this effect will run only once when the component loads

  // 3. Render logic (Loading, Error, or Data)
  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  // From here is your original JSX, with some modifications
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-1">Your Notifications</h2>
      <p className="text-gray-500 mb-6">
        See important updates from your doctors and system alerts
      </p>
      <div className="space-y-4">
        {/* 4. Check if there are any notifications */}
        {notifications.length > 0 ? (
          notifications.map((note) => (
            <div
              key={note._id} // <-- Use '_id' from the backend instead of 'id'
              className="bg-gray-100 rounded-xl shadow-sm w-[800px] h-auto min-h-[100px] shrink-0 p-4 hover:bg-gray-200 transition"
            >
              <div className="flex items-start space-x-3">
                <span
                  className={`mt-1 h-3 w-3 rounded-full ${
                    // 5. Use 'isNew' from the backend instead of 'unread'
                    note.isNew ? "bg-[#2D0101]" : "bg-gray-400"
                  }`}
                ></span>
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-[15px]">
                    {note.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {/* 6. Format 'createdAt' from the backend instead of 'time' */}
                    {new Date(note.createdAt).toLocaleString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          // If there are no notifications
          <p className="text-gray-500">You do not have any new notifications.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;