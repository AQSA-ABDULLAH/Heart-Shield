import React, { useState, useEffect } from "react";
import { Tab } from "../../constants/ManageTabs";
import { useNavigate, useLocation } from "react-router-dom";
import Uploader from "../../components/section/upload-ecg/Upload-ECG";

const ECGUploader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [setIsActive] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabName = params.get("tab");
    if (tabName == null) {
      document.title = "ECG Uploader";
    }
    if (tabName) {
      const tabIndex = Tab.findIndex(
        (tab) => tab.text.toLowerCase() === tabName.toLowerCase()
      );
      if (tabIndex !== -1) {
        setIsActive(tabIndex);
      }
    } else {
      navigate(`?tab=ECGUploader`);
    }
  }, [location, navigate, setIsActive]);

  return (
    <div className="ml-[280px]">
     <Uploader />
    </div>
  );
};

export default ECGUploader;

