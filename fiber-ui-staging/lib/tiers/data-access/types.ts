/**
 * Boost tier type definition
 * Represents a tier in the boost tier system with multipliers and requirements
 */
export type BoostTier = {
  id: string;
  name: string;
  description: string | null;
  platform_token_boost_multiplier: number;
  payout_token_boost_multiplier: number;
  payout_token_split_percentage: number;
  platform_token_split_percentage: number;
  platform_fee_split_percentage: number;
  minimum_platform_token_staked_amount: number;
  minimum_monthly_average_purchases_amount: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

/**
 * Boost tier calculation utilities return type
 */
export type BoostTierSplit = {
  payoutTokenPercentage: number;
  platformTokenPercentage: number;
};
