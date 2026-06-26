// Lightweight GA4 wrapper. Safe to call from any client component;
// becomes a no-op when VITE_GA4_MEASUREMENT_ID isn't configured.
export const GA_MEASUREMENT_ID = (import.meta.env.VITE_GA4_MEASUREMENT_ID ?? "") as string;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEvent =
  | "click_call_now"
  | "click_whatsapp"
  | "click_directions"
  | "appointment_booked"
  | "contact_submitted";

export function trackEvent(name: AnalyticsEvent, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  try {
    window.gtag("event", name, params);
  } catch {
    /* swallow analytics errors — never block UX */
  }
}