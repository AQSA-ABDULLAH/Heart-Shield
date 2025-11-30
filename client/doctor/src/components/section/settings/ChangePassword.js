import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserIdFromToken } from "../../../utils/auth"; // adjust path if needed

const API_URL = process.env.REACT_APP_API_URL;

const ChangePassword = () => {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const doctorId = getUserIdFromToken();
    if (!doctorId) {
      alert("You are not logged in!");
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/doctor/change-password/${doctorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Password updated successfully!");
        navigate("/");
      } else {
        alert(data.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      alert("An error occurred while changing your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <button
        className="mb-6 px-4 py-2 border border-gray-400 text-sm rounded hover:bg-gray-100"
        onClick={() => navigate("/settings")}
      >
        Back to Settings
      </button>

      <h1 className="text-3xl font-bold mb-1">Change Password</h1>
      <p className="text-gray-500 mb-6">Update your account password</p>

      <div className="bg-white rounded-xl shadow-md p-6 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#330000] text-white py-2 rounded-md hover:bg-[#4b0000] ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
