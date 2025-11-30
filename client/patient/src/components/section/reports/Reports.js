import { useState, useEffect } from "react";
import DoctorConsultModal from "./DoctorConsultModal";
import ViewPrescriptionModal from "./ViewPrescriptionModal";

// ------------------ TOKEN DECODER ------------------
const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return null;

    const payloadBase64Url = token.split(".")[1];
    if (!payloadBase64Url) return null;

    let payloadBase64 = payloadBase64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    payloadBase64 = payloadBase64.padEnd(
      payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4),
      "="
    );

    const decodedPayload = atob(payloadBase64);
    const payload = JSON.parse(decodedPayload);

    return payload.userId || payload._id || payload.id;
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
};

// ------------------ FORMAT REPORT DATA ------------------
const formatReportData = (record) => {
  const dateObj = new Date(record.createdAt);

  const date = dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const time = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  let risk = "Pending";
  let color = "bg-yellow-100 text-yellow-600";

  if (record.analysisResult.status === "Completed") {
    const riskValue = record.analysisResult.Overall_Risk;

    if (riskValue > 0.5) {
      risk = "High Risk";
      color = "bg-red-100 text-red-600";
    } else {
      risk = "Low Risk";
      color = "bg-green-100 text-green-600";
    }
  } else if (record.analysisResult.status === "Failed") {
    risk = "Failed";
    color = "bg-gray-100 text-gray-600";
  }

  return {
    id: record._id,
    date,
    time,
    risk,
    color,

    consultationStatus: record.consultationStatus || "Pending",
    prescriptionText: record.prescriptionNotes || null, 
  };
};

// ------------------ MAIN COMPONENT ------------------
export default function ReportsTable() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingReportId, setDownloadingReportId] = useState(null);

  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);

  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [selectedPrescriptionText, setSelectedPrescriptionText] = useState(null);

  // ------------------ CONSULT HANDLER ------------------
  const handleConsult = (reportId) => {
    setSelectedReportId(reportId);
    setIsConsultModalOpen(true);
  };

  // ADD HANDLER FOR VIEWING PRESCRIPTION
  const handleViewPrescription = (text) => {
    console.log("Prescription Text:", text);
    setSelectedPrescriptionText(text);
    setIsPrescriptionModalOpen(true);
  };

  // ------------------ FETCH REPORTS ------------------
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const patientId = getUserIdFromToken();
        const token = localStorage.getItem("access_token");
        const apiUrl = process.env.REACT_APP_API_URL;

        if (!patientId || !token) throw new Error("Authentication failed.");
        if (!apiUrl) throw new Error("API URL not configured.");

        const response = await fetch(`${apiUrl}/api/ecg/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Failed to load reports");
        }

        const data = await response.json();
        setReports(data.map(formatReportData));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  // ------------------ DOWNLOAD PDF ------------------
  const handleDownload = async (reportId) => {
    setDownloadingReportId(reportId);

    try {
      const token = localStorage.getItem("access_token");
      const apiUrl = process.env.REACT_APP_API_URL;

      const response = await fetch(`${apiUrl}/api/ecg/report/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to download PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `HeartShield-Report-${reportId}.pdf`;
      a.style.display = "none";
      document.body.appendChild(a);

      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setDownloadingReportId(null);
    }
  };

  // ------------------ RENDER CONTENT ------------------
  const renderContent = () => {
    if (isLoading)
      return (
        <p className="text-gray-500 text-center py-4">
          Loading reports...
        </p>
      );

    if (error)
      return (
        <p className="text-gray-500 text-center py-4">You do not have any report to view yet.</p>
      );

    if (reports.length === 0)
      return (
    <p className="text-gray-500 text-center py-4">
      You do not have any report to view yet.
    </p>
  );

    return reports.map((report) => {
      const isDownloading = downloadingReportId === report.id;

      return (
        <div
          key={report.id}
          className="flex justify-between items-center py-4"
        >
          {/* DATE + TIME */}
          <div>
            <p className="text-gray-800">{report.date}</p>
            <p className="text-xs text-gray-500">
              Uploaded at {report.time}
            </p>
          </div>

          {/* RISK BADGE */}
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${report.color}`}
          >
            {report.risk}
          </div>

          {/* DOWNLOAD BUTTON */}
          <button
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm disabled:opacity-50"
            onClick={() => handleDownload(report.id)}
            disabled={isDownloading}
          >
            {isDownloading ? "Downloading..." : "Download PDF"}
          </button>

          {/* CONSULT / VIEW PRESCRIPTION */}
          {report.consultationStatus === "Pending" ? (
            <button
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm ml-2"
              onClick={() => handleConsult(report.id)}
            >
              Consult Doctor
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition text-sm ml-2"
              onClick={() => handleViewPrescription(report.prescriptionText)}
            >
              View Prescription
            </button>
          )}
        </div>
      );
    });
  };

  // ------------------ RETURN UI ------------------
  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-6 overflow-y-auto">
      <div className="w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Your HeartShield Reports
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          View, download, and consult doctor about your reports.
        </p>

        <div className="bg-white shadow rounded-lg p-6">
          {!isLoading && !error && (
            <p className="text-sm text-gray-500 mb-4">
              Showing {reports.length}{" "}
              {reports.length === 1 ? "report" : "reports"}
            </p>
          )}

          <div className="divide-y">{renderContent()}</div>
        </div>
      </div>

      {isConsultModalOpen && (
        <DoctorConsultModal
          onClose={() => setIsConsultModalOpen(false)}
          reportId={selectedReportId}
        />
      )}

      {isPrescriptionModalOpen && (
        <ViewPrescriptionModal
          onClose={() => setIsPrescriptionModalOpen(false)}
          prescriptionText={selectedPrescriptionText}
        />
      )}
    </div>
  );
}
