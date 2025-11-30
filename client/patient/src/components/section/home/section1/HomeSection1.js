import React from "react";
import StatsCard from "./StatsCard";
import TipCard from "./TipCard";

function HomeSection1() {
  return (
    <section className=" flex flex-col md:flex-row justify-between">
      {/* Left Text & Stats */}
      <div>
        <h2 className="w-[474px] font-inter text-[56px] font-bold leading-[61.6px]">
          AI-Powered Heart Health
        </h2>

        <p className="w-[573px] text-[#999999] font-inter text-[20px] font-normal leading-[30px] mt-[24px]">
          Advanced real-time monitoring and instant analysis powered by
          artificial intelligence for comprehensive cardiac care.
        </p>

        {/* Stats */}
        <div className="flex gap-[24px] mt-[36px]">
          <StatsCard percentage="98%" label="Accuracy" />
          <StatsCard percentage="24/7" label="Monitoring" />
          <StatsCard percentage="10K+" label="Users Served" />
        </div>
      </div>

      {/* Right Image & Tips */}
      <div className="relative mt-10 md:mt-0">
        <img
          src="/assest/heart.png"
          alt="Heart"
          className="w-[488px] h-[484px] mx-auto mt-[24px]"
        />
        {/* Tooltips */}
        <div>
          <TipCard
            position="top-[10px] -left-[45px]"
            width="227px"
            height="126px"
            title="Eat Smart"
            description="A balanced diet is key to heart health"
          />

          <TipCard
            position="bottom-[0px] -left-[78px]"
            width="225px"
            height="99px"
            title="Stay Fit"
            description="30 Min daily exercise keeps your heart fit"
          />

          <TipCard
            position="-bottom-[90px] right-[60px]"
            width="205px"
            height="147px"
            title="Check Regularly"
            description="Timely checkups prevent heart disease"
          />
        </div>
      </div>
    </section>
  );
}

export default HomeSection1;
