import { base44 } from "@/api/base44Client";

// Generate or retrieve a session ID
function getSessionId() {
  let id = sessionStorage.getItem("session_id");
  if (!id) {
    id = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    sessionStorage.setItem("session_id", id);
    sessionStorage.setItem("session_start", Date.now().toString());
  }
  return id;
}

function getSessionStart() {
  return parseInt(sessionStorage.getItem("session_start") || Date.now().toString(), 10);
}

function parseReferrer() {
  const ref = document.referrer;
  if (!ref) return "direct";
  try {
    const url = new URL(ref);
    const host = url.hostname.replace("www.", "");
    if (host.includes("google")) return "google";
    if (host.includes("facebook") || host.includes("fb.")) return "facebook";
    if (host.includes("instagram")) return "instagram";
    if (host.includes("twitter") || host.includes("x.com")) return "twitter";
    if (host.includes("tiktok")) return "tiktok";
    if (host.includes("bing")) return "bing";
    if (host.includes("yahoo")) return "yahoo";
    return host;
  } catch {
    return "unknown";
  }
}

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobi|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

function getCountry() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone?.split("/")[0] || "Unknown";
  } catch {
    return "Unknown";
  }
}

// Track a page view
export async function trackPageView(page, userEmail = null) {
  base44.entities.AnalyticsEvent.create({
    event_type: "page_view",
    page,
    session_id: getSessionId(),
    referrer: parseReferrer(),
    device_type: getDeviceType(),
    country: getCountry(),
    language: navigator.language || "en",
    user_email: userEmail,
  }).catch(() => {});
}

// Track a feature being used
export async function trackFeature(feature, page = null, metadata = null, userEmail = null) {
  base44.entities.AnalyticsEvent.create({
    event_type: "feature_used",
    feature,
    page,
    session_id: getSessionId(),
    device_type: getDeviceType(),
    user_email: userEmail,
    metadata,
  }).catch(() => {});
}

// Track session end (call on beforeunload)
export async function trackSessionEnd(userEmail = null) {
  const durationSeconds = Math.round((Date.now() - getSessionStart()) / 1000);
  navigator.sendBeacon && navigator.sendBeacon; // noop — we use sync entity create
  base44.entities.AnalyticsEvent.create({
    event_type: "session_end",
    session_id: getSessionId(),
    session_duration_seconds: durationSeconds,
    device_type: getDeviceType(),
    user_email: userEmail,
  }).catch(() => {});
}