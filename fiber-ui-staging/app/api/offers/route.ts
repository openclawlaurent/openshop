import { NextRequest, NextResponse } from "next/server";
import { getUserProfile } from "@/lib/profile/data-access/server";
import { searchAlgoliaCached } from "@/lib/services/algolia-cache";
import { transformUnifiedResultToLegacyOffer } from "@/lib/utils/search-result-mapper";
import { getPartnerTokens } from "@/lib/data/partner-tokens";
import { getBoostTierById } from "@/lib/tiers/data-access/server";
import {
  calculateUserRateDetails as calculateRateDetails,
  calculateFlatRateDetails,
} from "@/lib/utils/user-rate-calculator";
import { getCategoryBySlug, getSortOptionBySlug } from "@/lib/services/merchant-filters";
import { AlgoliaSearchFilters } from "@/types/algolia";

// Blacklist of merchant IDs to filter out (fallback - primary filtering happens in Algolia query)
// These are now filtered at Algolia query level via excludeWildfireMerchantIds
const BLACKLISTED_MERCHANT_IDS = [
  "merchant_202840", // "Bonus" wildfire merchant
  202840, // "Bonus" wildfire merchant
];

export interface RateInfo {
  kind: "PERCENTAGE" | "FLAT" | string;
  name: string;
  amount: string;
  numeric_amount?: number;
  advertised_amount?: number; // Original advertised amount before platform fee deduction
}

export interface Offer {
  id: string;
  image?: string;
  title: string;
  merchantName?: string; // Merchant name for proper display in drawers
  merchantLogoUrl?: string; // Merchant favicon/logo
  rewardLabel: string;
  href?: string;
  trackingId?: number; // activeDomainId or merchantId for wild.link generation
  queryID?: string; // For Algolia click analytics
  allRates?: RateInfo[];
  type?: string;
  // Include source URLs so client can regenerate URLs with parameters
  sourceUrl?: string; // For products/collections
  merchantUrl?: string; // For merchants
  // Product details (when available)
  price?: number;
  priceFormatted?: string;
  color?: string;
  size?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
  // User-specific rate details (calculated based on user's selected partner token)
  userRateDetails?: {
    rateType: "PERCENTAGE" | "FLAT";
    partnerTokenLabel: string; // Display label for partner token (e.g., "BONK")

    // For PERCENTAGE rates
    partnerTokenPercentage: number; // Partner token fee percentage
    platformTokenPercentage: number; // Platform (FP) fee percentage
    partnerTokenBoostedPercentage: number; // Partner token percentage after boost multiplier
    platformTokenBoostedPercentage: number; // Platform token percentage after boost multiplier
    userPercentage: number; // Total user-facing percentage

    // For FLAT rates (in dollars)
    partnerTokenAmount?: number; // Dollar amount for partner token
    platformTokenAmount?: number; // Dollar amount for platform token
    partnerTokenBoostedAmount?: number; // Boosted dollar amount for partner token
    platformTokenBoostedAmount?: number; // Boosted dollar amount for platform token
    userAmount?: number; // User-facing dollar amount (after fee removal)

    // Common fields
    partnerTokenBoostMultiplier: number; // Boost multiplier from tier (e.g., 2.0)
    platformTokenBoostMultiplier: number; // Boost multiplier from tier (e.g., 2.0)
    breakdownMessage: string; // Formatted message: "BONK 1.3% and FP 1.3%" or "BONK $131.63 and FP $131.63"
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "40");
    const categorySlug = searchParams.get("category");
    const sortSlug = searchParams.get("sort");

    // Get user profile, partner tokens, and boost tier
    const userProfile = await getUserProfile();
    const deviceId = userProfile?.wildfire_device_id;
    const partnerTokens = await getPartnerTokens();

    // Fetch user's boost tier
    const boostTier = userProfile?.boost_tier_id
      ? await getBoostTierById(userProfile.boost_tier_id)
      : null;

    // Find user's selected partner token
    const userPartnerToken = userProfile?.payout_partner_token_id
      ? partnerTokens.find((token) => token.id === userProfile.payout_partner_token_id)
      : null;

