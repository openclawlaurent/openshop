import { BoostTier, BoostTierSplit } from "./types";

/**
 * Calculate the actual cashback percentage after deducting the 10% platform fee
 * and rounding down to the nearest tenth
 *
 * Example: 3.9% -> 3.9 × 0.9 = 3.51 -> 3.5%
 *
 * @param wildfirePercentage - The original cashback percentage
 * @returns The actual cashback percentage after platform fee
 */
export function calculateActualCashback(wildfirePercentage: number): number {
  const actualPercentage = wildfirePercentage * 0.9;
  return Math.floor(actualPercentage * 10) / 10;
}

/**
 * Get the token split percentages for a given boost tier
 * Returns the payout token percentage and platform token percentage
 *
 * @param boostTier - The boost tier to get splits for (or null for default)
 * @returns Object containing payout and platform token percentages
 */
export function getBoostTierSplit(boostTier: BoostTier | null | undefined): BoostTierSplit {
  if (!boostTier) {
    return {
      payoutTokenPercentage: 45,
      platformTokenPercentage: 45,
    };
  }

  // Convert decimal to percentage (e.g., 0.45 -> 45)
  return {
    payoutTokenPercentage: Math.round(boostTier.payout_token_split_percentage * 100),
    platformTokenPercentage: Math.round(boostTier.platform_token_split_percentage * 100),
  };
}

/**
 * Format a cashback percentage for display
 *
 * @param percentage - The percentage to format
 * @returns Formatted percentage string with one decimal place
 */
export function formatCashbackPercentage(percentage: number): string {
  return percentage.toFixed(1);
}
