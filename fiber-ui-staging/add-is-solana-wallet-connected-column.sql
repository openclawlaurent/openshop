-- Add is_solana_wallet_connected column to user_profiles table
-- This column tracks whether the user's wallet is currently connected
-- The solana_address is preserved even when disconnected

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS is_solana_wallet_connected BOOLEAN NOT NULL DEFAULT false;

-- Set is_solana_wallet_connected to true for existing users who have a solana_address
UPDATE user_profiles
SET is_solana_wallet_connected = true
WHERE solana_address IS NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN user_profiles.is_solana_wallet_connected IS 'Indicates if the Solana wallet is currently connected. Address is preserved in solana_address even when disconnected.';
