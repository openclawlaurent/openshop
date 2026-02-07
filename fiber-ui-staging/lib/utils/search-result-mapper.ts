/**
 * Algolia Search Result Mapping Utilities
 *
 * This module contains the core logic for transforming Algolia unified search results
 * into the legacy Offer interface used throughout the application. It handles three
 * types of records: merchants, products, and collections.
 */

import {
  AlgoliaUnifiedRecord,
  AlgoliaMerchantRecord,
  AlgoliaProductRecord,
  AlgoliaCollectionRecord,
  isMerchantRecord,
  isProductRecord,
  isCollectionRecord,
} from "@/types/algolia";
import {
  generateAffiliateLink,
  canGenerateAffiliateLink,
} from "@/lib/utils/affiliate-link-generator";

/**
 * Legacy Offer interface for backwards compatibility with existing UI components
 */
export interface LegacyOffer {
  id: string;
  image?: string;
  title: string;
  merchantName?: string; // Merchant name for proper display in drawers
  merchantLogoUrl?: string; // Merchant favicon/logo
  rewardLabel: string;
  href?: string;
  trackingId?: number;
  queryID?: string; // For Algolia click analytics
  allRates?: Array<{
    kind: string;
    name: string;
    amount: string;
    numeric_amount?: number;
    advertised_amount?: number; // Original advertised amount before platform fee deduction
  }>;
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
}

/**
 * Build reward label from rate type and amount
 * Handles both the new maxRate/maxRateType format and legacy bestRate/bestRateAmount
 */
export function buildRewardLabel(
  rateType?: string,
  rateAmount?: number,
  fallback: string = "View details",
): string {
  if (!rateType || rateAmount === undefined || rateAmount === null) {
    return fallback;
  }

  // Ensure rateAmount is a number
  const amount = typeof rateAmount === "number" ? rateAmount : parseFloat(String(rateAmount));

  if (isNaN(amount)) {
    return fallback;
  }

  switch (rateType) {
    case "PERCENTAGE":
    case "percentage":
      // Calculate actual cashback by deducting 10% platform fee and round down
      const actualCashback = Math.floor(amount * 0.9 * 100) / 100;
      // Remove trailing zeros (e.g., "0.90" → "0.9", "2.00" → "2")
      const percentageFormatted = actualCashback.toFixed(2).replace(/\.?0+$/, "");
      return `Up to ${percentageFormatted}% back`;
    case "FLAT":
    case "fixed":
      // Calculate actual cashback by deducting 10% platform fee and round down to cents
      const actualFlat = Math.floor(amount * 0.9 * 100) / 100;
      return `Up to $${actualFlat.toFixed(2)} back`;
    default:
      // If rateType is not recognized, assume it's a percentage
      const actualDefault = Math.floor(amount * 0.9 * 100) / 100;
      // Remove trailing zeros (e.g., "0.90" → "0.9", "2.00" → "2")
      const defaultFormatted = actualDefault.toFixed(2).replace(/\.?0+$/, "");
      return `Up to ${defaultFormatted}% back`;
  }
}

/**
 * Transform merchant record to legacy offer format
 */
