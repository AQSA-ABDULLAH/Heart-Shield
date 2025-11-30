import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { FaFileAlt, FaCheck, FaBell, FaSignInAlt } from 'react-icons/fa';
import { getUserIdFromToken } from '../../utils/auth'; 

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const doctorId = getUserIdFromToken();
        const token = localStorage.getItem("access_token");

        if (!doctorId || !token) {
          setError("Authentication failed. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/dashboard/doctor/${doctorId}`,
        );

        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [API_URL]); 

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 ml-[280px] flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 ml-[280px]">
        <h1 className="text-3xl font-bold text-red-600">Error</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  // 7. Data fetch hone par UI render karein
  return (
    <div className="min-h-screen bg-gray-100 p-6 ml-[280px]">
      <div className="max-w-4xl mx-auto">
        {/* API se dynamic data use karein */}
        <h1 className="text-3xl font-bold mb-2">Welcome, {data?.doctorName || 'Doctor'}!</h1>
        <p className="text-gray-600 mb-6">Manage and validate patient reports efficiently.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow flex flex-col items-center">
            <FaFileAlt className="text-2xl mb-2" />
            <h2 className="font-semibold">Pending Reviews</h2>
            {/* API se dynamic data use karein */}
            <p className="text-2xl font-bold text-red-900 mt-2">{data?.pendingReviews}</p>
            <p className="text-gray-500 text-sm">cases to review</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow flex flex-col items-center">
            <FaCheck className="text-2xl mb-2" />
            <h2 className="font-semibold">Approved Reports</h2>
            {/* API se dynamic data use karein */}
            <p className="text-2xl font-bold text-red-900 mt-2">{data?.approvedReports}</p>
            <p className="text-gray-500 text-sm">total reports</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow flex flex-col items-center">
            <FaBell className="text-2xl mb-2" />
            <h2 className="font-semibold">Notifications</h2>
            {/* API se dynamic data use karein */}
            <p className="text-2xl font-bold text-red-900 mt-2">{data?.unreadNotifications}</p>
            <p className="text-gray-500 text-sm">unread alerts</p>
          </div>
        </div>

        <button onClick={() => navigate("/review-cases")} className="flex items-center gap-2 bg-red-900 text-white px-4 py-2 rounded-lg hover:bg-red-800">
          <FaSignInAlt /> Go to Review Cases
        </button>
      </div>
    </div>
  );
}