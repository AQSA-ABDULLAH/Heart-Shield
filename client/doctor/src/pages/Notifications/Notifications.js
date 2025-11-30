import React, { useEffect } from "react";
import DoctorNotificationsPanel from "../../components/section/notifications/Notifications";

const DoctorNotifications = () => {

  useEffect(() => {
    document.title = "Doctor Notifications";
  }, []);

  return (
    // (Doctor dashboard ka layout istemal karein)
    <div className="ml-[280px]"> 
      <DoctorNotificationsPanel />
    </div>
  );
};

export default DoctorNotifications;