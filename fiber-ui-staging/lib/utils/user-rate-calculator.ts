import { BoostTier } from "@/lib/tiers/data-access";
import { Offer } from "@/app/api/offers/route";

export interface UserRateDetails {
  rateType: "PERCENTAGE" | "FLAT";
  partnerTokenLabel: string;

  // For PERCENTAGE rates
  partnerTokenPercentage: number;
  platformTokenPercentage: number;
  partnerTokenBoostedPercentage: number; // partnerTokenPercentage * payout_token_boost_multiplier
  platformTokenBoostedPercentage: number; // platformTokenPercentage * platform_token_boost_multiplier
  userPercentage: number;

  // For FLAT rates (in dollars)
  partnerTokenAmount?: number; // Dollar amount for partner token
  platformTokenAmount?: number; // Dollar amount for platform token
  partnerTokenBoostedAmount?: number; // Boosted dollar amount for partner token
  platformTokenBoostedAmount?: number; // Boosted dollar amount for platform token
  userAmount?: number; // User-facing dollar amount (after fee removal)

  // Common fields
  partnerTokenBoostMultiplier: number; // From boost tier (e.g., 2.0 for 2x)
  platformTokenBoostMultiplier: number; // From boost tier (e.g., 2.0 for 2x)
  breakdownMessage: string;
}

/**
 * Calculate user-specific rate details for an offer based on user's selected token and boost tier
 *
 * Formula: If advertised rate is X%, then:
 * 1. User-facing rate (after platform fee) = floor((X / 1.1) * 10) / 10  (already in allRates)
 * 2. Split the rate according to boost tier:
 *    - Partner token = totalPercentage * payout_token_split_percentage
 *    - Platform (FP) = totalPercentage * platform_token_split_percentage
 *    - Platform fee = totalPercentage * platform_fee_split_percentage
 *
 * @param offer - The offer to calculate rate details for
 * @param partnerTokenLabel - Display label for the partner token (e.g., "BONK", "USDC")
 * @param boostTier - User's boost tier with split percentages
 * @returns User rate details or undefined if no percentage rate found
 *
 * @example
 * // Offer with 2.6% user-facing rate, boost tier with 45% payout, 45% platform, 10% fee
 * const details = calculateUserRateDetails(offer, "BONK", boostTier);
 * // Returns: {
 * //   partnerTokenLabel: "BONK",
 * //   partnerTokenPercentage: 1.2,
 * //   platformPercentage: 1.2,
 * //   totalPercentage: 2.6,
 * //   breakdownMessage: "BONK 1.2% and FP 1.2%"
 * // }
 */
export function calculateUserRateDetails(
  offer: Offer,
  partnerTokenLabel: string,
  boostTier: BoostTier,
): UserRateDetails | undefined {
  // Only calculate for percentage-based offers
  const maxPercentageRate = offer.allRates?.find((rate) => rate.kind === "PERCENTAGE");

  if (!maxPercentageRate?.advertised_amount) {
    return undefined;
  }

  // Calculate user-facing rate: advertised × 0.9 (10% platform fee deduction)
  // Round down to 2 decimal places
  const advertisedRate = maxPercentageRate.advertised_amount;
  const userPercentage = Math.floor(advertisedRate * 0.9 * 100) / 100;

  // Calculate splits based on boost tier percentages FROM ADVERTISED RATE
  // Round down to 3 decimal places for precision
  const partnerTokenPercentage =
    Math.floor(advertisedRate * boostTier.payout_token_split_percentage * 1000) / 1000;
  const platformTokenPercentage =
    Math.floor(advertisedRate * boostTier.platform_token_split_percentage * 1000) / 1000;

  // Calculate boosted percentages (apply boost multipliers to advertised rate * split)
  // Round down to 3 decimal places
  const partnerTokenBoostedPercentage =
    Math.floor(
      advertisedRate *
        boostTier.payout_token_split_percentage *
        boostTier.payout_token_boost_multiplier *
        1000,
    ) / 1000;
  const platformTokenBoostedPercentage =
    Math.floor(
      advertisedRate *
        boostTier.platform_token_split_percentage *
        boostTier.platform_token_boost_multiplier *
        1000,
    ) / 1000;

  // Format with trailing zeros dropped (e.g., 1.500 -> 1.5, 1.00 -> 1, 8.775 -> 8.775)
  const formatPercentage = (num: number) => {
    return num % 1 === 0 ? num.toFixed(0) : num.toFixed(3).replace(/\.?0+$/, "");
  };

  return {
    rateType: "PERCENTAGE",
    partnerTokenLabel,
    partnerTokenPercentage,
    platformTokenPercentage,
    partnerTokenBoostedPercentage,
    platformTokenBoostedPercentage,
    partnerTokenBoostMultiplier: boostTier.payout_token_boost_multiplier,
    platformTokenBoostMultiplier: boostTier.platform_token_boost_multiplier,
    userPercentage,
    breakdownMessage: `${partnerTokenLabel} ${formatPercentage(partnerTokenPercentage)}% and FP ${formatPercentage(platformTokenPercentage)}%`,
  };
}

