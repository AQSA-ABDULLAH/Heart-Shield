import { Route, Routes } from "react-router-dom";
import Login from "../pages/Login/Login";
import ErrorPage from "../pages/404/ErrorPage";
import Dashboard from "../pages/Dashboard/Dashboard";
import ReviewCases from "../pages/ReviewCases/ReviewCases";
import ApprovedReports from "../pages/ApprovedReports/ApprovedReports";
import Notifications from "../pages/Notifications/Notifications"
import CaseDetails from "../components/section/review-cases/CaseDetails";
import ForgetPasswordOtp from "../login-model/forget-password/OtpCode";
import Settings from "../pages/Settings/Settings"
import Signup from "../login-model/signup/Signup";
import UpdatePassword from "../pages/Settings/UpdatePassword";

const RoutesStack = () => {
  return (
    <>
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/review-cases" element={<ReviewCases />} />
          <Route path="/approved-reports" element={<ApprovedReports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/change-password" element={<UpdatePassword />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/review-case-details/:appointmentId" element={<CaseDetails />} />
          <Route path="/forget-password-otp" element={<ForgetPasswordOtp />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </div>
    </>
  );
};

export default RoutesStack;
