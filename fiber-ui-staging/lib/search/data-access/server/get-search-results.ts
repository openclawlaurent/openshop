/**
 * Server-side search result fetching
 * WARNING: This file uses server-only imports and should ONLY be imported in Server Components
 */

import type { AlgoliaSearchFilters } from "@/types/algolia";
import { getCategoryBySlug, getSortOptionBySlug } from "@/lib/services/merchant-filters";
import type { LegacyOffer } from "@/lib/utils/search-result-mapper";

const IS_MOCK_MODE = process.env.MOCK_ALGOLIA_API === "true";

/**
 * Get search results for server-side rendering
 * Supports query string, category filtering, and sorting
 *
 * @param query - Search query string
 * @param category - Category slug for filtering
 * @param sort - Sort option slug
 * @returns Array of offers (transformed from Algolia records)
 */
export async function getSearchResults(
  query?: string,
  category?: string,
  sort?: string,
): Promise<LegacyOffer[]> {
  try {
    // UX Rule: Search query and category filter are mutually exclusive
    // If both are provided, prioritize search query (more specific user intent)
    let effectiveCategory = category;
    if (query && query.trim()) {
      effectiveCategory = undefined; // Clear category when searching
    }

    // Build Algolia filters from category selection
    const algoliaFilters: AlgoliaSearchFilters = {
      excludeWildfireMerchantIds: [202840], // Always exclude blacklisted merchants
      minMaxRate: 0.01, // Exclude items with 0% cashback
    };

    // Get category from database and use primaryCollectionId filter
    if (effectiveCategory && effectiveCategory !== "all") {
      const categoryData = await getCategoryBySlug(effectiveCategory);
      if (categoryData && categoryData.collection_ids?.length > 0) {
        // Use the first collection ID as the primary filter
        algoliaFilters.primaryCollectionId = categoryData.collection_ids[0];
      }
    }

    // Get sort option from database
    let sortBy: string | undefined;
    if (sort && sort !== "relevant") {
      const sortOption = await getSortOptionBySlug(sort);
      if (sortOption && sortOption.algolia_sort_by) {
        sortBy = sortOption.algolia_sort_by;
      }
    }

    let searchResponse;

    if (IS_MOCK_MODE) {
      // Use mock data directly
      const { getMockSearchResponse } = await import("@/lib/services/algolia-mock-data");
      searchResponse = getMockSearchResponse(query || "", {
        hitsPerPage: 39,
        filters: algoliaFilters,
        sortBy,
      });
    } else {
      // Use cached Algolia search directly
      const { searchAlgoliaCached } = await import("@/lib/services/algolia-cache");
      searchResponse = await searchAlgoliaCached(query || "", {
        hitsPerPage: 39,
        filters: algoliaFilters,
        sortBy,
      });
    }

    const { transformUnifiedResultToOfferServer } = await import(
      "@/lib/services/algolia-search-server"
    );

    const transformedResults = searchResponse.hits.map((hit) => ({
      ...transformUnifiedResultToOfferServer(hit),
      queryID: searchResponse.queryID, // Pass queryID for click tracking
    }));

    // LOG SSR SEARCH RESPONSE
    console.log("✅ ALGOLIA SSR RESPONSE:", {
      timestamp: new Date().toISOString(),
      query: query || "<empty search>",
      category: category || "all",
      sort: sort || "relevant",
      resultsCount: transformedResults.length,
      totalHits: searchResponse.totalHits,
      hasQueryID: !!searchResponse.queryID,
      source: IS_MOCK_MODE ? "mock-api" : "direct-cached",
    });

    return transformedResults;
  } catch (error) {
    console.error("❌ SSR: Error fetching search results:", {
      timestamp: new Date().toISOString(),
      query: query || "<empty search>",
      error: error,
      source: "lib/search/data-access/server",
    });
    return [];
  }
}
