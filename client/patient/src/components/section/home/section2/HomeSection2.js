import React from 'react';
import { Link } from 'react-router-dom';

// 1. Import the specific icons from react-icons
import { RxDashboard } from "react-icons/rx";      // Matches the Admin Grid look
import { FaNotesMedical } from "react-icons/fa";   // Matches Doctor/Medical look
import { FiBarChart2 } from "react-icons/fi";      // Matches Patient Stats look
// Note: You can also use { FaAngleRight } from "react-icons/fa" for the arrow if you want to replace that image too.

function HomeSection2() {
  const DOCTOR_URL = process.env.REACT_APP_DOCTOR_URL;
  const ADMIN_URL = process.env.REACT_APP_ADMIN_URL;

  const getLinkPath = (role) => {
    switch (role) {
      case "Patient":
        return "/login";
      case "Admin":
        return `${ADMIN_URL}`;
      case "Doctor":
        return `${DOCTOR_URL}`;
      default:
        return "/";
    }
  };

  // 2. Define your data with the specific icon for each role
  const portalOptions = [
    { 
      role: "Admin", 
      icon: <RxDashboard size={24} /> 
    },
    { 
      role: "Doctor", 
      icon: <FaNotesMedical size={24} /> 
    },
    { 
      role: "Patient", 
      icon: <FiBarChart2 size={24} /> 
    },
  ];

  return (
    <section className="mb-[120px]">
      <h3 className="text-[24px] font-semibold mb-[20px]">Select Your Portal</h3>
      <div className="flex flex-col space-y-[16px]">
        
        {/* 3. Map through the objects instead of just strings */}
        {portalOptions.map((item) => (
          <Link to={getLinkPath(item.role)} key={item.role}>
            <div
              className="w-[600px] h-[75px] flex justify-between items-center bg-[#B55151] hover:bg-[#8d3e3e] text-white px-6 rounded-lg text-[18px] cursor-pointer transition-colors duration-300"
            >
              <div className="flex items-center space-x-[24px]">
                {/* 4. Render the Icon component directly */}
                <div className="w-[24px] h-[24px] flex justify-center items-center">
                   {item.icon}
                </div>
                
                <p>{item.role} Dashboard</p>
              </div>
              <img src="/assest/arrow.png" alt="Arrow" className="w-4 h-4 float-right" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default HomeSection2;