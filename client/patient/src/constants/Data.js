// import { GiGymBag } from "react-icons/gi";
import {
  FaUpload,
  FaFileAlt,
  FaBell,
  FaCog,
  FaComments
} from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";

export const Main = [
  {
    icon: <AiFillHome size={20} />,
    text: "Home",
    route:'/dashboard' // ✅ This is correct for home
  },
  {
    icon: <FaUpload size={20} />,
    text: "Upload ECG",
    route:'/upload-ecg' // ✅ This is correct
  },
  {
    icon: <FaFileAlt size={20}/>,
    text: "Reports",
    route:'/reports'
  },
    {
    icon: <FaBell size={20}/>,
    text: "Notifications",
    route:'/notifications'
  },
    {
    icon: <FaCog  size={20}/>,
    text: "Settings",
    route:'/settings'
  },
  {
    icon: <FaComments  size={20}/>,
    text: "Chat Bot",
    route:'/chatbot'
  },
  {
    icon: <FaComments  size={20}/>,
    text: "Messages",
    route:'/Message'
  },
];
