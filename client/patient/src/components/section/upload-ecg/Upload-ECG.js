import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function Uploader() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Select gender");
  const [cholesterol, setCholesterol] = useState("");
  const [smoking, setSmoking] = useState("Select smoking history");
  const [bloodPressure, setBloodPressure] = useState("");
  const [ecgFile, setEcgFile] = useState(null);
  const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return null;
      const decoded = jwtDecode(token);
      return decoded.userId || decoded._id || decoded.id || null;
    } catch {
      return null;
    }
  };

  const isValidBloodPressure = (value) => /^[0-9]{2,3}\/[0-9]{2,3}$/.test(value);
  const isValidCholesterol = (value) => /^[0-9]{2,3}\/[0-9]{2,3}$/.test(value);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];

      if (
        !["image/png", "image/jpeg", "image/jpg", "application/octet-stream"].includes(file.type) &&
        !file.name.endsWith(".mat")
      ) {
        Swal.fire({
          icon: "error",
          title: "Invalid File Type",
          text: "Only .png, .jpg, .jpeg, .mat files are allowed.",
        });
        return;
      }

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!age || age < 18 || age > 120) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Age",
        text: "Please enter a valid age between 18 and 120.",
      });
      return;
    }

    if (gender === "Select gender") {
      Swal.fire({
        icon: "warning",
        title: "Missing Gender",
        text: "Please select a gender.",
      });
      return;
    }

    if (cholesterol && !isValidCholesterol(cholesterol)){
      Swal.fire({
        icon: "warning",
        title: "Invalid Cholesterol Level",
        text: "Please enter cholesterol between 100 and 400 mg/dL.",
      });
      return;
    }

    if (smoking === "Select smoking history") {
      Swal.fire({
        icon: "warning",
        title: "Missing Smoking History",
        text: "Please select smoking status.",
      });
      return;
    }

    if (bloodPressure && !isValidBloodPressure(bloodPressure)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Blood Pressure",
        text: "Please enter valid blood pressure (e.g., 120/80).",
      });
      return;
    }

    if (!ecgFile) {
      Swal.fire({
        icon: "warning",
        title: "ECG File Missing",
        text: "Please upload your ECG file.",
      });
      return;
    }

    setLoading(true);
    const patientId = getUserIdFromToken();

    if (!patientId) {
      Swal.fire({
        icon: "error",
        title: "Authentication Error",
        text: "Session expired. Please login again.",
      });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("patientId", patientId);
    formData.append("age", age);
    formData.append("gender", gender);
    formData.append("cholesterolLevel", cholesterol);
    formData.append("smokingHistory", smoking);
    formData.append("bloodPressure", bloodPressure);
    formData.append("ecgFile", ecgFile);

    try {
      const API_URL = `${process.env.REACT_APP_API_URL}/api/ecg/submit`;
      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "ECG Submitted",
        text: response.data.message || "Your ECG has been uploaded successfully!",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/reports"), 1800);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: error.response?.data?.message || "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">

        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h2 className="text-lg font-semibold mb-4">Upload Your ECG</h2>

          <label htmlFor="file-upload" className="border-2 border-dashed border-gray-300 rounded-lg py-16 px-4 block cursor-pointer">
            <div className="flex flex-col items-center">
              <img src="/assest/upload-icon.png" alt="upload" />
              <p className="text-sm mt-3">
                {ecgFile ? ecgFile.name : "Click to upload ECG file"}
              </p>
              <p className="text-xs text-gray-400 mb-4">Supported: .png, .jpg, .jpeg, .mat</p>
              <div className="bg-[#45090B] text-white px-4 py-2 rounded-md">
                Browse Files
              </div>
            </div>
          </label>

          <input id="file-upload" type="file" className="hidden"
            onChange={handleFileChange}
            accept=".png,.jpg,.jpeg,.mat"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-6">Clinical Information</h3>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input type="number" placeholder="Age (18 to 120)" value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full border p-2 rounded-md" required />

            <select className="w-full border p-2 rounded-md bg-gray-100"
              value={gender} onChange={(e) => setGender(e.target.value)} required>
              <option disabled>Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <input
              type="text"
              placeholder="Cholesterol (mg/dL) (e.g. 400/100)"
              value={cholesterol}
              required
              onChange={(e) => setCholesterol(e.target.value)}
              className="w-full border p-2 rounded-md"
            />

            <select className="w-full border p-2 rounded-md bg-gray-100"
              value={smoking} onChange={(e) => setSmoking(e.target.value)} required>
              <option disabled>Select smoking history</option>
              <option>Never</option>
              <option>Former</option>
              <option>Current</option>
            </select>

            <input type="text" placeholder="Blood Pressure (e.g. 120/80)"
              value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value) } required
              className="w-full border p-2 rounded-md" />

            <button disabled={loading} type="submit"
              className="w-full bg-[#2D0101] text-white h-[70px] rounded-xl font-semibold flex items-center justify-center gap-2">
              <img src="/assest/submit.png" alt="submit" />
              {loading ? "Submitting..." : "Submit for AI analysis"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
