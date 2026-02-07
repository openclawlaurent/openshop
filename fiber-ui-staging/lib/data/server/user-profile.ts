import { createClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

export interface UserProfile {
  user_id: string;
  avatar_url: string | null;
  email: string | null;
  solana_address: string | null;
  solana_metadata?: Record<string, unknown> | null;
  is_solana_wallet_connected: boolean;
  payout_partner_token_id: string | null;
  wildfire_device_id?: string | null;
  boost_tier_id: string;
  is_onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfileData {
  avatar_url?: string | null;
  email?: string | null;
  solana_address?: string | null;
  is_solana_wallet_connected?: boolean;
  payout_partner_token_id?: string | null;
  boost_tier_id?: string;
  is_onboarding_completed?: boolean;
}

/**
 * Fetch user profile from database using Supabase client
 * This is the centralized function for fetching user profiles
 */
export async function fetchUserProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
}

/**
 * Server-side function to get the current user's profile
 * Includes user metadata fallbacks
 */
export async function getUserProfileData(): Promise<UserProfileData | null> {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    // Fetch profile from database
    const profile = await fetchUserProfile(supabase, user.id);

    if (!profile) {
      // If no profile exists, return user metadata as fallback
      return {
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        email: user.email || null,
        solana_address: null,
        is_solana_wallet_connected: false,
        payout_partner_token_id: null,
        is_onboarding_completed: false,
      };
    }

    // Return profile data with metadata fallbacks
    return {
      avatar_url:
        profile.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture,
      email: profile.email || user.email,
      solana_address: profile.solana_address,
      is_solana_wallet_connected: profile.is_solana_wallet_connected,
      payout_partner_token_id: profile.payout_partner_token_id,
      boost_tier_id: profile.boost_tier_id,
      is_onboarding_completed: profile.is_onboarding_completed,
    };
  } catch (error) {
    console.error("Error getting user profile data:", error);
    return null;
  }
}

/**
 * Insert new user profile in database
 */
export async function insertUserProfile(
  supabase: SupabaseClient,
  profileData: Partial<Omit<UserProfile, "created_at" | "updated_at">> & { user_id: string },
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .insert(profileData)
    .select()
    .single();

  if (error) {
    console.error("Error inserting user profile:", error);
    return null;
  }

  return data;
}

/**
 * Update user profile in database
 */
export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<UserProfile>,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user profile:", error);
    return null;
  }

  return data;
}
