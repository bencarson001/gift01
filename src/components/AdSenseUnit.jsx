import React, { useEffect, useRef } from "react";

// Replace YOUR_PUBLISHER_ID with your real AdSense publisher ID (ca-pub-XXXXXXXXXXXXXXXX)
// Replace YOUR_AD_SLOT with your real ad slot ID
const PUBLISHER_ID = "ca-pub-XXXXXXXXXXXXXXXX";
const AD_SLOT = "XXXXXXXXXX";
const AD_ENABLED = PUBLISHER_ID !== "ca-pub-XXXXXXXXXXXXXXXX";

export default function AdSenseUnit({ className = "" }) {
  const adRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!AD_ENABLED || pushed.current) return;
    try {
      pushed.current = true;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // AdSense not loaded yet
    }
  }, []);

  if (!AD_ENABLED) {
    // Placeholder shown until you add your real publisher ID
    return (
      <div className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 text-xs font-medium py-6 ${className}`}>
        📢 AdSense Ad Unit — add your publisher ID in AdSenseUnit.jsx
      </div>
    );
  }

  return (
    <div className={className} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}