    // Check if running in development and use mock data (unless cache is disabled)
    // if (process.env.NODE_ENV === "development" && process.env.DISABLE_SEARCH_CACHE !== "true") {
    //   try {
    //     const filePath = path.join(process.cwd(), "app", "algolia-mock-data.json");

    //     if (fs.existsSync(filePath)) {
    //       const mockData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    //       const transformedOffers = mockData.searchResponse.hits.map((hit: AlgoliaMerchantRecord) =>
    //         transformUnifiedResultToOffer(hit, deviceId),
    //       );

    //       console.log("📂 USING MOCK DATA (API):", {
    //         timestamp: new Date().toISOString(),
    //         mockTimestamp: mockData.timestamp,
    //         query: query || "<empty search>",
    //         resultsCount: transformedOffers.length,
    //         totalHits: mockData.searchResponse.totalHits,
    //         source: "mock-data-api",
    //       });

    //       return NextResponse.json({
    //         offers: transformedOffers,
    //         source: "mock-data",
    //         totalHits: mockData.searchResponse.totalHits,
    //       });
    //     }
    //   } catch {
    //     console.log("Mock data not available, falling back to Algolia");
    //   }
    // }

    // UX Rule: Search query and category filter are mutually exclusive
    // If both are provided, prioritize search query (more specific user intent)
    let effectiveCategorySlug = categorySlug;
    if (query && query.trim()) {
      effectiveCategorySlug = null; // Clear category when searching
    }

    // Build Algolia filters from category selection
    const algoliaFilters: AlgoliaSearchFilters = {
      // Always exclude blacklisted merchants at Algolia query level
      excludeWildfireMerchantIds: [202840], // "Bonus" wildfire merchant
      minMaxRate: 0.01, // Exclude items with 0% cashback
    };

    if (effectiveCategorySlug && effectiveCategorySlug !== "all") {
      const category = await getCategoryBySlug(effectiveCategorySlug);

      if (category && category.collection_ids?.length > 0) {
        // Use the first collection ID as the primary filter
        algoliaFilters.primaryCollectionId = category.collection_ids[0];
      }
    }

    // Get sort option for Algolia
    let sortBy: string | undefined;

    if (sortSlug && sortSlug !== "relevant") {
      const sortOption = await getSortOptionBySlug(sortSlug);

      if (sortOption && sortOption.algolia_sort_by) {
        sortBy = sortOption.algolia_sort_by;
      }
    }

    // Use cached Algolia unified search (search all record types)
    const searchResponse = await searchAlgoliaCached(query || "", {
      hitsPerPage: limit,
      filters: algoliaFilters,
      sortBy,
    });

    const transformedOffers = searchResponse.hits
      .map((hit) => transformUnifiedResultToLegacyOffer(hit, deviceId))
      .filter((offer) => !BLACKLISTED_MERCHANT_IDS.includes(offer.id))
      .map((offer) => {
        // Add user-specific rate details if user has selected a partner token and has a boost tier
        if (userPartnerToken && boostTier) {
          // Try percentage first, then flat rate
          let userRateDetails = calculateRateDetails(
            offer,
            userPartnerToken.display_label,
            boostTier,
          );

          // If no percentage rate found, try flat rate
          if (!userRateDetails) {
            userRateDetails = calculateFlatRateDetails(
              offer,
              userPartnerToken.display_label,
              boostTier,
            );
          }

          return {
            ...offer,
            queryID: searchResponse.queryID, // Pass queryID for click tracking
            userRateDetails,
          };
        }
        return {
          ...offer,
          queryID: searchResponse.queryID, // Pass queryID for click tracking
        };
      });

    return NextResponse.json({
      offers: transformedOffers,
      source: "algolia",
      totalHits: searchResponse.totalHits,
    });
  } catch (error) {
    console.error("❌ [API] Route Error:", {
      timestamp: new Date().toISOString(),
      error: error,
      source: "api-route-offers",
    });
    return NextResponse.json({
      offers: [],
      source: "error",
      error: "Failed to fetch offers from Algolia",
    });
  }
}
