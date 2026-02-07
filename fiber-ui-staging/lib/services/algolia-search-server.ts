import { algoliasearch } from "algoliasearch";
import {
  AlgoliaUnifiedRecord,
  AlgoliaMerchantRecord,
  AlgoliaSearchOptions,
  AlgoliaSearchResponse,
  AlgoliaIndexConfig,
} from "@/types/algolia";
import {
  generateAffiliateLink,
  canGenerateAffiliateLink,
} from "@/lib/utils/affiliate-link-generator";
import {
  buildFilterString,
  buildNumericFilters,
  getFacetConfig,
  calculateTypeDistribution,
} from "./algolia-filters";

// Algolia configuration for server-side use
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "";
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || "";

/**
 * Validate and get the Algolia index name
 * Throws at runtime if the environment variable is not set
 */
function getAlgoliaIndexName(): string {
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_INDEX;
  if (!indexName) {
    throw new Error(
      "NEXT_PUBLIC_ALGOLIA_SEARCH_INDEX is required. Please set this environment variable.",
    );
  }
  return indexName;
}

// Index configuration - uses lazy evaluation via getter
const INDEX_CONFIG: AlgoliaIndexConfig = {
  get unifiedIndex() {
    return getAlgoliaIndexName();
  },
  // merchantIndex: "search_v2",
  // productIndex: "search_v2",
  // collectionIndex: "search_v2",
};

// Lazy-initialized Algolia client for server-side use - only creates when first used
let searchClient: ReturnType<typeof algoliasearch> | null = null;

/**
 * Get or initialize the Algolia search client for server-side use
 * Lazy initialization prevents errors when credentials are missing during app boot
 */
function getSearchClient(): ReturnType<typeof algoliasearch> {
  if (searchClient) {
    return searchClient;
  }

  if (!ALGOLIA_APP_ID || !ALGOLIA_SEARCH_KEY) {
    throw new Error(
      "Algolia credentials are required. Please set NEXT_PUBLIC_ALGOLIA_APP_ID and NEXT_PUBLIC_ALGOLIA_SEARCH_KEY environment variables.",
    );
  }

  searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
  return searchClient;
}

