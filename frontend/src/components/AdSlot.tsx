"use client";

import React, { useEffect, useState } from "react";

interface AdSlotProps {
  placement: "banner" | "sidebar" | "below_result";
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ placement, className = "" }) => {
  const [canShowAds, setCanShowAds] = useState(false);
  const adsEnabled = process.env.NEXT_PUBLIC_ENABLE_ADS === "true";

  useEffect(() => {
    // Check cookie consent
    const consent = localStorage.getItem("pdf_tool_cookie_consent");
    if (adsEnabled && consent === "accepted") {
      setCanShowAds(true);
    }
  }, [adsEnabled]);

  // Size styling per placement to prevent Cumulative Layout Shift (CLS)
  const placementStyles = {
    banner: "w-full max-w-4xl mx-auto min-h-[90px] h-[90px] my-6",
    sidebar: "w-full min-h-[250px] h-[250px] my-4",
    below_result: "w-full max-w-xl mx-auto min-h-[120px] mt-8 pt-4",
  };

  if (!adsEnabled) {
    return null;
  }

  return (
    <div
      aria-label="Advertisement"
      className={`relative rounded-2xl border border-dashed border-slate-300 dark:border-slate-700/80 bg-slate-100/50 dark:bg-slate-800/40 flex flex-col items-center justify-center text-center p-3 select-none overflow-hidden transition-all ${placementStyles[placement]} ${className}`}
    >
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-1">
        Advertisement
      </span>

      {canShowAds ? (
        <div className="text-xs text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1.5">
          <span>Google AdSense Slot</span>
          <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
            {placement}
          </span>
        </div>
      ) : (
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Ads appear only after accepting cookies
        </span>
      )}
    </div>
  );
};

