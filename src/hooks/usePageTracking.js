import { useEffect } from "react";
import { trackPageView, trackSessionEnd } from "@/lib/analytics";
import { base44 } from "@/api/base44Client";

export function usePageTracking(pageName) {
  useEffect(() => {
    let userEmail = null;
    base44.auth.me().then(u => { userEmail = u?.email; }).catch(() => {});

    // Small delay to let auth resolve
    const timer = setTimeout(() => {
      trackPageView(pageName, userEmail);
    }, 500);

    const handleUnload = () => trackSessionEnd(userEmail);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [pageName]);
}