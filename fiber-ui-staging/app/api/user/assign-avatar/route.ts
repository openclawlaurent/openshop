import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRandomAvatarId, getAvatarUrl } from "@/lib/utils/avatar-pregenerated";

export async function POST() {
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

    // Generate random avatar for user
    const avatarId = getRandomAvatarId();
    const avatarUrl = getAvatarUrl(avatarId, process.env.NEXT_PUBLIC_SUPABASE_URL!);

    // Update the user's avatar URL
    const { error } = await supabase
      .from("user_profiles")
      .update({ avatar_url: avatarUrl })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error assigning avatar:", error);
      return NextResponse.json({ error: "Failed to assign avatar" }, { status: 500 });
    }

    return NextResponse.json({ success: true, avatar_url: avatarUrl });
  } catch (error) {
    console.error("Error in assign avatar API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
