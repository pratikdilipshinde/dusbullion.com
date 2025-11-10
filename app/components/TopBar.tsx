"use client";
import SpotTicker from "./SpotTicker";

export default function TopBar() {
  return (
    <div className="w-full border-b border-neutral-200 bg-[#052a27] backdrop-blur">
      <div className="section flex h-9 items-center justify-center">
        <SpotTicker />
        {/* <div className="text-sm text-[#c89f48]">Free insured shipping over $500</div> */}
        
      </div>
    </div>
  );
}
