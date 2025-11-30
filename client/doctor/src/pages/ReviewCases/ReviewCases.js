import React, { useState, useEffect } from "react";
import { Tab } from "../../constants/ManageTabs";
import { useNavigate, useLocation } from "react-router-dom";
import HighRiskCasesTable from "../../components/section/review-cases/ReviewCases";

const ReviewCases = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [setIsActive] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabName = params.get("tab");
    if (tabName == null) {
      document.title = "Review Cases";
    }
    if (tabName) {
      const tabIndex = Tab.findIndex(
        (tab) => tab.text.toLowerCase() === tabName.toLowerCase()
      );
      if (tabIndex !== -1) {
        setIsActive(tabIndex);
      }
    } else {
      navigate(`?tab=ReviewCases`);
    }
  }, [location, navigate, setIsActive]);

  return (
    <div className="ml-[280px]">
      <HighRiskCasesTable />
    </div>
  );
};

export default ReviewCases;
