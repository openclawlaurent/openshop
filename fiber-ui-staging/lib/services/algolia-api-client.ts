import type { AlgoliaSearchResponse, AlgoliaSearchOptions } from "@/types/algolia";

/**
 * Client for the unified Algolia search API
 * Works in both client and server contexts
 */

/**
 * Search via the /api/search endpoint
 * This is the single entry point for all Algolia searches
 */
export async function searchViaAPI(
  query: string = "",
  options: AlgoliaSearchOptions = {},
): Promise<AlgoliaSearchResponse> {
  try {
    // Build query params for GET request
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (options.hitsPerPage) params.set("hitsPerPage", options.hitsPerPage.toString());
    if (options.page) params.set("page", options.page.toString());
    if (options.sortBy) params.set("sortBy", options.sortBy);
    if (options.facets) params.set("facets", "true");
    if (options.filters) params.set("filters", JSON.stringify(options.filters));

    const url = `/api/search?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Search API failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Search API client error:", error);
    return {
      hits: [],
      totalHits: 0,
      totalPages: 0,
      currentPage: 0,
      typeDistribution: { merchant: 0, product: 0, collection: 0 },
    };
  }
}

/**
 * Search via POST for complex queries
 * Use this when filters are too large for URL params
 */
export async function searchViaAPIPOST(
  query: string = "",
  options: AlgoliaSearchOptions = {},
): Promise<AlgoliaSearchResponse> {
  try {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, options }),
    });

    if (!response.ok) {
      throw new Error(`Search API failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Search API client error:", error);
    return {
      hits: [],
      totalHits: 0,
      totalPages: 0,
      currentPage: 0,
      typeDistribution: { merchant: 0, product: 0, collection: 0 },
    };
  }
}
