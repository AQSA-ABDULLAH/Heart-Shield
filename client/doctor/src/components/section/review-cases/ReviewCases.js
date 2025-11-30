import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL; // ✅ fallback for dev

// --- Extract user ID from JWT token ---
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

export default function HighRiskCasesTable() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchCases = async () => {
      const token = localStorage.getItem("access_token");
      const doctorId = getUserIdFromToken();

      if (!token || !doctorId) {
        setErrorMsg("Authentication error. Please log in again.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/doctor/review-cases/${doctorId}`,
        );

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Fetch failed: ${response.status} ${errText}`);
        }

        const data = await response.json();

        // ✅ Check if data is a valid array
        if (!Array.isArray(data) || data.length === 0) {
          setCases([]);
        } else {
          setCases(data);
        }
      } catch (err) {
        console.error("Error fetching cases:", err);
        setErrorMsg("Failed to load high-risk cases. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, []);

  const handleViewCase = (appointmentId) => {
    navigate(`/review-case-details/${appointmentId}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-bold mb-1">Review High-Risk Cases</h2>
          <p className="text-sm text-gray-500 mb-4">
            Validate and update AI predictions.
          </p>

          {errorMsg && (
            <div className="mb-3 text-red-600 text-sm text-center">
              {errorMsg}
            </div>
          )}

          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 font-medium">Patient Name</th>
                <th className="py-2 font-medium">Date Uploaded</th>
                <th className="py-2 font-medium">AI Risk Prediction</th>
                <th className="py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="py-3 text-center text-gray-500">
                    Loading cases...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-3 text-center text-gray-500">
                    No pending cases found.
                  </td>
                </tr>
              ) : (
                cases.map((c, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2">
                      {c.name || c.patientName || "Unknown"}
                    </td>
                    <td className="py-2">
                      {c.date
                        ? c.date
                        : c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="py-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                          c.risk === "High Risk"
                            ? "bg-red-100 text-red-600 border-red-300"
                            : "bg-green-100 text-green-600 border-green-300"
                        }`}
                      >
                        {c.risk || c.riskLevel || "Unknown"}
                      </span>
                    </td>
                    <td className="py-2">
                      <button
                        className="bg-[#2B0000] text-white text-xs px-4 py-1 rounded-md"
                        onClick={() =>
                          handleViewCase(c.appointmentId || c._id || c.id)
                        }
                      >
                        View Case
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
