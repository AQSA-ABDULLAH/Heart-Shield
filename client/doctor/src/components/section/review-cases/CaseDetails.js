import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

// 🔐 Helper: Decode JWT and extract doctorId or userId
const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return null;

    const payloadBase64Url = token.split(".")[1];
    if (!payloadBase64Url) return null;

    let payloadBase64 = payloadBase64Url.replace(/-/g, "+").replace(/_/g, "/");
    payloadBase64 = payloadBase64.padEnd(
      payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4),
      "="
    );

    const decodedPayload = atob(payloadBase64);
    const payload = JSON.parse(decodedPayload);
    return payload.doctorId || payload.userId;
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
};

export default function CaseDetails() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [caseDetails, setCaseDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedRisk, setSelectedRisk] = useState("");

  // 🧩 Fetch Case Details on Mount
  useEffect(() => {
    const fetchDetails = async () => {
      const token = localStorage.getItem("access_token");
      const doctorId = getUserIdFromToken();

      if (!token || !doctorId) {
        navigate("/doctor/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/appointment/case/${appointmentId}/${doctorId}`
        );

        if (!response.ok) throw new Error("Failed to fetch case details");

        const data = await response.json();
        setCaseDetails(data);
        setNotes(data.notes || "");
        setSelectedRisk(data.aiRisk?.riskLabel || "");
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [appointmentId, navigate]);

  // 🩺 Submit Doctor Review
  const handleSubmitReview = async () => {
    if (!notes) {
      alert("Please add medical notes before approving.");
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("access_token");
    const doctorId = getUserIdFromToken();

    if (!token || !doctorId) {
      alert("Authentication error. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/appointment/review/${appointmentId}/${doctorId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes, finalRisk: selectedRisk }),
        }
      );

      if (!response.ok) throw new Error("Failed to submit review");

      alert("Review submitted successfully!");
      navigate("/approved-reports");
    } catch (error) {
      console.error(error);
      alert("Error submitting review: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🕐 Loading and Fallbacks
  if (isLoading)
    return <div className="p-6 ml-[280px]">Loading case details...</div>;

  if (!caseDetails)
    return (
      <div className="p-6 ml-[280px] text-red-500">
        No case details found.
      </div>
    );

  // ✅ Extract Data
  const { patient, ecg, aiRisk } = caseDetails;

  // 🖼️ Normalize ECG File Path
  const normalizedEcgPath = ecg?.filePath
    ? `${API_URL}/${ecg.filePath
        .replace(/^.*uploads[\\/]/, "uploads/")
        .replace(/\\/g, "/")}`
    : null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen ml-[280px]">
      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-sm text-black mb-4"
      >
        <ArrowLeft className="mr-1 w-4 h-4" /> Back to Cases
      </button>

      <h2 className="text-2xl font-bold mb-4">Review Case Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🧍 Patient Info + ECG */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="bg-gray-100 h-64 flex items-center justify-center text-gray-400 text-xl rounded-md mb-4">
            {normalizedEcgPath ? (
              <img
                src={normalizedEcgPath}
                alt="ECG Recording"
                className="w-full h-full object-contain"
              />
            ) : (
              "ECG Recording Not Available"
            )}
          </div>

          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div>
              <p className="text-gray-500">Patient Name</p>
              <p className="font-medium">{patient?.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Age</p>
              <p className="font-medium">{patient?.age}</p>
            </div>
            <div>
              <p className="text-gray-500">Gender</p>
              <p className="font-medium">{patient?.gender}</p>
            </div>
            <div>
              <p className="text-gray-500">Cholesterol</p>
              <p className="font-medium">{patient?.cholesterol || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-500">Smoking History</p>
              <p className="font-medium">{patient?.smoking || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-500">Blood Pressure</p>
              <p className="font-medium">{patient?.bp || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* 🤖 AI Risk + Doctor Review */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-base font-semibold mb-3">AI Risk Assessment</h3>

          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setSelectedRisk("High Risk")}
              className={
                selectedRisk === "High Risk"
                  ? "bg-red-500 text-white px-4 py-1 rounded-full text-sm"
                  : "border border-red-500 text-red-700 px-4 py-1 rounded-full text-sm"
              }
            >
              High Risk
            </button>
            <button
              onClick={() => setSelectedRisk("Low Risk")}
              className={
                selectedRisk === "Low Risk"
                  ? "bg-green-600 text-white px-4 py-1 rounded-full text-sm"
                  : "border border-green-500 text-green-700 px-4 py-1 rounded-full text-sm"
              }
            >
              Low Risk
            </button>
          </div>

          <label className="block text-sm font-medium mb-1">
            Medical Notes & Recommendations
          </label>
          <textarea
            className="w-full h-32 border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            placeholder="Enter notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button
            className="mt-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
            onClick={handleSubmitReview}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Approve and Send to Patient"}
          </button>
        </div>
      </div>
    </div>
  );
}
