import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { getUserIdFromToken } from '../../utils/auth';

// Aap ka DashboardCard component (No changes needed)
const DashboardCard = ({ icon, title, description, value, color = 'text-black', value_details }) => (
  <div className="bg-[#fff] w-full h-[265px] rounded-[12px] shadow-[0px_4px_12px_rgba(0,0,0,0.10)] flex flex-col items-center justify-center p-4">
    <img src={icon} alt="icon" className="w-8 h-8 mb-4" />
    <p className="text-[#000000] text-[20px] font-semibold mb-2 text-center">{title}</p>
    <p className="text-[#666666] text-[14px] mb-2 text-center">{description}</p>
    <p className={`text-[#2D0101] text-[24px] mb-4 font-bold ${color}`}>{value}</p>
    <p className="text-[#666666] text-[14px] text-center">{value_details}</p>
  </div>
);


const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Get the API URL from environment variables
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 3. Get Patient ID and Token dynamically
        const patientId = getUserIdFromToken();
        const token = localStorage.getItem("access_token");

        // 4. Add error handling if user is not logged in
        if (!patientId || !token) {
          setError("Authentication error. Please log in again.");
          setLoading(false);
          return;
        }

        // 5. Apne naye API endpoint ko call karein
        //    - Use full API_URL
        //    - Use dynamic patientId
        //    - Add Authorization header
        const response = await axios.get(
          `${API_URL}/api/dashboard/${patientId}`, 
          {
            headers: {
              // Send the token to the backend for verification
              'Authorization': `Bearer ${token}` 
              // (Note: Adjust 'Bearer' if your backend expects a different format)
            }
          }
        );
        
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        // Set a user-friendly error message
        setError(err.response?.data?.message || err.message || "Could not fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // 6. useEffect dependency array is empty [] so it runs once on mount
  }, [API_URL]); // Add API_URL as dependency (though it won't change)

  // Risk level ke liye color decide karein (No changes needed)
  const getRiskSpan = (riskLevel) => {
    if (riskLevel === "Low") {
      return <span className="text-[#10B981]">Low</span>;
    }
    if (riskLevel === "High") {
      return <span className="text-red-500">High</span>; // High risk ke liye
    }
    return <span className="text-gray-500">{riskLevel || 'N/A'}</span>;
  };

  if (loading) {
    return <main className="flex-1 bg-[#F8F9FA] px-[32px] py-[20px] ml-[280px]">Loading...</main>;
  }

  if (error) {
    return <main className="flex-1 bg-[#F8F9FA] px-[32px] py-[20px] ml-[280px]">Error: {error}</main>;
  }

  if (!data) {
    return null; // Ya koi empty state
  }

  // RETURN JSX (No changes needed, it will now use dynamic data)
  return (
      <main className="flex-1 bg-[#F8F9FA] px-[32px] py-[20px] ml-[280px]">
        <h2 className="text-[32px] text-[#111111] font-bold mb-2">Welcome, {data.patientName}</h2>
        <p className="text-[16px] text-[#666666] mb-8">Your heart health dashboard</p>

        <div className="flex gap-8 mb-8">
          <DashboardCard
            icon="/assest/upload-icon.png"
            title="Upload New ECG"
            description="Get instant AI analysis of your heart health"
            value={data.uploadsThisMonth}
            value_details="uploads this month"
          />
          <DashboardCard
            icon="/assest/report-icon.png"
            title="View Past Reports"
            description="Access your complete health history"
            value={data.totalReports}
            value_details="total reports"
          />
          <DashboardCard
            icon="/assest/analytics-icon.png"
            title="Track Risk Trends"
            description="Monitor your heart health progress"
            value={getRiskSpan(data.currentRiskLevel)}
            value_details="current risk level"
          />
        </div>

        <button onClick={() => navigate("/upload-ecg")} className="w-full bg-[#2D0101] h-[75px] text-[#fff] rounded-xl text-[18px] font-semibold mb-8 flex items-center justify-center gap-5 tracking-[0.8px]">
          <img src='/assest/white-upload-icon.png' alt='icon' />
          <p>Upload ECG & Predict Risk</p> 
        </button>

        <div className="bg-white shadow-md rounded-xl p-4">
          <div className="flex justify-between mb-2">
            <h3 className="font-bold">Recent Notifications</h3>
            <span className="text-gray-500 text-sm">Last 5 notifications</span>
          </div>
          <ul className="list-disc list-inside text-gray-700">
            {data.recentNotifications.length > 0 ? (
              data.recentNotifications.map(notification => (
                <li key={notification._id} className={notification.isNew ? 'font-bold' : ''}>
                  {notification.message}
                </li>
              ))
            ) : (
              <li>No new notifications</li>
            )}
          </ul>
        </div>
      </main>
  );
};

export default Dashboard;