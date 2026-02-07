import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest) {
  try {
    const { avatarUrl } = await request.json();

    if (!avatarUrl) {
      return NextResponse.json({ error: "Avatar URL is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // Update the user's avatar URL in database
    const { data, error } = await supabase
      .from("user_profiles")
      .update({ avatar_url: avatarUrl })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating avatar:", error);
      return NextResponse.json({ error: "Failed to update avatar" }, { status: 500 });
    }

    // Also update user metadata for immediate sidebar access
    console.log("Updating user metadata with avatar:", avatarUrl);
    const { data: updatedUser, error: metadataError } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl },
    });

    if (metadataError) {
      console.error("Error updating user metadata:", metadataError);
      // Don't fail the request if metadata update fails
    } else {
      console.log("Successfully updated user metadata:", updatedUser?.user?.user_metadata);
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (error) {
    console.error("Error in avatar update API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
