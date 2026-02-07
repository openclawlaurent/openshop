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
  wildfire_device_id?: string | null;
  boost_tier_id?: string;
  is_onboarding_completed?: boolean;
}

/**
 * Fetch user profile from database using Supabase client
 * Client-side compatible version
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
 * Insert new user profile in database
 * Client-side compatible version
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
 * Update user profile in database (direct Supabase client version)
 * Use this when you have a Supabase client and user ID
 */
export async function updateUserProfileDirect(
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

/**
 * Update user profile via API endpoint
 * Client-side wrapper that calls the PATCH /api/user/profile endpoint
 * Use this from client components
 */
export async function updateUserProfile(
  updates: Partial<UserProfileData>,
): Promise<UserProfile | null> {
  const response = await fetch("/api/user/profile", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update profile");
  }

  return response.json();
}
