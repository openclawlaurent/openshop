export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  payout_partner_token_id: string | null;
  wildfire_device_id: string;
  solana_address: string | null;
  solana_metadata: Record<string, unknown> | null;
  is_solana_wallet_connected: boolean;
  boost_tier_id: string;
  created_at: string;
  updated_at: string;
}
