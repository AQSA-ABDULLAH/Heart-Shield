import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";

import RoutesStack from "./Routes";
import Sidebar from "../components/molecules/sidebar/Sidebar";

import Login from "../pages/Login/Login";
import Signup from "../login-model/signup/Signup";
import ForgetPasswordOtp from "../login-model/forget-password/OtpCode";
import About from "../pages/AboutUs";
import Home from "../pages/Home";

const GlobalRoute = () => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const isSignedIn = useSelector((state) => state.auth.isSignedIn);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // "/" ko public route se hata diya
    const publicRoutes = ["/login", "/signup", "/forget-password-otp", "/about-us"];

    // --- CASE 1: User Signed Out ---
    if (!isSignedIn) {
      // "/" par NO redirect 
      if (location.pathname === "/") return;

      // Agar koi public route nahi hai → login par redirect
      if (!publicRoutes.includes(location.pathname)) {
        navigate("/login");
      }
      return;
    }

    // --- CASE 2: User Signed In ---
    // "/" par NO redirect
    if (location.pathname === "/") return;

    // Signed-in user agar public routes par jaye → dashboard redirect
    if (publicRoutes.includes(location.pathname)) {
      navigate("/dashboard");
    }
  }, [isSignedIn, navigate, location.pathname]);

  return (
    <>
      {isSignedIn ? (
        <>
          <RoutesStack openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
          <Sidebar openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forget-password-otp" element={<ForgetPasswordOtp />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/" element={<Home />} />
        </Routes>
      )}
    </>
  );
};

export default GlobalRoute;
