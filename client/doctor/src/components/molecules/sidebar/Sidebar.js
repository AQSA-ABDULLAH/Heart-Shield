import React from "react";
import SidebarLinks from "./SidebarLinks";
import { Main } from "../../../constants/Data";
import { LiaTimesSolid } from "react-icons/lia";
import { FaSignOutAlt } from "react-icons/fa";
import styles from "./SidebarStyles.module.css";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { setSignedOut } from "../../../redux/containers/auth/actions";

const Sidebar = ({ openSidebar, setOpenSidebar }) => {
  const dispatch = useDispatch();
  const handleLinkClick = () => {
    if (openSidebar) {
      setOpenSidebar(false);
    }
  };

  const logout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of this session!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2D0101",
      cancelButtonColor: "#c4c0c0",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(setSignedOut());
        Swal.fire("Logged Out!", "You have been logged out.", "success");
      }
    });
  };

  return (
    <>
      <aside
        className={`${styles.sidebar} ${
          openSidebar ? `${styles.activeSidebar}` : ""
        } `}
      >
        <h1 className="text-[24px] font-bold">HeartShield</h1>

        {/* Data.js->Main */}
        <div className={` ${styles.linksBlock} `}>
          <SidebarLinks data={Main} handleLinkClick={handleLinkClick} />
        </div>

        <button className={styles.sideLink} onClick={() => logout()}>
          <div>
           <FaSignOutAlt size={20} />
          </div>
          <p className={styles.logout}>logout</p>
        </button>
        <LiaTimesSolid
          className={styles.closeIcon}
          color="#000"
          onClick={() => setOpenSidebar(!openSidebar)}
        />
      </aside>
    </>
  );
};

export default Sidebar;
