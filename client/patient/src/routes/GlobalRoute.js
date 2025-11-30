import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RoutesStack from "./Routes";
import Sidebar from "../components/molecules/sidebar/Sidebar";
import Login from "../pages/Login/Login";
import { Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import Signup from "../login-model/signup/Signup";
import ForgetPasswordOtp from "../login-model/forget-password/OtpCode";
import About from "../pages/AboutUs";
import { useLocation } from "react-router-dom";
import Home from "../pages/Home";

const GlobalRoute = () => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const isSignedIn = useSelector((state) => state.auth.isSignedIn);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const publicRoutes = ["/", "/login", "/signup", "/forget-password-otp", "/about-us"];

    if (!isSignedIn) {
      if (!publicRoutes.includes(location.pathname)) {
        navigate("/login");
      }
    } else {
      if (publicRoutes.includes(location.pathname)) {
        navigate("/dashboard");
      }
    }
  }, [isSignedIn, navigate, location.pathname]);

  return (
    <>
      {isSignedIn ? (
        <>
          <RoutesStack
            openSidebar={openSidebar}
            setOpenSidebar={setOpenSidebar}
          />
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
