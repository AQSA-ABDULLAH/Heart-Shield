// import { GiGymBag } from "react-icons/gi";
import { AiFillHome } from "react-icons/ai";
import { FaUserMd, FaUserInjured } from "react-icons/fa";

export const Main = [
  {
    icon: <AiFillHome size={20} />,
    text: "Home",
    route: "/",
  },
  {
    icon: <FaUserInjured size={20} />,
    text: "Patient Management",
    route: "/manage-patient",
  },
  {
    icon: <FaUserMd size={20} />,
    text: "Doctor Management",
    route: "/manage-doctor",
  },
];
