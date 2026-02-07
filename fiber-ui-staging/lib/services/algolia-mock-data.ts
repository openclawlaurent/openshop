/**
 * Mock Algolia search data for E2E tests
 *
 * This provides realistic mock data to avoid hitting Algolia API during E2E tests
 * while still allowing full testing of search functionality.
 *
 * Data sourced from actual Algolia results in algolia-hits-example.ts
 */

import {
  AlgoliaUnifiedRecord,
  AlgoliaProductRecord,
  AlgoliaCollectionRecord,
} from "@/types/algolia";
import { results } from "./algolia-hits-example-v1";

// Use actual Algolia results as mock data
export const MOCK_MERCHANTS = results.hits.filter((hit) => hit.type === "merchant");
export const MOCK_PRODUCTS = results.hits.filter((hit) => hit.type === "product");
export const MOCK_COLLECTIONS = results.hits.filter((hit) => hit.type === "collection");

/**
 * Generate mock Algolia search response
 */
export function generateMockAlgoliaResponse(
  query: string = "",
  options: { hitsPerPage?: number; page?: number } = {},
) {
  const { hitsPerPage = 20, page = 0 } = options;

  // Use actual Algolia results
  const allHits = results.hits;

  // Simple filtering by query
  let filteredHits = allHits;
  if (query) {
    const lowerQuery = query.toLowerCase();
    filteredHits = allHits.filter((hit) => {
      let searchableText = "";

      if (hit.type === "merchant") {
        searchableText = `${hit.merchantName} ${hit.description || ""}`.toLowerCase();
      } else if (hit.type === "product") {
        const productHit = hit as unknown as AlgoliaProductRecord;
        searchableText = `${productHit.productTitle} ${hit.description || ""}`.toLowerCase();
      } else if (hit.type === "collection") {
        const collectionHit = hit as unknown as AlgoliaCollectionRecord;
        searchableText = `${collectionHit.collectionName || ""}`.toLowerCase();
      }

      return searchableText.includes(lowerQuery);
    });
  }

  // Pagination
  const start = page * hitsPerPage;
  const end = start + hitsPerPage;
  const paginatedHits = filteredHits.slice(start, end);

  return {
    hits: paginatedHits,
    nbHits: filteredHits.length,
    nbPages: Math.ceil(filteredHits.length / hitsPerPage),
    page,
    hitsPerPage,
    exhaustiveNbHits: true,
    exhaustiveTypo: true,
    exhaustive: { nbHits: true, typo: true },
    query,
    params: `query=${query}&hitsPerPage=${hitsPerPage}&page=${page}`,
    processingTimeMS: 1,
    queryID: `mock-query-${Date.now()}`,
  };
}

/**
 * Generate mock multi-index search response
 */
export function generateMockMultiIndexResponse(
  queries: Array<{ query?: string; params?: { hitsPerPage?: number; page?: number } }>,
) {
  return {
    results: queries.map((q) => generateMockAlgoliaResponse(q.query || "", q.params || {})),
  };
}

/**
 * Strip Algolia metadata from a hit (keeps only the core data)
 */
function stripAlgoliaMetadata(hit: AlgoliaUnifiedRecord) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _snippetResult, _highlightResult, _rankingInfo, ...cleanHit } =
    hit as AlgoliaUnifiedRecord & {
      _snippetResult?: unknown;
      _highlightResult?: unknown;
      _rankingInfo?: unknown;
    };
  return cleanHit;
}

/**
 * Get mock search response in the format expected by the app
 */
export function getMockSearchResponse(
  query: string = "",
  options: {
    hitsPerPage?: number;
    page?: number;
    filters?: unknown;
    sortBy?: string;
    facets?: boolean;
  } = {},
) {
  const { hitsPerPage = 20, page = 0, filters, sortBy } = options;

  // Use actual Algolia results
  let allHits = results.hits;

  // Randomize results when filters or sort are applied (for E2E testing variety)
  if (filters || sortBy) {
    // Create a copy and shuffle the array
    allHits = [...allHits].sort(() => Math.random() - 0.5);
  }

  // Simple filtering by query
  let filteredHits = allHits;
  if (query) {
    const lowerQuery = query.toLowerCase();
    filteredHits = allHits.filter((hit) => {
      let searchableText = "";

      if (hit.type === "merchant") {
        searchableText = `${hit.merchantName} ${hit.description || ""}`.toLowerCase();
      } else if (hit.type === "product") {
        const productHit = hit as unknown as AlgoliaProductRecord;
        searchableText = `${productHit.productTitle} ${hit.description || ""}`.toLowerCase();
      } else if (hit.type === "collection") {
        const collectionHit = hit as unknown as AlgoliaCollectionRecord;
        searchableText = `${collectionHit.collectionName || ""}`.toLowerCase();
      }

      return searchableText.includes(lowerQuery);
    });
  }

  // Calculate type distribution
  const typeDistribution = filteredHits.reduce(
    (acc, hit) => {
      const hitType = hit.type as "merchant" | "product" | "collection";
      acc[hitType]++;
      return acc;
    },
    { merchant: 0, product: 0, collection: 0 },
  );

  // Pagination
  const start = page * hitsPerPage;
  const end = start + hitsPerPage;
  const paginatedHits = filteredHits
    .slice(start, end)
    .map((hit) => stripAlgoliaMetadata(hit as unknown as AlgoliaUnifiedRecord));

  return {
    hits: paginatedHits,
    totalHits: filteredHits.length,
    totalPages: Math.ceil(filteredHits.length / hitsPerPage),
    currentPage: page,
    queryID: `mock-query-${Date.now()}`,
    typeDistribution,
    facets: options.facets
      ? {
          type: { merchant: filteredHits.length, product: 0, collection: 0 },
        }
      : undefined,
  };
}
