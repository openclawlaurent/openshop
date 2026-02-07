import { createClient } from "@/lib/supabase/server";
import { fetchUserProfile } from "@/lib/data/server/user-profile";
import { UserProfile } from "../../content/types";

/**
 * Get the current user's profile
 * Server-side only - uses Supabase client with RLS
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user profile from database using centralized function
  const profile = await fetchUserProfile(supabase, user.id);

  if (!profile) {
    return null;
  }

  return {
    id: user.id,
    email: profile.email || user.email || "",
    full_name: user.user_metadata?.full_name || user.user_metadata?.name,
    avatar_url: profile.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture,
    payout_partner_token_id: profile.payout_partner_token_id,
    wildfire_device_id: profile.wildfire_device_id || "",
    solana_address: profile.solana_address,
    solana_metadata: profile.solana_metadata || null,
    is_solana_wallet_connected: profile.is_solana_wallet_connected,
    boost_tier_id: profile.boost_tier_id,
    created_at: profile.created_at || "",
    updated_at: profile.updated_at || "",
  };
}
