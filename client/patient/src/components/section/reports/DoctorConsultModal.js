import React, { useState, useEffect } from "react";

// Base API URL from your .env file
const API_URL = process.env.REACT_APP_API_URL;

// --- ADDED: Your Token Helper Function ---
const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem("access_token"); // Use 'access_token'
    if (!token) return null;

    // Get the payload part of the token
    const payloadBase64Url = token.split(".")[1];
    if (!payloadBase64Url) {
      console.error("Invalid Token: No payload.");
      return null;
    }
    let payloadBase64 = payloadBase64Url.replace(/-/g, "+").replace(/_/g, "/");

    // Add padding if missing
    payloadBase64 = payloadBase64.padEnd(
      payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4),
      "="
    );

    const decodedPayload = atob(payloadBase64);
    const payload = JSON.parse(decodedPayload);

    // Return the ID from the payload
    return payload.userId || payload._id || payload.id;
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
};

export default function DoctorConsultModal({ onClose, reportId }) {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  // Fetch doctors list (no change here)
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${API_URL}/api/doctor/approved-list`);
        if (!response.ok) {
          throw new Error("Failed to fetch doctors");
        }
        const data = await response.json();
        setDoctors(data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // --- UPDATED: Handle the appointment booking ---
  const handleBookAppointment = async (e, doctorId) => {
    e.stopPropagation();
    if (isBooking) return;
    setIsBooking(true);

    // --- CHANGED: Use your new logic ---
    const patientId = getUserIdFromToken();
    const token = localStorage.getItem("access_token"); // Check if token exists

    if (!patientId || !token) {
      alert("Authentication failed. Please log in.");
      setIsBooking(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/appointment/book-appointment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            doctorId: doctorId,
            reportId: reportId,
            patientId: patientId,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Booking failed");
      }

      const result = await response.json();
      alert(`Appointment request sent to ${result.doctorName}!`);
      onClose(); // Close modal on success
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsBooking(false);
    }
  };

  const handleSelectDoctor = (doctor) => {
    console.log(`Selected ${doctor.fullName}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Consult with a Doctor
        </h2>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {isLoading ? (
            <p className="text-gray-500">Loading doctors...</p>
          ) : (
            doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="flex justify-between items-center border rounded-lg p-3 hover:bg-blue-50 transition cursor-pointer"
                onClick={() => handleSelectDoctor(doctor)}
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {doctor.fullName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Contact: {doctor.email}
                  </p>
                </div>

                <button
                  onClick={(e) => handleBookAppointment(e, doctor._id)}
                  disabled={isBooking}
                  className="bg-[#B55151] p-2 rounded-[8px] text-[12px] text-white disabled:bg-gray-400"
                >
                  {isBooking ? "Booking..." : "Select Doctor"}
                </button>
              </div>
            ))
          )}

          {!isLoading && doctors.length === 0 && (
            <p className="text-gray-500">
              No approved doctors available at this time.
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg"
        >
          ✖
        </button>
      </div>
    </div>
  );
}
