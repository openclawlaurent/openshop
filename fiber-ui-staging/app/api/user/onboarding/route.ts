import { createClient } from "@/lib/supabase/server";
import { updateUserProfile } from "@/lib/data/server/user-profile";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { is_onboarding_completed } = await request.json();

    if (typeof is_onboarding_completed !== "boolean") {
      return NextResponse.json(
        { error: "is_onboarding_completed must be a boolean" },
        { status: 400 },
      );
    }

    // Update the user profile using the authenticated client (RLS-enabled)
    const updatedProfile = await updateUserProfile(supabase, user.id, {
      is_onboarding_completed,
    });

    if (!updatedProfile) {
      return NextResponse.json({ error: "Failed to update onboarding status" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Onboarding status updated successfully",
      is_onboarding_completed: updatedProfile.is_onboarding_completed,
    });
  } catch (error) {
    console.error("Error in onboarding PATCH:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
