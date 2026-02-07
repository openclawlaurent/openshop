-- Add avatar_url column if it doesn't exist
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Update existing users to have a random avatar (replace with actual user_id)
UPDATE user_profiles 
SET avatar_url = 'https://wtvyshstjuunrfpdfcqv.supabase.co/storage/v1/object/public/avatars/001.svg' 
WHERE user_id IN (
  SELECT user_id FROM user_profiles WHERE avatar_url IS NULL LIMIT 1
);