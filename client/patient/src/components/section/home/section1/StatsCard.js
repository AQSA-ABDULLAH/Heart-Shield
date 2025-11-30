import React from 'react'

function StatsCard({ percentage, label }) {
  return (
    <div className="w-[184px] h-[130px] flex flex-col justify-center flex-shrink-0 rounded-[16px] border border-[rgba(255,68,68,0.2)] bg-[rgba(255,68,68,0.1)] px-[28px]">
    <p className="text-[#F44] font-inter text-[32px] font-bold leading-[48px]">
      {percentage}
    </p>
    <p className="text-[#999999] font-inter text-[16px] font-normal leading-[24px]">
      {label}
    </p>
  </div>
  )
}

export default StatsCard