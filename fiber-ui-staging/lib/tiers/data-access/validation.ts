import { z } from "zod";

/**
 * Zod schema for boost tier data
 * Used for runtime validation of API responses
 */
export const BoostTierSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  platform_token_boost_multiplier: z.number().min(0),
  payout_token_boost_multiplier: z.number().min(0),
  payout_token_split_percentage: z.number().min(0).max(1),
  platform_token_split_percentage: z.number().min(0).max(1),
  platform_fee_split_percentage: z.number().min(0).max(1),
  minimum_platform_token_staked_amount: z.number().min(0),
  minimum_monthly_average_purchases_amount: z.number().min(0),
  is_active: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

/**
 * Zod schema for an array of boost tiers
 */
export const BoostTiersArraySchema = z.array(BoostTierSchema);

/**
 * Validate boost tier data from API response
 * Throws if validation fails
 *
 * @param data - The data to validate
 * @returns Validated boost tier
 */
export function validateBoostTier(data: unknown) {
  return BoostTierSchema.parse(data);
}

/**
 * Validate array of boost tiers from API response
 * Throws if validation fails
 *
 * @param data - The data to validate
 * @returns Validated array of boost tiers
 */
export function validateBoostTiers(data: unknown) {
  return BoostTiersArraySchema.parse(data);
}

/**
 * Safely validate boost tier data
 * Returns null if validation fails instead of throwing
 *
 * @param data - The data to validate
 * @returns Validated boost tier or null
 */
export function safeValidateBoostTier(data: unknown) {
  const result = BoostTierSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Safely validate array of boost tiers
 * Returns empty array if validation fails instead of throwing
 *
 * @param data - The data to validate
 * @returns Validated array of boost tiers or empty array
 */
export function safeValidateBoostTiers(data: unknown) {
  const result = BoostTiersArraySchema.safeParse(data);
  return result.success ? result.data : [];
}
