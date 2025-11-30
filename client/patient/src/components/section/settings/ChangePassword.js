import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserIdFromToken } from "../../../utils/auth"; // adjust the path if needed

export default function ChangePassword() {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL; // http://localhost:5000

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const patientId = getUserIdFromToken();

    if (!patientId) {
      alert("Invalid or expired token. Please log in again.");
      return;
    }

    const { currentPassword, newPassword, confirmNewPassword } = formData;

    if (newPassword !== confirmNewPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        `${API_URL}/api/user/change-password/${patientId}`,
        { currentPassword, newPassword },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.status === "success") {
        alert("Password updated successfully!");
        navigate("/settings"); // Redirect to settings after success
      } else {
        alert(response.data.error || "Failed to change password.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Server error while changing password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-[32px]">
      <button
        onClick={() => navigate("/settings")}
        className="border border-gray-300 text-[14px] px-[16px] py-[9px] rounded-[8px] mb-[24px] hover:bg-gray-100 transition"
      >
        Back to Settings
      </button>

      <h2 className="text-[36px] font-semibold text-gray-800 mb-[8px]">
        Change Password
      </h2>
      <p className="text-gray-500 text-[16px] mb-[32px]">
        Update your account password
      </p>

      <div className="w-full max-w-md bg-white shadow-sm rounded-lg p-6">
        <form className="space-y-[24px]" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
              placeholder="Enter current password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
              placeholder="Confirm new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#3b0a03] text-white py-2 rounded-md hover:bg-[#500e06] transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
