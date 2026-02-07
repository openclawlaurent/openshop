import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Centralized test user management endpoint
 * SECURITY: Only works in test/development environments
 */

type UserProfileConfig = {
  onboardingComplete?: boolean;
  solanaAddress?: string;
  /** Partner token ID - pass true to auto-fetch USDC, or provide specific token ID */
  payoutPartnerTokenId?: string | boolean;
};

/**
 * POST /api/test-users - Create test user with profile
 */
export async function POST(request: NextRequest) {
  if (process.env.APP_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const { email, profile }: { email: string; profile?: UserProfileConfig } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const secretKey = process.env.SUPABASE_SECRET_KEY!;
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;

    if (!secretKey || !anonKey) {
      throw new Error("Supabase keys not configured");
    }

    // Create admin client
    const admin = createClient(supabaseUrl, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if user exists
    const { data: existingUsers } = await admin.auth.admin.listUsers();
    let user = existingUsers?.users?.find((u) => u.email === email);

    // Create user if doesn't exist
    if (!user) {
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { test_user: true },
      });

      if (createError || !newUser.user) {
        console.error("Failed to create user:", createError);
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
      }

      user = newUser.user;
    }

    // Set temporary password
    const tempPassword = `test-${Date.now()}-${Math.random()}`;
    await admin.auth.admin.updateUserById(user.id, { password: tempPassword });

    // Sign in to get session tokens
    const signInResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
      },
      body: JSON.stringify({ email, password: tempPassword }),
    });

    if (!signInResponse.ok) {
      console.error("Sign in failed:", await signInResponse.text());
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }

    const sessionData = await signInResponse.json();

    // Create user profile if config provided
    if (profile) {
      const isOnboardingComplete = profile.onboardingComplete === true;
      const wildfireDeviceId = isOnboardingComplete
        ? `test-device-${user.id.substring(0, 8)}-${Date.now()}`
        : null;

      // Resolve partner token ID
      let partnerTokenId: string | null = null;
      if (profile.payoutPartnerTokenId) {
        if (typeof profile.payoutPartnerTokenId === "boolean") {
          // Auto-fetch BONK token ID
          const { data: tokens } = await admin
            .from("partner_tokens")
            .select("id")
            .eq("symbol", "BONK")
            .eq("status", "active")
            .eq("is_available_for_payout", true)
            .limit(1)
            .single();

          if (tokens) {
            partnerTokenId = tokens.id;
          } else {
            console.warn("No BONK token found for test user");
          }
        } else {
          // Use provided token ID
          partnerTokenId = profile.payoutPartnerTokenId;
        }
      }

      const profileData = {
        user_id: user.id,
        email: user.email,
        wildfire_device_id: wildfireDeviceId,
        is_onboarding_completed: isOnboardingComplete,
        solana_address: profile.solanaAddress || null,
        is_solana_wallet_connected: profile.solanaAddress ? true : false,
        payout_partner_token_id: partnerTokenId,
        boost_tier_id: "alpha",
      };

      const { error: profileError } = await admin
        .from("user_profiles")
        .upsert(profileData, { onConflict: "user_id" })
        .select()
        .single();

      if (profileError) {
        console.error("Failed to create profile:", profileError);
      }
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      accessToken: sessionData.access_token,
      refreshToken: sessionData.refresh_token,
    });
  } catch (error) {
    console.error("Error creating test user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/test-users - Cleanup all test users and related data
 * Deletes:
 * - Commission activity summary
 * - Commission blockchain transactions
 * - User profiles (if cascade not working)
 * - Auth users (which should cascade delete profiles)
 */
export async function DELETE() {
  if (process.env.APP_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const secretKey = process.env.SUPABASE_SECRET_KEY!;

    if (!secretKey) {
      throw new Error("SUPABASE_SECRET_KEY not configured");
    }

    const admin = createClient(supabaseUrl, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get all users
    const { data: allUsers } = await admin.auth.admin.listUsers();

    if (!allUsers?.users) {
      return NextResponse.json({ deletedCount: 0 });
    }

    // Filter test users - ONLY those explicitly marked or with test email patterns
    const testUsers = allUsers.users.filter(
      (user) =>
        user.user_metadata?.test_user === true ||
        user.email?.startsWith("test-") ||
        user.email?.includes("@example.com"),
    );

    if (testUsers.length === 0) {
      return NextResponse.json({
        deletedCount: 0,
        message: "No test users found",
      });
    }

    const testUserIds = testUsers.map((user) => user.id);

    // Delete related data first (to handle cases where cascade isn't configured)
    // Note: commission_activity_summary is a VIEW, not a table - cannot delete from it
    // Note: commission_blockchain_transactions doesn't have direct userId column
    // Cascade delete from user_profiles should handle related commission data

    // 1. Delete user profiles (in case cascade delete doesn't work)
    const { error: profilesError } = await admin
      .from("user_profiles")
      .delete()
      .in("user_id", testUserIds);

    if (profilesError) {
      console.warn("Failed to delete user profiles:", profilesError);
    }

    // 2. Finally, delete auth users (which should cascade delete profiles if configured)
    await Promise.all(testUsers.map((user) => admin.auth.admin.deleteUser(user.id)));

    return NextResponse.json({
      deletedCount: testUsers.length,
      message: `Deleted ${testUsers.length} test users and related data`,
    });
  } catch (error) {
    console.error("Error cleaning up test users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
