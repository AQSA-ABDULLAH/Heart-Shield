import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import RoutesStack from "./Routes";
import Sidebar from "../components/molecules/sidebar/Sidebar";
import ForgetPasswordOtp from "../login-model/forget-password/OtpCode";
import Login from "../pages/Login/Login";
import {Route,Routes} from 'react-router-dom'
import { useSelector } from "react-redux";
import Signup from "../login-model/signup/Signup";
import { useLocation } from 'react-router-dom';

const GlobalRoute = () => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const isSignedIn = useSelector((state) => state.auth.isSignedIn);
  const navigate = useNavigate();
  const location = useLocation(); // 👈 get current path

    useEffect(() => {
      const publicRoutes = ["/login", "/signup", "/forget-password-otp"];
  
      if (!isSignedIn) {
        if (!publicRoutes.includes(location.pathname)) {
          navigate("/login");
        }
      } else {
        if (publicRoutes.includes(location.pathname)) {
          navigate("/");
        }
      }
    }, [isSignedIn, navigate, location.pathname]);


  return (
    <>
      {isSignedIn ?
        (
          <>
            <RoutesStack
              openSidebar={openSidebar}
              setOpenSidebar={setOpenSidebar}
            />
            <Sidebar openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
          </>
        ) :
        (
          <Routes>
            <Route path='/login' element={<Login />}/>
            <Route path="/signup" element={<Signup />} />
             <Route path="/forget-password-otp" element={<ForgetPasswordOtp />} />
          </Routes>
        )
      }
    </>
  );
};


export default GlobalRoute;