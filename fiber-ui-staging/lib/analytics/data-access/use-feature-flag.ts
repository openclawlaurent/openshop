"use client";

import { useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";

/**
 * Hook to check if a PostHog feature flag is enabled
 *
 * @param flagKey - The feature flag key to check
 * @param defaultValue - Default value if flag is not loaded yet (default: false)
 * @returns Object with isEnabled boolean and isLoading boolean
 *
 * @example
 * ```tsx
 * const { isEnabled, isLoading } = useFeatureFlag('login-social-auth');
 *
 * if (isLoading) return <Skeleton />;
 * if (isEnabled) return <FeatureComponent />;
 * ```
 */
export function useFeatureFlag(flagKey: string, defaultValue: boolean = false) {
  const posthog = usePostHog();
  const [isEnabled, setIsEnabled] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!posthog) {
      setIsLoading(false);
      return;
    }

    // Check if flags are already loaded
    const checkFlag = () => {
      const flagValue = posthog.isFeatureEnabled(flagKey);
      setIsEnabled(flagValue ?? defaultValue);
      setIsLoading(false);
    };

    // Wait for flags to be loaded (this will fire when flags are initially loaded or reloaded)
    const unsubscribe = posthog.onFeatureFlags(() => {
      checkFlag();
    });

    // Also check immediately in case flags are already loaded
    checkFlag();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [posthog, flagKey, defaultValue]);

  return { isEnabled, isLoading };
}

/**
 * Hook to get all active feature flags
 * Useful for debugging or conditional rendering based on multiple flags
 */
export function useFeatureFlags() {
  const posthog = usePostHog();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!posthog) {
      setIsLoading(false);
      return;
    }

    posthog.onFeatureFlags(() => {
      // Note: PostHog doesn't provide a getFeatureFlags() method
      // This is a simplified version that just marks the loading as complete
      // Individual flags should be checked with isFeatureEnabled()
      setIsLoading(false);
    });
  }, [posthog]);

  return { isLoading };
}
