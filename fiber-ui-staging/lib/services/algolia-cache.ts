import { unstable_cache } from "next/cache";
import { AlgoliaSearchOptions, AlgoliaSearchResponse } from "@/types/algolia";
import { algoliaSearchServer } from "./algolia-search-server";

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  // 1 hour cache duration
  REVALIDATE_TIME: 3600,
  // Cache tags for invalidation
  TAGS: {
    SEARCH: "algolia-search",
    TOP_OFFERS: "algolia-top-offers",
    ALL: "algolia-all",
  },
} as const;

/**
 * Generate a stable cache key from search parameters
 */
function generateCacheKey(query: string = "", options: AlgoliaSearchOptions = {}): string {
  // Normalize query (lowercase, trim)
  const normalizedQuery = query.toLowerCase().trim();

  // Create a deterministic string from options
  const optionsKey = JSON.stringify({
    filters: options.filters,
    hitsPerPage: options.hitsPerPage,
    page: options.page,
    facets: options.facets,
    sortBy: options.sortBy,
  });

  return `${normalizedQuery}:${optionsKey}`;
}

/**
 * Cached unified search - persists across serverless function instances
 */
export const getCachedUnifiedSearch = unstable_cache(
  async (cacheKey: string, query: string = "", options: AlgoliaSearchOptions = {}) => {
    // cacheKey is used for cache segmentation but we use the actual params for search
    return algoliaSearchServer.searchUnified(query, options);
  },
  ["algolia-unified-search"],
  {
    revalidate: CACHE_CONFIG.REVALIDATE_TIME,
    tags: [CACHE_CONFIG.TAGS.SEARCH, CACHE_CONFIG.TAGS.ALL],
  },
);

/**
 * Cached top offers - persists across serverless function instances
 * Device ID is used as cache key to support per-device caching if needed
 */
export const getCachedTopOffers = unstable_cache(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (cacheKey: string) => {
    // cacheKey is used by unstable_cache to generate unique cache entries
    return algoliaSearchServer.getTopOffers();
  },
  ["algolia-top-offers"],
  {
    revalidate: CACHE_CONFIG.REVALIDATE_TIME,
    tags: [CACHE_CONFIG.TAGS.TOP_OFFERS, CACHE_CONFIG.TAGS.ALL],
  },
);

/**
 * Public API for cached search with automatic key generation
 */
export async function searchAlgoliaCached(
  query: string = "",
  options: AlgoliaSearchOptions = {},
): Promise<AlgoliaSearchResponse> {
  const cacheKey = generateCacheKey(query, options);
  return getCachedUnifiedSearch(cacheKey, query, options);
}

/**
 * Public API for cached top offers
 */
export async function getTopOffersCached(deviceId?: string): Promise<AlgoliaSearchResponse> {
  return getCachedTopOffers(deviceId || "default");
}

/**
 * Cache tags for revalidation
 */
export const ALGOLIA_CACHE_TAGS = CACHE_CONFIG.TAGS;
