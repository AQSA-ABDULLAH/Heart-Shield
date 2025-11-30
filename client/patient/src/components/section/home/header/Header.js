import React from 'react';
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="flex justify-between items-center h-[80px] px-[24px] bg-[#580101] border-b border-red-900">
            <h1 className="text-[32px] font-bold">HeartSheild</h1>
            <nav className="space-x-[50px] text-[20px] font-regular text-[#999999]">
              <Link to="/" className="hover:text-white">
                Home
              </Link>
              <Link to="/about-us" className="hover:text-white">
                About Us
              </Link>
            </nav>
          </header>
  )
}

export default Header
