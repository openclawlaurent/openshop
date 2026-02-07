"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: "/api/ngmi",
      ui_host: "https://us.i.posthog.com", // For dashboards/session replay playback
      person_profiles: "identified_only",
      capture_pageview: false,
      autocapture: false,
      // disable_session_recording: true,
    });
  } else {
    console.debug("No PostHog key found");
  }
}

export function PostHogClientProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
