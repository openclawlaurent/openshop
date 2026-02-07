/**
 * Algolia Insights - Search Analytics and Click Tracking
 *
 * This service initializes and manages Algolia Insights for tracking
 * user interactions with search results. Tracked events are used to
 * improve search result relevance and ranking over time.
 *
 * @see https://www.algolia.com/doc/guides/building-search-ui/going-further/send-insights-events/js/
 */

import aa from "search-insights";

// Algolia configuration
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "";
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || "";
const INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_INDEX || "";

/**
 * Get the Algolia index name, throwing an error if not configured
 * This is lazy evaluated so it doesn't throw during build/prerender
 */
function getIndexName(): string {
  if (!INDEX_NAME) {
    throw new Error("NEXT_PUBLIC_ALGOLIA_SEARCH_INDEX is not set");
  }
  return INDEX_NAME;
}

/**
 * Initialize Algolia Insights
 * This should be called once when the app loads
 */
export function initAlgoliaInsights() {
  if (typeof window === "undefined") {
    // Don't initialize on server-side
    return;
  }

  if (!ALGOLIA_APP_ID || !ALGOLIA_SEARCH_KEY) {
    console.warn("❌ Algolia credentials not found. Insights tracking disabled.");
    return;
  }

  try {
    aa("init", {
      appId: ALGOLIA_APP_ID,
      apiKey: ALGOLIA_SEARCH_KEY,
      useCookie: true, // Track user sessions with cookies
    });

    console.log("✅ Algolia Insights initialized successfully:", {
      appId: ALGOLIA_APP_ID,
      index: INDEX_NAME || "(not set)",
      useCookie: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Failed to initialize Algolia Insights:", error);
  }
}

/**
 * Set user token for personalization
 * Call this after user logs in to enable personalized results
 */
export function setUserToken(userId: string) {
  if (typeof window === "undefined") return;

  try {
    aa("setUserToken", userId);
  } catch (error) {
    console.error("Failed to set Algolia user token:", error);
  }
}

/**
 * Track a click on a search result
 *
 * @param objectID - The unique ID of the clicked result
 * @param queryID - The query ID from the search response
 * @param position - The position of the result in the list (1-based)
 */
export function trackSearchResultClick(objectID: string, queryID: string, position: number) {
  if (typeof window === "undefined") {
    console.warn("❌ Click tracking skipped: Not in browser environment");
    return;
  }

  if (!queryID) {
    console.warn("❌ Click tracking failed: queryID is missing", {
      objectID,
      position,
    });
    return;
  }

  try {
    const indexName = getIndexName();

    aa("clickedObjectIDsAfterSearch", {
      index: indexName,
      eventName: "Search Result Clicked",
      objectIDs: [objectID],
      positions: [position],
      queryID: queryID,
    });

    console.log("✅ Click tracked successfully:", {
      objectID,
      queryID,
      position,
      index: indexName,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Failed to track search result click:", {
      error,
      objectID,
      queryID,
      position,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Track a conversion event (e.g., when user completes a purchase)
 *
 * @param objectID - The unique ID of the converted result
 * @param queryID - The query ID from the search response (optional)
 */
export function trackConversion(objectID: string, queryID?: string) {
  if (typeof window === "undefined") return;

  try {
    const indexName = getIndexName();

    if (queryID) {
      aa("convertedObjectIDsAfterSearch", {
        index: indexName,
        eventName: "Purchase Completed",
        objectIDs: [objectID],
        queryID: queryID,
      });
    } else {
      aa("convertedObjectIDs", {
        index: indexName,
        eventName: "Purchase Completed",
        objectIDs: [objectID],
      });
    }
  } catch (error) {
    console.error("Failed to track conversion:", error);
  }
}

/**
 * Track a view event (when user views an item detail page)
 *
 * @param objectID - The unique ID of the viewed result
 */
export function trackView(objectID: string) {
  if (typeof window === "undefined") return;

  try {
    const indexName = getIndexName();

    aa("viewedObjectIDs", {
      index: indexName,
      eventName: "Item Viewed",
      objectIDs: [objectID],
    });
  } catch (error) {
    console.error("Failed to track view:", error);
  }
}

// Export the insights instance for advanced usage
export { aa };
