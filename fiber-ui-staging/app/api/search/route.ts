import { NextRequest, NextResponse } from "next/server";
import type { AlgoliaSearchFilters, AlgoliaSearchOptions } from "@/types/algolia";

/**
 * Unified Algolia Search API
 *
 * Single endpoint for all Algolia search operations.
 * Supports mock mode via MOCK_ALGOLIA_API environment variable.
 *
 * Query Parameters:
 * - q: Search query string
 * - hitsPerPage: Number of results per page (default: 20)
 * - page: Page number (default: 0)
 * - filters: JSON-stringified AlgoliaSearchFilters object
 * - sortBy: Sort field and direction (e.g., "maxRateAmount:desc")
 * - facets: Include facets in response (boolean)
 *
 * Example:
 * GET /api/search?q=amazon&hitsPerPage=10&filters={"type":"merchant"}
 */

const IS_MOCK_MODE = process.env.MOCK_ALGOLIA_API === "true";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse request parameters
    const query = searchParams.get("q") || "";
    const hitsPerPage = parseInt(searchParams.get("hitsPerPage") || "20", 10);
    const page = parseInt(searchParams.get("page") || "0", 10);
    const sortBy = searchParams.get("sortBy") || undefined;
    const facets = searchParams.get("facets") === "true";

    // Parse filters if provided
    let filters: AlgoliaSearchFilters | undefined;
    const filtersParam = searchParams.get("filters");
    if (filtersParam) {
      try {
        filters = JSON.parse(filtersParam);
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid filters JSON", details: error },
          { status: 400 },
        );
      }
    }

    const options: AlgoliaSearchOptions = {
      hitsPerPage,
      page,
      filters,
      sortBy,
      facets,
    };

    // Use mock or real Algolia based on environment
    if (IS_MOCK_MODE) {
      console.log("💀 Search API: Using mock mode");
      const { getMockSearchResponse } = await import("@/lib/services/algolia-mock-data");
      const mockResponse = getMockSearchResponse(query, options);
      return NextResponse.json(mockResponse);
    }

    console.log("🛜 Search API: Using algolia (cached)");

    // Real Algolia search (cached)
    const { searchAlgoliaCached } = await import("@/lib/services/algolia-cache");
    const searchResponse = await searchAlgoliaCached(query, options);

    return NextResponse.json(searchResponse);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      {
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST endpoint for complex search queries
 * Useful when filters are too large for URL params
 *
 * Body:
 * {
 *   "query": "search term",
 *   "options": {
 *     "hitsPerPage": 20,
 *     "page": 0,
 *     "filters": {...},
 *     "sortBy": "maxRateAmount:desc",
 *     "facets": true
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query = "", options = {} } = body;

    // Validate input
    if (typeof query !== "string") {
      return NextResponse.json({ error: "Query must be a string" }, { status: 400 });
    }

    // Use mock or real Algolia based on environment
    if (IS_MOCK_MODE) {
      const { getMockSearchResponse } = await import("@/lib/services/algolia-mock-data");
      const mockResponse = getMockSearchResponse(query, options);
      return NextResponse.json(mockResponse);
    }

    // Real Algolia search (cached)
    const { searchAlgoliaCached } = await import("@/lib/services/algolia-cache");
    const searchResponse = await searchAlgoliaCached(query, options);

    return NextResponse.json(searchResponse);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      {
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