export function transformMerchantRecord(
  result: AlgoliaMerchantRecord,
  wildfireDeviceId?: string,
): LegacyOffer {
  // Convert maxRateType from Algolia format to our internal format
  // Algolia: "fixed" (lowercase) = flat rate, "percentage" (lowercase) = percentage rate
  const rateType = result.maxRateType === "fixed" ? "FLAT" : "PERCENTAGE";

  const rewardLabel = buildRewardLabel(rateType, result.maxRateAmount);

  // Transform allRates to legacy format and sort (percentage first descending, then flat descending)
  const unsortedRates = result.allRates?.map((rate) => {
    // Use 'kind' field from Algolia (the actual field name)
    const rateKind = rate.kind || rate.type;

    let kind = rateKind;
    if (!kind && rate.rate) {
      // Fallback: infer from rate format: "$5" = FLAT, "5%" = PERCENTAGE
      kind = rate.rate.startsWith("$") ? "FLAT" : "PERCENTAGE";
    }

    const numericAmount =
      typeof rate.amount === "number" ? rate.amount : parseFloat(String(rate.amount));

    // Calculate actual cashback by deducting 10% platform fee and round down
    // PERCENTAGE: round to 2 decimal places (e.g., 4.50%)
    // FLAT: round to 2 decimal places/cents (e.g., $292.50)
    const actualAmount = Math.floor(numericAmount * 0.9 * 100) / 100;

    return {
      kind: kind || "PERCENTAGE",
      name: rate.name.replace(/^[\d.]+[%$]\s*/, "").trim(),
      amount: actualAmount.toString(),
      numeric_amount: actualAmount,
      advertised_amount: numericAmount, // Keep original advertised amount for boost tier calculations
    };
  });

  const allRates = unsortedRates?.sort((a, b) => {
    // Sort percentage rates first, then flat rates
    if (a.kind === "PERCENTAGE" && b.kind !== "PERCENTAGE") return -1;
    if (a.kind !== "PERCENTAGE" && b.kind === "PERCENTAGE") return 1;
    // Within same kind, sort by amount descending
    return (b.numeric_amount || 0) - (a.numeric_amount || 0);
  });

  // Generate affiliate link for merchants through our redirect proxy
  let href: string | undefined;
  const trackingId = result.activeDomainId || result.wildfireMerchantId;

  if (canGenerateAffiliateLink(trackingId, wildfireDeviceId)) {
    href = generateAffiliateLink({
      provider: "wildfire",
      trackingId: trackingId!,
      deviceId: wildfireDeviceId!,
      destinationUrl: result.merchantUrl,
    });
  }

  return {
    id: result.objectID,
    image: result.logoUrl,
    title: result.merchantName,
    merchantName: result.merchantName,
    rewardLabel,
    href,
    trackingId,
    queryID: result.__queryID, // Pass queryID for click tracking
    allRates,
    type: result.type,
    merchantUrl: result.merchantUrl, // Include for client-side URL generation
    description: result.description,
  };
}

/**
 * Transform product record to legacy offer format
 */
