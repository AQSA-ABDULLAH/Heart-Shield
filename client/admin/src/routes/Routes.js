import { Route, Routes } from "react-router-dom";
import Login from "../pages/Login/Login";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import ErrorPage from "../pages/404/ErrorPage";
import ManagePatient from "../pages/ManagePatient/ManagePatient";
import ManageDoctor from "../pages/ManageDoctor/ManageDoctor";

const RoutesStack = () => {
  return (
    <>
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/manage-patient" element={<ManagePatient />} />
          <Route path="/manage-doctor" element={<ManageDoctor />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </div>
    </>
  );
};

export default RoutesStack;
