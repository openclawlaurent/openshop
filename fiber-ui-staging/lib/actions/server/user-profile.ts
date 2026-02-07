import { createClient } from "@/lib/supabase/server";
import { generateWildfireDeviceId } from "@/lib/utils/wildfire";
import { getRandomAvatarId, getAvatarUrl } from "@/lib/utils/avatar-pregenerated";
import {
  fetchUserProfile,
  updateUserProfile as updateUserProfileDB,
  insertUserProfile,
} from "@/lib/data/server/user-profile";

export async function ensureUserProfile() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  // Check if profile already exists
  const existingProfile = await fetchUserProfile(supabase, user.id);

  // Profile already exists
  if (existingProfile) {
    let needsUpdate = false;
    const updates: Record<string, unknown> = {};

    // Check if wildfire_device_id is null and generate if needed
    if (!existingProfile.wildfire_device_id) {
      console.log("Existing profile missing wildfire_device_id, generating new one...");
      const wildfireDeviceId = await generateWildfireDeviceId();
      updates.wildfire_device_id = wildfireDeviceId;
      needsUpdate = true;
    }

    // Check if avatar_url is null and assign a random one
    if (!existingProfile.avatar_url) {
      console.log("Existing profile missing avatar_url, assigning random avatar...");
      const avatarId = getRandomAvatarId();
      const avatarUrl = getAvatarUrl(avatarId, process.env.NEXT_PUBLIC_SUPABASE_URL!);
      updates.avatar_url = avatarUrl;
      needsUpdate = true;
    }

    // Update profile if needed
    if (needsUpdate) {
      const updatedProfile = await updateUserProfileDB(supabase, user.id, updates);

      if (!updatedProfile) {
        console.error("Error updating profile");
        return existingProfile; // Return existing profile even if update fails
      }

      return updatedProfile;
    }

    return existingProfile;
  }

  // Generate wildfire device ID
  const wildfireDeviceId = await generateWildfireDeviceId();

  // Generate random avatar for new user
  const avatarId = getRandomAvatarId();
  const avatarUrl = getAvatarUrl(avatarId, process.env.NEXT_PUBLIC_SUPABASE_URL!);

  // Create new profile with random avatar
  const newProfile = await insertUserProfile(supabase, {
    user_id: user.id,
    wildfire_device_id: wildfireDeviceId,
    avatar_url: avatarUrl,
    email: user.email,
    boost_tier_id: "alpha",
  });

  if (!newProfile) {
    console.error("Error creating user profile");
    return null;
  }

  return newProfile;
}

export async function updateUserAvatar(avatarUrl: string) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // Update the user's avatar URL
  const updatedProfile = await updateUserProfileDB(supabase, user.id, { avatar_url: avatarUrl });

  if (!updatedProfile) {
    console.error("Error updating avatar");
    throw new Error("Failed to update avatar");
  }

  return updatedProfile;
}