export class AlgoliaSearchServer {
  /**
   * Server-side unified search
   */
  async searchUnified(
    query: string = "",
    options: AlgoliaSearchOptions = {},
  ): Promise<AlgoliaSearchResponse> {
    const client = getSearchClient();

    // Search metadata for debugging if needed
    // const searchMetadata = {
    //   timestamp: new Date().toISOString(),
    //   query: query || "<empty search>",
    //   queryLength: query.length,
    //   options: {
    //     hitsPerPage: options.hitsPerPage || 20,
    //     page: options.page || 0,
    //     hasFilters: !!options.filters,
    //     hasFacets: !!options.facets,
    //     sortBy: options.sortBy || "relevance",
    //   },
    //   source: "algolia-unified-server",
    //   indexName: INDEX_CONFIG.unifiedIndex,
    //   stackTrace: new Error().stack?.split("\n").slice(1, 4),
    // };

    try {
      const searchOptions: Record<string, unknown> = {
        hitsPerPage: options.hitsPerPage || 20,
        page: options.page || 0,
      };

      if (options.filters) {
        const filterString = buildFilterString(options.filters);
        if (filterString) {
          searchOptions.filters = filterString;
        }

        const numericFiltersArray = buildNumericFilters(options.filters);
        if (numericFiltersArray.length > 0) {
          searchOptions.numericFilters = numericFiltersArray;
        }
      }

      if (options.facets) {
        searchOptions.facets = getFacetConfig(options.filters);
        searchOptions.maxValuesPerFacet = 100;
      }

      // Handle sorting via Algolia replica indices
      // Replica indices are pre-sorted by specific attributes for efficient server-side sorting
      // Format: "attribute:direction" maps to replica index name
      let indexToSearch = INDEX_CONFIG.unifiedIndex;

      if (options.sortBy) {
        const replicaMap: Record<string, string> = {
          "domainBoost:desc": `${INDEX_CONFIG.unifiedIndex}_domainBoost_desc`,
          "maxRateAmount:desc": `${INDEX_CONFIG.unifiedIndex}_maxRateAmount_desc`,
        };

        const replicaIndex = replicaMap[options.sortBy];
        if (replicaIndex) {
          indexToSearch = replicaIndex;
        }
      }

      const results = await client.searchSingleIndex({
        indexName: indexToSearch,
        searchParams: {
          query,
          ...searchOptions,
          clickAnalytics: true, // Enable click analytics to get queryID
        },
      });

      const hits = results.hits as AlgoliaUnifiedRecord[];

      const typeDistribution = calculateTypeDistribution(hits);

      const searchResponse: AlgoliaSearchResponse = {
        hits,
        totalHits: results.nbHits || 0,
        totalPages: results.nbPages || 0,
        currentPage: results.page || 0,
        queryID: results.queryID, // Include queryID for click tracking
        facets: results.facets,
        typeDistribution,
      };

      return searchResponse;
    } catch (error) {
      // Suppress error logging in test environment and during build
      if (process.env.NODE_ENV !== "test" && process.env.NODE_ENV !== "production") {
        console.error("Algolia unified search failed (server):", error);
      }

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
   * Get top offers with unified index structure
   * Prioritizes merchants but can include products and collections in the future
   * NOTE: This method is no longer cached here - use getCachedTopOffers from algolia-cache.ts
   */
  async getTopOffers(): Promise<AlgoliaSearchResponse> {
    const client = getSearchClient();

    try {
      // First, get merchants sorted by merchantScore
      const results = await client.searchSingleIndex({
        indexName: INDEX_CONFIG.unifiedIndex,
        searchParams: {
          query: "",
          hitsPerPage: 200,
          filters: "type:merchant AND NOT wildfireMerchantId:202840", // Focus on merchants, exclude blacklisted
        },
      });

      // Sort by merchantScore and filter for unique merchantIds
      const seenMerchantIds = new Set<number>();
      const hits = results.hits as AlgoliaMerchantRecord[];
      const uniqueSortedOffers = hits
        .sort((a, b) => (b.merchantScore || 0) - (a.merchantScore || 0))
        .filter((offer) => {
          if (seenMerchantIds.has(offer.wildfireMerchantId)) {
            return false;
          }
          seenMerchantIds.add(offer.wildfireMerchantId);
          return true;
        })
        .slice(0, 30);

      const response: AlgoliaSearchResponse = {
        hits: uniqueSortedOffers,
        totalHits: uniqueSortedOffers.length,
        totalPages: 1,
        currentPage: 0,
        typeDistribution: { merchant: uniqueSortedOffers.length, product: 0, collection: 0 },
      };

      return response;
    } catch (error) {
      // Suppress error logging in test environment and during build
      if (process.env.NODE_ENV !== "test" && process.env.NODE_ENV !== "production") {
        console.error("Failed to fetch top offers:", error);
      }
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
   * Get merchant tracking URL (maintaining compatibility)
   */
  getMerchantTrackingUrl(merchant: AlgoliaMerchantRecord, wildfireDeviceId: string): string {
    const trackingId = merchant.activeDomainId || merchant.wildfireMerchantId;

    if (!canGenerateAffiliateLink(trackingId, wildfireDeviceId)) {
      return "";
    }

    return generateAffiliateLink({
      provider: "wildfire",
      trackingId: trackingId!,
      deviceId: wildfireDeviceId,
    });
  }
}

// Export singleton instance for server use
export const algoliaSearchServer = new AlgoliaSearchServer();

// Helper function to transform server-side results to legacy Offer interface
export function transformUnifiedResultToOfferServer(result: AlgoliaUnifiedRecord): {
  id: string;
  image?: string;
  title: string;
  rewardLabel: string;
  href?: string;
  trackingId?: number;
  allRates?: Array<{
    kind: string;
    name: string;
    amount: string;
    numeric_amount?: number;
  }>;
  type?: string;
} {
  // Import at runtime to avoid circular dependency issues
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { transformUnifiedResultToLegacyOffer } = require("@/lib/utils/search-result-mapper");
  const transformedResult = transformUnifiedResultToLegacyOffer(result);

  // Server-side should not generate href for ISR caching purposes
  return {
    ...transformedResult,
    href: undefined,
  };
}
