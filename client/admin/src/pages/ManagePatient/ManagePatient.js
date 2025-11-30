import React, { useState, useEffect } from "react";
import { Tab } from "../../constants/ManageTabs";
import { useNavigate, useLocation } from "react-router-dom";
import PatientManagement from "../../components/section/manage-patient/ManagePatient";


const ManagePatient = () => {
   const navigate = useNavigate();
  const location = useLocation();
  const [setIsActive] = useState(0);

   useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabName = params.get("tab");
    if (tabName == null) {
      document.title = "Trips management"
    }
    if (tabName) {
      const tabIndex = Tab.findIndex(tab => tab.text.toLowerCase() === tabName.toLowerCase());
      if (tabIndex !== -1) {
        setIsActive(tabIndex);
      }
    }
    else {
      navigate(`?tab=ManagePatients`);
    }
  }, [location, navigate, setIsActive]);


  return (
   <div className="ml-[280px]">
    <PatientManagement />
    </div>
  );
};

export default ManagePatient;
