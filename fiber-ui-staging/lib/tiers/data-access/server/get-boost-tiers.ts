import { createClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { BoostTier } from "../types";

/**
 * Hardcoded tier order for UI display
 * Ensures tiers are displayed in a consistent, meaningful order
 */
const TIER_ORDER = [
  "starter",
  "alpha",
  "bronze",
  "silver",
  "gold",
  "platinum",
  "carbon fiber black",
];

/**
 * Sort boost tiers by hardcoded order
 * Tiers not in the order list are placed at the end
 *
 * @param tiers - Array of boost tiers to sort
 * @returns Sorted array of boost tiers
 */
function sortBoostTiersByOrder(tiers: BoostTier[]): BoostTier[] {
  return [...tiers].sort((a, b) => {
    const indexA = TIER_ORDER.indexOf(a.id.toLowerCase());
    const indexB = TIER_ORDER.indexOf(b.id.toLowerCase());

    // If tier not in order list, put it at the end
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });
}

/**
 * Fetch all active boost tiers from database
 * Tiers are sorted by the hardcoded order for consistent UI display
 *
 * @param supabase - Supabase client instance
 * @returns Array of active boost tiers, sorted by tier order
 */
export async function fetchBoostTiers(supabase: SupabaseClient): Promise<BoostTier[]> {
  const { data, error } = await supabase
    .from("boost_tiers")
    .select("*")
    .eq("is_active", true)
    .order("minimum_platform_token_staked_amount", { ascending: true });

  if (error) {
    console.error("Error fetching boost tiers:", error);
    return [];
  }

  return sortBoostTiersByOrder(data || []);
}

/**
 * Fetch a specific boost tier by ID
 *
 * @param supabase - Supabase client instance
 * @param tierId - The ID of the tier to fetch
 * @returns The boost tier or null if not found
 */
export async function fetchBoostTierById(
  supabase: SupabaseClient,
  tierId: string,
): Promise<BoostTier | null> {
  const { data, error } = await supabase.from("boost_tiers").select("*").eq("id", tierId).single();

  if (error) {
    console.error("Error fetching boost tier:", error);
    return null;
  }

  return data;
}

/**
 * Server-side function to get all active boost tiers
 * Creates a new Supabase client and fetches tiers
 *
 * @returns Array of active boost tiers, sorted by tier order
 */
export async function getBoostTiers(): Promise<BoostTier[]> {
  try {
    const supabase = await createClient();
    return await fetchBoostTiers(supabase);
  } catch (error) {
    console.error("Error getting boost tiers:", error);
    return [];
  }
}

/**
 * Server-side function to get a boost tier by ID
 * Creates a new Supabase client and fetches the tier
 *
 * @param tierId - The ID of the tier to fetch
 * @returns The boost tier or null if not found
 */
export async function getBoostTierById(tierId: string): Promise<BoostTier | null> {
  try {
    const supabase = await createClient();
    return await fetchBoostTierById(supabase, tierId);
  } catch (error) {
    console.error("Error getting boost tier:", error);
    return null;
  }
}
