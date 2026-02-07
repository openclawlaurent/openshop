"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { analytics } from "@/lib/analytics/posthog";
import { usePostHog } from "posthog-js/react";

export function PostHogUserIdentify() {
  const { user, loading } = useAuth();
  const posthog = usePostHog();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Identify the user in PostHog
        analytics.identify(user.id, {
          email: user.email,
          created_at: user.created_at,
        });

        // Set person properties for feature flags
        // This ensures feature flags can target users based on these properties
        if (posthog) {
          posthog.setPersonPropertiesForFlags({
            email: user.email || "",
            user_id: user.id,
            created_at: user.created_at,
          });
        }
      } else {
        // Reset PostHog when user logs out
        analytics.reset();
        // Reload feature flags after reset to ensure they're available for anonymous users
        if (posthog) {
          posthog.reloadFeatureFlags();
        }
      }
    }
  }, [user, loading, posthog]);

  return null;
}
