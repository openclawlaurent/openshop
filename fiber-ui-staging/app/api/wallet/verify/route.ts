import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, signature, network = "mainnet-beta" } = await request.json();

    if (!walletAddress || !signature) {
      return NextResponse.json(
        { error: "Wallet address and signature are required" },
        { status: 400 },
      );
    }

    // Validate network
    if (!["mainnet", "mainnet-beta", "testnet", "devnet"].includes(network)) {
      return NextResponse.json(
        { error: "Invalid network. Must be mainnet-beta, testnet, or devnet" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // First check if user profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    console.log("User profile check:", {
      user_id: user.id,
      exists: !!existingProfile,
      fetchError: fetchError?.message,
    });

    if (fetchError || !existingProfile) {
      console.error("User profile does not exist:", user.id);
      return NextResponse.json(
        { error: "User profile not found. Please complete onboarding first." },
        { status: 404 },
      );
    }

    // Update user profile with Solana address, metadata, and connection status
    const { data: updateData, error } = await supabase
      .from("user_profiles")
      .update({
        solana_address: walletAddress,
        solana_metadata: {
          network: network,
          signature: signature,
          verified_at: new Date().toISOString(),
        },
        is_solana_wallet_connected: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select();

    if (error) {
      // Check for unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          {
            error: "This wallet address is already registered to another user",
          },
          { status: 409 },
        );
      }

      console.error("Error storing wallet:", error);
      return NextResponse.json({ error: "Failed to save wallet information" }, { status: 500 });
    }

    console.log("Wallet saved successfully:", {
      user_id: user.id,
      wallet_address: walletAddress,
      updated_data: updateData,
    });

    return NextResponse.json({ success: true, data: updateData });
  } catch (error) {
    console.error("Wallet verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