export function transformProductRecord(
  result: AlgoliaProductRecord,
  wildfireDeviceId?: string,
): LegacyOffer {
  // Convert maxRateType from Algolia format to our internal format
  // Algolia: "fixed" (lowercase) = flat rate, "percentage" (lowercase) = percentage rate
  const rateType = result.maxRateType === "fixed" ? "FLAT" : "PERCENTAGE";

  const rewardLabel = buildRewardLabel(rateType, result.maxRateAmount);

  // Transform allRates to legacy format and sort (percentage first descending, then flat descending)
  const unsortedRates = result.allRates?.map((rate) => {
    // Use 'kind' field from Algolia (the actual field name)
    const rateKind = rate.kind || rate.type;

    let kind = rateKind;
    if (!kind && rate.rate) {
      // Fallback: infer from rate format: "$5" = FLAT, "5%" = PERCENTAGE
      kind = rate.rate.startsWith("$") ? "FLAT" : "PERCENTAGE";
    }

    const numericAmount =
      typeof rate.amount === "number" ? rate.amount : parseFloat(String(rate.amount));

    // Calculate actual cashback by deducting 10% platform fee and round down
    // PERCENTAGE: round to 2 decimal places (e.g., 4.50%)
    // FLAT: round to 2 decimal places/cents (e.g., $292.50)
    const actualAmount = Math.floor(numericAmount * 0.9 * 100) / 100;

    return {
      kind: kind || "PERCENTAGE",
      name: rate.name.replace(/^[\d.]+[%$]\s*/, "").trim(),
      amount: actualAmount.toString(),
      numeric_amount: actualAmount,
      advertised_amount: numericAmount, // Keep original advertised amount for boost tier calculations
    };
  });

  const allRates = unsortedRates?.sort((a, b) => {
    // Sort percentage rates first, then flat rates
    if (a.kind === "PERCENTAGE" && b.kind !== "PERCENTAGE") return -1;
    if (a.kind !== "PERCENTAGE" && b.kind === "PERCENTAGE") return 1;
    // Within same kind, sort by amount descending
    return (b.numeric_amount || 0) - (a.numeric_amount || 0);
  });

  // Generate affiliate link for products through our redirect proxy
  let href: string | undefined;
  const trackingId = result.wildfireMerchantId || result.merchantId;

  if (canGenerateAffiliateLink(trackingId, wildfireDeviceId)) {
    href = generateAffiliateLink({
      provider: "wildfire",
      trackingId: trackingId!,
      deviceId: wildfireDeviceId!,
      destinationUrl: result.sourceUrl,
    });
  }

  const offer = {
    id: result.objectID,
    image: result.imageUrl,
    title: result.productTitle,
    merchantName: result.merchantName,
    merchantLogoUrl: result.merchantLogoUrl,
    rewardLabel,
    href,
    trackingId,
    queryID: result.__queryID, // Pass queryID for click tracking
    allRates,
    type: result.type,
    sourceUrl: result.sourceUrl, // Include for client-side URL generation
    // Product details
    price: result.price || (result.originalPrice ? parseFloat(result.originalPrice) : undefined),
    priceFormatted:
      result.priceFormatted || (result.originalPrice ? `$${result.originalPrice}` : undefined),
    color: result.color,
    size: result.size,
    brand: result.brand,
    rating: result.rating,
    reviewCount: result.reviewCount,
    description: result.description,
  };

  return offer;
}

/**
 * Transform collection record to legacy offer format
 */
export function transformCollectionRecord(
  result: AlgoliaCollectionRecord,
  wildfireDeviceId?: string,
): LegacyOffer {
  const productCount = result.productCount || 0;
  const rewardLabel = `${productCount} products`;

  // Generate affiliate link for collections through our redirect proxy
  let href: string | undefined;
  const trackingId = result.collectionId;

  if (canGenerateAffiliateLink(trackingId, wildfireDeviceId)) {
    href = generateAffiliateLink({
      provider: "wildfire",
      trackingId: trackingId!,
      deviceId: wildfireDeviceId!,
      destinationUrl: result.sourceUrl,
    });
  }

  return {
    id: result.objectID,
    image: result.imageUrl,
    title: result.collectionName,
    merchantName: undefined, // Collections don't have a specific merchant
    rewardLabel,
    href,
    trackingId,
    queryID: result.__queryID, // Pass queryID for click tracking
    allRates: [], // Collections don't have rates
    type: result.type,
    sourceUrl: result.sourceUrl, // Include for client-side URL generation
    description: result.description,
  };
}

/**
 * Main transformation function that handles all record types
 * This replaces the inline transformation logic in both client and server files
 */
export function transformUnifiedResultToLegacyOffer(
  result: AlgoliaUnifiedRecord,
  wildfireDeviceId?: string,
): LegacyOffer {
  if (isMerchantRecord(result)) {
    return transformMerchantRecord(result, wildfireDeviceId);
  } else if (isProductRecord(result)) {
    return transformProductRecord(result, wildfireDeviceId);
  } else if (isCollectionRecord(result)) {
    return transformCollectionRecord(result, wildfireDeviceId);
  } else {
    // Handle unknown types gracefully
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unknownResult = result as any;
    return {
      id: unknownResult.objectID ? String(unknownResult.objectID) : "unknown",
      title: unknownResult.objectID ? String(unknownResult.objectID) : "Unknown",
      rewardLabel: "No reward info",
      type: unknownResult.type,
    };
  }
}