/**
 * Calculate user-specific rate details for FLAT rate offers based on user's boost tier
 *
 * Formula: If advertised flat rate is $X, then:
 * 1. User-facing amount (after platform fee) = X × 0.9
 * 2. Split the amount according to boost tier:
 *    - Partner token = userAmount × payout_token_split_percentage
 *    - Platform (FP) = userAmount × platform_token_split_percentage
 * 3. Apply boost multipliers:
 *    - Boosted partner token = partnerTokenAmount × payout_token_boost_multiplier
 *    - Boosted platform token = platformTokenAmount × platform_token_boost_multiplier
 *
 * @param offer - The offer to calculate rate details for
 * @param partnerTokenLabel - Display label for the partner token (e.g., "BONK", "USDC")
 * @param boostTier - User's boost tier with split percentages and multipliers
 * @returns User rate details or undefined if no flat rate found
 *
 * @example
 * // Offer with $325 advertised flat rate, boost tier with 45% payout, 45% platform
 * const details = calculateFlatRateDetails(offer, "BONK", boostTier);
 * // Returns: {
 * //   rateType: "FLAT",
 * //   partnerTokenLabel: "BONK",
 * //   partnerTokenAmount: 131.63,
 * //   platformTokenAmount: 131.63,
 * //   userAmount: 292.50,
 * //   breakdownMessage: "BONK $131.63 and FP $131.63"
 * // }
 */
export function calculateFlatRateDetails(
  offer: Offer,
  partnerTokenLabel: string,
  boostTier: BoostTier,
): UserRateDetails | undefined {
  // Only calculate for flat rate offers
  const maxFlatRate = offer.allRates?.find((rate) => rate.kind === "FLAT");

  if (!maxFlatRate?.advertised_amount) {
    return undefined;
  }

  // Calculate user-facing amount: advertised × 0.9 (10% platform fee deduction)
  // Round down to cents (2 decimal places)
  const advertisedAmount = maxFlatRate.advertised_amount;
  const userAmount = Math.floor(advertisedAmount * 0.9 * 100) / 100;

  // Calculate splits based on boost tier percentages FROM ADVERTISED AMOUNT (matches percentage logic)
  // Round down to cents
  const partnerTokenAmount =
    Math.floor(advertisedAmount * boostTier.payout_token_split_percentage * 100) / 100;
  const platformTokenAmount =
    Math.floor(advertisedAmount * boostTier.platform_token_split_percentage * 100) / 100;

  // Calculate boosted amounts (apply boost multipliers)
  // Round down to cents
  const partnerTokenBoostedAmount =
    Math.floor(
      advertisedAmount *
        boostTier.payout_token_split_percentage *
        boostTier.payout_token_boost_multiplier *
        100,
    ) / 100;
  const platformTokenBoostedAmount =
    Math.floor(
      advertisedAmount *
        boostTier.platform_token_split_percentage *
        boostTier.platform_token_boost_multiplier *
        100,
    ) / 100;

  return {
    rateType: "FLAT",
    partnerTokenLabel,

    // Percentage fields (set to 0 for flat rates)
    partnerTokenPercentage: 0,
    platformTokenPercentage: 0,
    partnerTokenBoostedPercentage: 0,
    platformTokenBoostedPercentage: 0,
    userPercentage: 0,

    // Flat amount fields
    partnerTokenAmount,
    platformTokenAmount,
    partnerTokenBoostedAmount,
    platformTokenBoostedAmount,
    userAmount,

    partnerTokenBoostMultiplier: boostTier.payout_token_boost_multiplier,
    platformTokenBoostMultiplier: boostTier.platform_token_boost_multiplier,
    breakdownMessage: `${partnerTokenLabel} $${partnerTokenAmount.toFixed(2)} and FP $${platformTokenAmount.toFixed(2)}`,
  };
}

/**
 * Calculate split percentages from a total percentage based on boost tier
 * This is a simpler version that just takes the numeric values
 *
 * @param totalPercentage - The total user-facing percentage (after platform fee removal)
 * @param payoutTokenSplitPercentage - Decimal percentage for payout token (e.g., 0.45 = 45%)
 * @param platformTokenSplitPercentage - Decimal percentage for platform token (e.g., 0.45 = 45%)
 * @param platformFeeSplitPercentage - Decimal percentage for platform fee (e.g., 0.10 = 10%)
 * @returns Object with calculated split amounts
 *
 * @example
 * // 2.6% total, 45% payout, 45% platform, 10% fee
 * const split = calculateRateSplit(2.6, 0.45, 0.45, 0.10);
 * // Returns: {
 * //   partnerTokenAmount: 1.2,
 * //   platformAmount: 1.2,
 * //   platformFeeAmount: 0.3
 * // }
 */
export function calculateRateSplit(
  totalPercentage: number,
  payoutTokenSplitPercentage: number,
  platformTokenSplitPercentage: number,
  platformFeeSplitPercentage: number,
): {
  partnerTokenAmount: number;
  platformAmount: number;
  platformFeeAmount: number;
} {
  return {
    partnerTokenAmount: Math.round(totalPercentage * payoutTokenSplitPercentage * 10) / 10,
    platformAmount: Math.round(totalPercentage * platformTokenSplitPercentage * 10) / 10,
    platformFeeAmount: Math.round(totalPercentage * platformFeeSplitPercentage * 10) / 10,
  };
}

/**
 * Format a breakdown message for display
 *
 * @param partnerTokenLabel - Display label for partner token
 * @param partnerTokenPercentage - Partner token percentage
 * @param platformPercentage - Platform percentage
 * @returns Formatted string like "BONK 1.2% and FP 1.2%"
 */
export function formatBreakdownMessage(
  partnerTokenLabel: string,
  partnerTokenPercentage: number,
  platformPercentage: number,
): string {
  return `${partnerTokenLabel} ${partnerTokenPercentage.toFixed(1)}% and FP ${platformPercentage.toFixed(1)}%`;
}
