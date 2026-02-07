import { NextRequest, NextResponse } from "next/server";
import { getUserProfileData, updateUserProfile } from "@/lib/data/server/user-profile";
import { ensureUserProfile } from "@/lib/actions/server/user-profile";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    // Ensure user profile exists (this will create one with avatar if it doesn't exist)
    await ensureUserProfile();

    // Get the profile data using the centralized function
    const profileData = await getUserProfileData();

    if (!profileData) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error in profile API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // Parse the request body
    const updates = await request.json();

    // Update the user profile
    const updatedProfile = await updateUserProfile(supabase, user.id, updates);

    if (!updatedProfile) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error in profile PATCH:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
