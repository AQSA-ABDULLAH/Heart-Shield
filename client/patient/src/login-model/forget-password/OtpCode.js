import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ForgetPasswordOtp = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [email, setEmail] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/user/forget-password`, { email });
      setShowOtp(true);
      Swal.fire("Email Sent", "Check your email for the OTP.", "success");
    } catch (error) {
      Swal.fire("Failed", "Could not send reset link. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleOtpSubmit = async () => {
    const enteredOtp = parseInt(otp.join(""), 10);
    if (isNaN(enteredOtp) || otp.join("").length !== 4) {
      Swal.fire("Invalid OTP", "Enter a valid 4-digit code", "error");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/user/reset-password`, {
        email,
        otp: enteredOtp,
      });

      if (response.data.success || response.data.status === "success") {
        Swal.fire("Success", "OTP Verified! Proceed to reset password.", "success");
        setShowUpdatePassword(true);
      } else {
        Swal.fire("Error", response.data.message || "Verification failed", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to verify OTP", "error");
    }
  };

  const handleUpdatePassword = async () => {
    if (password !== confirmPassword) {
      Swal.fire("Error", "Passwords do not match", "error");
      return;
    }

    try {
      const response = await axios.patch(`${API_URL}/api/user/update-password`, {
        email,
        password,
        confirmPassword,
      });

      if (response.data.status === "success") {
        Swal.fire("Success", "Password updated successfully!", "success");
        navigate("/login");
      } else {
        Swal.fire("Error", "Failed to update the password. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      Swal.fire("Error", "Failed to update password. Please try again.", "error");
    }
  };

  return (
    <div className="flex min-h-screen">
     {/* Left Side */}
      <div className="hidden md:flex w-1/2 relative justify-center">
        <img
          src="/assest/forget-password.png"
          alt="Car"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute z-10 bottom-[61px] px-[150px]">
          <h1 className="text-[32px] font-bold mb-4 leading-[48px]">
            HeartShield
          </h1>
          <p className="text-[14px] leading-[27px] tracking-[1px]">
            Revolutionizing heart health monitoring with artificial intelligence
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-[#2c0000] text-white px-10">
        <div className="w-full max-w-md">
          {!showOtp && !showUpdatePassword && (
            <>
              <h2 className="text-2xl font-bold mb-6">Reset Your Password</h2>
              <p className="mb-6 text-sm text-gray-300">
                Enter the email associated with your account and we'll send you a opt to reset your password.
              </p>
              <form onSubmit={handleSendEmail}>
                <label htmlFor="email" className="text-sm block mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 mb-6 rounded bg-[#4a1a1a] placeholder-gray-400 text-white focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-[#8b0000] hover:bg-[#a00000] text-white py-3 rounded font-semibold transition"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            </>
          )}

          {showOtp && !showUpdatePassword && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center">Enter OTP</h2>
              <p className="mb-6 text-sm text-gray-300 text-center">
                Enter the 4-digit code sent to <span className="text-red-300">{email}</span>
              </p>
              <div className="flex justify-between gap-2 mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(e, i)}
                    className="w-12 h-12 text-center text-lg rounded bg-[#4a1a1a] text-white focus:outline-none"
                  />
                ))}
              </div>
              <button
                onClick={handleOtpSubmit}
                className="w-full bg-[#8b0000] hover:bg-[#a00000] text-white py-3 rounded font-semibold transition"
              >
                Confirm OTP
              </button>
              <p className="mt-6 text-sm text-gray-400 text-center">
                Want to try again?{" "}
                <button
                  onClick={() => setShowOtp(false)}
                  className="text-red-400 hover:underline"
                >
                  Re-enter Email
                </button>
              </p>
            </>
          )}

          {showUpdatePassword && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center">Set New Password</h2>
              <p className="text-sm text-gray-300 mb-6 text-center">
                Create a new password. Ensure it differs from previous ones for security.
              </p>
              <div className="mb-4">
                <input
                  type="password"
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded bg-[#4a1a1a] placeholder-gray-400 text-white focus:outline-none"
                />
              </div>
              <div className="mb-6">
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded bg-[#4a1a1a] placeholder-gray-400 text-white focus:outline-none"
                />
              </div>
              <button
                onClick={handleUpdatePassword}
                className="w-full bg-[#8b0000] hover:bg-[#a00000] text-white py-3 rounded font-semibold transition"
              >
                Update Password
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgetPasswordOtp;
