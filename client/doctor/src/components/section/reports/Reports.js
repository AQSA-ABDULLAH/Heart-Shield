import React, { useEffect, useState } from "react";
import { getUserIdFromToken } from "../../../utils/auth";
import { FaTimes, FaFileMedical, FaUser, FaCalendarAlt, FaHeartbeat } from "react-icons/fa"; // Icons for better UI

const API_URL = process.env.REACT_APP_API_URL;

export default function ApprovedReportsTable() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🆕 State for Modal
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const doctorId = getUserIdFromToken();
        if (!doctorId) {
          setError("Doctor ID not found. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/appointment/approved-reports/${doctorId}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Failed to fetch reports");

        setReports(data.reports || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // 🆕 Functions to handle Modal
  const openModal = (report) => {
    setSelectedReport(report);
  };

  const closeModal = () => {
    setSelectedReport(null);
  };

  if (loading)
    return <div className="p-6 ml-[280px] text-gray-600">Loading approved reports...</div>;

  if (error)
    return <div className="p-6 ml-[280px] text-red-600">Error: {error}</div>;

  if (!reports || reports.length === 0)
    return <div className="p-6 ml-[280px] text-gray-500">No approved reports found.</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-bold mb-1">Approved Reports</h2>
          <p className="text-sm text-gray-500 mb-4">
            View all finalized patient reports approved by you.
          </p>

          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 font-medium">Patient Name</th>
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium">Risk Level</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(reports) && reports.map((report, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="py-2">{report.patientName}</td>
                  <td className="py-2">
                    {new Date(report.date).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </td>
                  <td className="py-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                        report.risk === "High Risk"
                          ? "bg-red-100 text-red-600 border-red-300"
                          : report.risk === "Low Risk"
                          ? "bg-green-100 text-green-600 border-green-300"
                          : "bg-gray-100 text-gray-600 border-gray-300"
                      }`}
                    >
                      {report.risk}
                    </span>
                  </td>
                  <td className="py-2 capitalize">{report.status}</td>
                  <td className="py-2">
                    {/* 👇 Updated Button to Open Modal */}
                    <button
                      className="bg-[#2B0000] text-white text-xs px-4 py-1 rounded-md hover:bg-red-800 transition"
                      onClick={() => openModal(report)}
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================= */}
      {/* 🆕 POPUP MODAL (View Full Details)       */}
      {/* ========================================= */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          
          {/* Modal Container */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all scale-100">
            
            {/* Header */}
            <div className="flex justify-between items-center bg-[#2B0000] text-white px-6 py-4 rounded-t-2xl">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaFileMedical /> Medical Report Details
              </h3>
              <button onClick={closeModal} className="text-white hover:text-gray-300 text-xl">
                <FaTimes />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              
              {/* Patient Info */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <FaUser size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Patient Name</p>
                  <p className="text-lg font-semibold text-gray-800">{selectedReport.patientName}</p>
                </div>
              </div>

              {/* Date & ID Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                   <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                     <FaCalendarAlt /> Report Date
                   </p>
                   <p className="font-medium">
                     {new Date(selectedReport.date).toLocaleString()}
                   </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                   <p className="text-xs text-gray-500 mb-1">Appointment ID</p>
                   <p className="font-mono text-xs text-gray-600 break-all">
                     {selectedReport.appointmentId}
                   </p>
                </div>
              </div>

              {/* Risk Analysis Section */}
              <div className={`p-4 rounded-lg border-l-4 ${
                  selectedReport.risk === "High Risk" 
                  ? "bg-red-50 border-red-500" 
                  : "bg-green-50 border-green-500"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold uppercase">Heart Risk Assessment</p>
                    <p className={`text-xl font-bold mt-1 ${
                        selectedReport.risk === "High Risk" ? "text-red-700" : "text-green-700"
                    }`}>
                      {selectedReport.risk}
                    </p>
                  </div>
                  <FaHeartbeat size={30} className={
                      selectedReport.risk === "High Risk" ? "text-red-400" : "text-green-400"
                  } />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Status: <span className="capitalize font-medium text-gray-700">{selectedReport.status}</span>
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button 
                onClick={closeModal}
                className="px-5 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}