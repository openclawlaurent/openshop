/**
 * Server-side offer fetching
 * WARNING: This file uses server-only imports and should ONLY be imported in Server Components
 * For Client Components, use offers-client.ts instead
 */

import { Offer } from "@/app/api/offers/route";
import type { AlgoliaSearchFilters } from "@/types/algolia";
import { getCategoryBySlug, getSortOptionBySlug } from "@/lib/services/merchant-filters";

export async function getOffersSSR(
  query?: string,
  category?: string,
  sort?: string,
): Promise<Offer[]> {
  try {
    // Use cached Algolia search for SSR
    const { searchAlgoliaCached } = await import("@/lib/services/algolia-cache");
    const { transformUnifiedResultToOfferServer } = await import(
      "@/lib/services/algolia-search-server"
    );

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

    // Perform cached search with or without query (search all record types)
    const searchResponse = await searchAlgoliaCached(query || "", {
      hitsPerPage: 39,
      filters: algoliaFilters,
      sortBy,
    });

    const transformedResults = searchResponse.hits.map((hit) => ({
      ...transformUnifiedResultToOfferServer(hit),
      queryID: searchResponse.queryID, // Pass queryID for click tracking
    }));

    // LOG SSR SEARCH RESPONSE
    console.log("✅ ALGOLIA SSR RESPONSE (CACHED):", {
      timestamp: new Date().toISOString(),
      query: query || "<empty search>",
      category: category || "all",
      sort: sort || "relevant",
      resultsCount: transformedResults.length,
      totalHits: searchResponse.totalHits,
      hasQueryID: !!searchResponse.queryID,
      source: "ssr-offers-data-access-cached",
    });

    return transformedResults;
  } catch (error) {
    console.error("❌ SSR: Error fetching offers from Algolia:", {
      timestamp: new Date().toISOString(),
      query: query || "<empty search>",
      error: error,
      source: "ssr-offers-data-access-cached",
    });
    return [];
  }
}
