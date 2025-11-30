import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserIdFromToken } from "../../../utils/auth"; // adjust path
import axios from "axios";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { setSignedOut } from "../../../redux/containers/auth/actions";
import PrivacyPolicyModal from "./PrivacyPolicyModal";

const SettingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });

  const patientId = getUserIdFromToken();
  const API_URL = process.env.REACT_APP_API_URL;

  // handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) {
      alert("Invalid or expired token");
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/api/user/update-profile/${patientId}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        alert("Profile updated successfully!");
        navigate("/dashboard");
      } else {
        alert(response.data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Server error while updating profile");
    }
  };

  // Delete Account Function Create karein
  const handleDeleteAccount = async () => {
    if (!patientId) return;

    // SweetAlert Confirmation
    Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this account!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33", // Red color for danger
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // API Call to delete account
          const response = await axios.delete(
            `${API_URL}/api/user/delete-account/${patientId}`
          );

          if (response.data.status === "success") {
            // Success Message
            Swal.fire(
              "Deleted!",
              "Your account has been deleted.",
              "success"
            ).then(() => {
              // 4. Logout Logic (Redux Action + Redirect)
              dispatch(setSignedOut());
              navigate("/"); // Ya login page par redirect karein
            });
          }
        } catch (error) {
          console.error("Error deleting account:", error);
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  return (
    <div className="bg-gray-50 p-6 overflow-y-auto">
      <h2 className="text-3xl font-bold mb-1">Settings</h2>
      <p className="text-gray-500 mb-8">Manage your account and preferences</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        {/* Account Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Account Settings</h3>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div
              className="text-sm text-red-500 underline cursor-pointer mt-1"
              onClick={() => navigate("/change-password")}
            >
              Change Password
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-[#2C0000] text-white py-2 rounded-md hover:bg-[#3d0000]"
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* Preferences */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Preferences</h3>

          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-xs text-gray-500">Receive updates via email</p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={emailNotifications}
                onChange={() => setEmailNotifications(!emailNotifications)}
              />
              <div
                className={`w-11 h-6 rounded-full ${
                  emailNotifications ? "bg-[#2C0000]" : "bg-gray-300"
                } flex items-center transition-colors`}
              >
                <div
                  className={`h-5 w-5 bg-white rounded-full shadow-md transform duration-300 ${
                    emailNotifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
            </label>
          </div>

          <p
            className="text-sm mt-6 underline cursor-pointer text-gray-800"
            onClick={() => setOpen(true)}
          >
            Privacy Policy
          </p>

          <div className="py-2 mt-8">
            <button
              onClick={handleDeleteAccount}
              className="border border-red-400 text-red-500 text-sm px-4 py-2 rounded-md hover:bg-red-50 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
      <PrivacyPolicyModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default SettingPage;
