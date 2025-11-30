import React, { useState, useEffect } from "react";
import { Tab } from "../../constants/ManageTabs";
import { useNavigate, useLocation } from "react-router-dom";
import ApprovedReportsTable from "../../components/section/reports/Reports";

const ApprovedReports = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [setIsActive] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabName = params.get("tab");
    if (tabName == null) {
      document.title = "Approved Reports";
    }
    if (tabName) {
      const tabIndex = Tab.findIndex(
        (tab) => tab.text.toLowerCase() === tabName.toLowerCase()
      );
      if (tabIndex !== -1) {
        setIsActive(tabIndex);
      }
    } else {
      navigate(`?tab=ApprovedReports`);
    }
  }, [location, navigate, setIsActive]);

  return (
    <div className="ml-[280px]">
      <ApprovedReportsTable />
    </div>
  );
};

export default ApprovedReports;