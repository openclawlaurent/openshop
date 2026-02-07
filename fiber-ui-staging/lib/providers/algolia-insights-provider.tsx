"use client";

import { useEffect } from "react";
import { initAlgoliaInsights } from "@/lib/services/algolia-insights";

/**
 * Provider that initializes Algolia Insights on app load
 * This must be a client component since Insights only works in the browser
 */
export function AlgoliaInsightsProvider() {
  useEffect(() => {
    // Initialize Algolia Insights when the app loads
    initAlgoliaInsights();
  }, []);

  // This provider doesn't render anything
  return null;
}
