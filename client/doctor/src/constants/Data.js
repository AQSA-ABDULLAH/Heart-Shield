import { AiFillHome } from "react-icons/ai";
import { FaFileAlt, FaCheck, FaBell, FaCog } from "react-icons/fa";

export const Main = [
  {
    icon: <AiFillHome size={20} />,
    text: "Home",
    route: '/', // ✅ This is correct for home
  },
  {
    icon: <FaFileAlt size={20} />,
    text: "Review Cases",
    route: '/review-cases', // ✅ File icon used here
  },
  {
    icon: <FaCheck size={20} />,
    text: "Approved Reports",
    route: '/approved-reports', // ✅ Simple tick used here
  },
  {
    icon: <FaBell size={20} />,
    text: "Notifications",
    route: '/notifications',
  },
  {
    icon: <FaCog size={20} />,
    text: "Settings",
    route: '/settings',
  },
];
