import React from "react";
import HomeSection1 from "../../components/section/home/section1/HomeSection1";
import HomeSection2 from "../../components/section/home/section2/HomeSection2";
import Header from "../../components/section/home/header/Header";
import Footer from "../../components/section/home/footer/Footer";

function NewDashboard() {
  return (
    <div className="bg-[#2D0101] text-white min-h-screen font-sans">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <div className="ml-[140px] mt-[60px]">
        <HomeSection1 />
        <HomeSection2 />
      </div>

      {/* Footer */}
      <div>
        <Footer />
      </div>
    </div>
  );
}

export default NewDashboard;