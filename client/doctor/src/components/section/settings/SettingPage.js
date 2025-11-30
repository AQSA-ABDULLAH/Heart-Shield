import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserIdFromToken } from "../../../utils/auth";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { setSignedOut } from "../../../redux/containers/auth/actions";
import PrivacyPolicyModal from "./PrivacyPolicyModal";
const API_URL = process.env.REACT_APP_API_URL;

export default function SettingsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
   const [open, setOpen] = useState(false);

  const doctorId = getUserIdFromToken();

  const handleSave = async () => {
    try {
      const doctorId = getUserIdFromToken();
      if (!doctorId) {
        alert("You are not logged in!");
        return;
      }

      setLoading(true);
      const response = await fetch(`${API_URL}/api/doctor/update-profile/${doctorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          phoneNumber: phone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Profile updated successfully!");
      navigate("/");
      } else {
        alert(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating your profile.");
    } finally {
      setLoading(false);
    }
  };

  // 5. Delete Account Logic
  const handleDeleteAccount = () => {
    if (!doctorId) return;

    Swal.fire({
      title: "Are you sure?",
      text: "Your doctor account will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${API_URL}/api/doctor/delete-account/${doctorId}`, {
            method: "DELETE",
          });

          const data = await response.json();

          if (response.ok && data.status === "success") {
            Swal.fire("Deleted!", "Your account has been deleted.", "success").then(() => {
              // Logout user and redirect
              dispatch(setSignedOut());
              navigate("/"); 
            });
          } else {
            Swal.fire("Error!", data.error || "Failed to delete account.", "error");
          }
        } catch (error) {
          console.error("Error deleting account:", error);
          Swal.fire("Error!", "Server error occurred.", "error");
        }
      }
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-1">Settings</h2>
      <p className="text-sm text-gray-500 mb-6">
        Manage your account and preferences.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Account Info */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-lg mb-4">Account Information</h3>

          <label className="block text-sm font-medium">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border mt-1 mb-4 px-3 py-2 rounded-md"
          />

          <label className="block text-sm font-medium">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border mt-1 mb-4 px-3 py-2 rounded-md"
          />

          <button
            onClick={() => navigate("/change-password")}
            className="w-full border border-black text-black px-4 py-2 rounded-md mb-4"
          >
            Change Password
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className={`w-full bg-[#330000] text-white px-4 py-2 rounded-md ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Preferences */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-lg mb-4">Preferences</h3>

          <div className="flex items-center justify-between py-2">
            <span>Email Alerts</span>
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

          <div className="flex items-center justify-between py-2">
            <span>Critical Case Alerts</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={criticalAlerts}
                onChange={() => setCriticalAlerts(!criticalAlerts)}
              />
              <div
                className={`w-11 h-6 rounded-full ${
                  criticalAlerts ? "bg-[#2C0000]" : "bg-gray-300"
                } flex items-center transition-colors`}
              >
                <div
                  className={`h-5 w-5 bg-white rounded-full shadow-md transform duration-300 ${
                    criticalAlerts ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
            </label>
          </div>

          <div className="border-t my-4"></div>

           <p
            className="text-sm mt-6 underline cursor-pointer text-gray-800"
            onClick={() => setOpen(true)}
          >
            Privacy Policy
          </p>

          <div className="py-2">
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
}
