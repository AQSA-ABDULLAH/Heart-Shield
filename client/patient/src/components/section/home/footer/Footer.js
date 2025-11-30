import React from "react";

function Footer() {
  return (
    <footer className="bg-[#580101] px-[116px] py-[47px] text-[16px] text-[#999999] tracking-[0.8px]">
      <div className="flex flex-col md:flex-row justify-between gap-[58px]">
        <div className="flex-1">
          <h4 className="text-white text-[24px] font-bold mb-[25px]">HeartSheild</h4>
          <p>
            Revolutionizing heart health monitoring with artificial intelligence.
          </p>
        </div>
        <div className="flex-1">
          <h4 className="text-white text-[18px] font-bold mb-[25px]">Quick Links</h4>
          <ul className="space-y-[8px]">
            <li>
              <a href="/about-us">About Us</a>
            </li>
            <li>
              <a href="#">Health Tips</a>
            </li>
          </ul>
        </div>
        <div className="flex-1">
          <h4 className="text-white text-[18px] font-bold mb-[25px]">Resources</h4>
          <ul className="space-y-1">
            <li>
              <a href="#">Blog</a>
            </li>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
          </ul>
        </div>
        <div className="flex-1">
          <h4 className="text-white text-[18px] font-bold mb-[25px]">Connect</h4>
          <ul className="space-y-1">
            <li>
              <a href="#">Instagram</a>
            </li>
            <li>
              <a href="#">LinkedIn</a>
            </li>
            <li>
              <a href="#">Twitter</a>
            </li>
            <li>
              <a href="#">Facebook</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
