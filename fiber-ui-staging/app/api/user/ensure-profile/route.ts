import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRandomAvatarId, getAvatarUrl } from "@/lib/utils/avatar-pregenerated";
import { generateWildfireDeviceId } from "@/lib/utils/wildfire";
import {
  fetchUserProfile,
  updateUserProfile,
  insertUserProfile,
} from "@/lib/data/server/user-profile";

export async function POST() {
  try {
    console.log("API: ensure-profile called");
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("API: No authenticated user");
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    console.log("API: User found:", user.id);

    // Check if profile already exists (using authenticated client with RLS)
    const existingProfile = await fetchUserProfile(supabase, user.id);

    if (existingProfile) {
      console.log("API: Profile already exists:", existingProfile);

      // Check if avatar or email is missing and add them
      const updates: Partial<{ avatar_url: string; email: string; wildfire_device_id: string }> =
        {};

      if (!existingProfile.avatar_url) {
        console.log("API: Adding missing avatar to existing profile");
        const avatarId = getRandomAvatarId();
        updates.avatar_url = getAvatarUrl(avatarId, process.env.NEXT_PUBLIC_SUPABASE_URL!);
      }

      if (!existingProfile.email && user.email) {
        console.log("API: Adding missing email to existing profile");
        updates.email = user.email;
      }

      if (!existingProfile.wildfire_device_id) {
        console.log("API: Adding missing wildfire_device_id to existing profile");
        updates.wildfire_device_id = await generateWildfireDeviceId();
      }

      if (Object.keys(updates).length > 0) {
        const updatedProfile = await updateUserProfile(supabase, user.id, updates);

        if (!updatedProfile) {
          console.error("API: Error updating profile");
        } else {
          console.log("API: Profile updated:", updates);

          // Also update user metadata with avatar for immediate access
          if (updates.avatar_url) {
            const { error: metadataError } = await supabase.auth.updateUser({
              data: { avatar_url: updates.avatar_url },
            });

            if (metadataError) {
              console.error("API: Failed to update user metadata with avatar:", metadataError);
            }
          }

          return NextResponse.json({
            success: true,
            profile: updatedProfile,
            isNewUser: false, // Existing user with updated profile
          });
        }
      }

      return NextResponse.json({
        success: true,
        profile: existingProfile,
        isNewUser: false, // Existing user returning
      });
    }

    // Create new profile with avatar
    console.log("API: Creating new profile for user:", user.id);

    const wildfireDeviceId = await generateWildfireDeviceId();
    const avatarId = getRandomAvatarId();
    const avatarUrl = getAvatarUrl(avatarId, process.env.NEXT_PUBLIC_SUPABASE_URL!);

    console.log("API: Creating profile with avatar:", avatarUrl);

    const newProfile = await insertUserProfile(supabase, {
      user_id: user.id,
      wildfire_device_id: wildfireDeviceId,
      avatar_url: avatarUrl,
      email: user.email,
      boost_tier_id: "alpha",
    });

    if (!newProfile) {
      console.error("API: Error creating profile");
      return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
    }

    console.log("API: Profile created successfully:", newProfile);

    // Also update user metadata with avatar for immediate access
    if (newProfile.avatar_url) {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: newProfile.avatar_url },
      });

      if (updateError) {
        console.error("API: Failed to update user metadata with avatar:", updateError);
      } else {
        console.log("API: Updated user metadata with avatar");
      }
    }

    return NextResponse.json({
      success: true,
      profile: newProfile,
      isNewUser: true, // Flag indicating this is a new user
    });
  } catch (error) {
    console.error("API: Error in ensure-profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
