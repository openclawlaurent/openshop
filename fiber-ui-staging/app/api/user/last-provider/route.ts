import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Get the last sign-in provider for a user by email
 * Used to show hints like "Previously used Google" in login flow
 *
 * Queries auth.users directly via Supabase service role client
 * Provider is stored in app_metadata.provider by Supabase Auth
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email parameter required" }, { status: 400 });
    }

    // Use service role client to access auth.users table
    const supabase = createServiceRoleClient();

    // Query auth.users by email using admin API
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("Error fetching users from auth.users:", error);
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
    }

    // Find user by email (case-insensitive)
    const user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Don't reveal if user exists or not (security)
      return NextResponse.json({ provider: null });
    }

    // Supabase stores OAuth provider in app_metadata.provider
    // Possible values: "google", "twitter", "email" (for OTP/magic link)
    const provider = user.app_metadata?.provider || null;

    // Return both provider hint and email for pre-filling
    return NextResponse.json({
      provider: provider === "email" ? null : provider, // Only return OAuth providers (google/twitter)
      email: user.email || null,
    });
  } catch (error) {
    console.error("Error in last-provider endpoint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
