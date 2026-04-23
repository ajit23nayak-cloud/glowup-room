"use client";
import posthog from "posthog-js";

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!key || !host) return;
  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only",
    capture_pageview: true,
    autocapture: true,
  });
  initialized = true;
}

export function capture(event: string, props?: Record<string, unknown>) {
  if (typeof window !== "undefined" && initialized) posthog.capture(event, props);
}

export function identify(email: string) {
  if (typeof window !== "undefined" && initialized) posthog.identify(email, { email });
}
