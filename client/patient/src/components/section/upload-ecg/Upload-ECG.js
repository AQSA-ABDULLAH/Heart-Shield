import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";

export default function Uploader() {
  // States
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Select gender");
  const [cholesterol, setCholesterol] = useState("");
  const [smoking, setSmoking] = useState("Select smoking history");
  const [bloodPressure, setBloodPressure] = useState("");
  const [ecgFile, setEcgFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Extract patient ID from JWT Token
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return null;

      const decoded = jwtDecode(token);
      return decoded.userId || decoded._id || decoded.id || null;
    } catch (err) {
      return null;
    }
  };

  // File select handler
  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Maximum allowed size is 10MB",
        });
        return;
      }
      setEcgFile(file);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !ecgFile ||
      !age ||
      gender === "Select gender" ||
      smoking === "Select smoking history"
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill all required fields and upload an ECG file.",
      });
      setLoading(false);
      return;
    }

    const patientId = getUserIdFromToken();
    if (!patientId) {
      Swal.fire({
        icon: "error",
        title: "Authentication Error",
        text: "Patient ID not found. Please login again.",
      });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("ecgFile", ecgFile);
    formData.append("patientId", patientId);
    formData.append("age", age);
    formData.append("gender", gender);
    formData.append("cholesterolLevel", cholesterol);
    formData.append("smokingHistory", smoking);
    formData.append("bloodPressure", bloodPressure);

    try {
      const API_URL = `${process.env.REACT_APP_API_URL}/api/ecg/submit`;
      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setLoading(false);

      // SUCCESS ALERT
      Swal.fire({
        icon: "success",
        title: "ECG Submitted Successfully!",
        text: response.data.message || "Your ECG has been uploaded.",
        timer: 2000,
        showConfirmButton: false,
      });

      // Clear Form
      setAge("");
      setGender("Select gender");
      setCholesterol("");
      setSmoking("Select smoking history");
      setBloodPressure("");
      setEcgFile(null);
    } catch (error) {
      setLoading(false);

      // ERROR ALERT
      Swal.fire({
        icon: "error",
        title: "Upload Failed!",
        text:
          error.response?.data?.message ||
          "Something went wrong. Try again later.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Section */}
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h2 className="text-lg font-semibold mb-4">Upload Your ECG</h2>
          <p className="text-sm text-gray-500 mb-6">
            Upload your ECG file and provide clinical information for AI analysis
          </p>

          <label
            htmlFor="file-upload"
            className="border-2 border-dashed border-gray-300 rounded-lg py-16 px-4 block cursor-pointer"
          >
            <div className="flex flex-col items-center">
              <img src="/assest/upload-icon.png" alt="upload icon" />
              <p className="text-sm mt-3">
                {ecgFile ? ecgFile.name : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Supported: .png, .jpg, .jpeg, .mat
              </p>
              <div className="bg-[#45090B] text-white px-4 py-2 rounded-md">
                Browse Files
              </div>
            </div>
          </label>

          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".png,.jpg,.jpeg,.mat"
          />
        </div>

        {/* Right Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-6">Clinical Information</h3>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="number"
              placeholder="Enter age"
              className="w-full border border-gray-300 rounded-md p-2"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />

            <select
              className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option disabled>Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <input
              type="text"
              placeholder="Cholesterol Level (mg/dL)"
              className="w-full border border-gray-300 rounded-md p-2"
              value={cholesterol}
              onChange={(e) => setCholesterol(e.target.value)}
            />

            <select
              className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
              value={smoking}
              onChange={(e) => setSmoking(e.target.value)}
              required
            >
              <option disabled>Select smoking history</option>
              <option>Never</option>
              <option>Former</option>
              <option>Current</option>
            </select>

            <input
              type="text"
              placeholder="Blood Pressure (e.g., 120/80)"
              className="w-full border border-gray-300 rounded-md p-2"
              value={bloodPressure}
              onChange={(e) => setBloodPressure(e.target.value)}
            />

            <button
              type="submit"
              className="w-full bg-[#2D0101] h-[75px] text-white rounded-xl text-[18px] font-semibold flex items-center justify-center gap-5 disabled:opacity-50"
              disabled={loading}
            >
              <img src="/assest/submit.png" alt="icon" />
              {loading ? "Submitting..." : "Submit for AI analysis"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
