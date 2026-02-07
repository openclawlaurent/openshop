import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/profile/data-access/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email?.endsWith("@fiber.shop")) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    // Get user profile for deviceId
    const userProfile = await getUserProfile();
    const deviceId = userProfile?.wildfire_device_id;

    if (!deviceId) {
      return NextResponse.json({ error: "Device ID not found in user profile" }, { status: 400 });
    }

    // Get request body
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Call backend API
    const apiUrl = process.env.API_URL || "http://localhost:3005";
    const response = await fetch(`${apiUrl}/v1/commission/simulation/return/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ADMIN_API_KEY || "",
      },
      body: JSON.stringify({ deviceId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to start order return simulation");
    }

    console.log("Order return simulation started:", data);

    return NextResponse.json({
      success: true,
      message: "Order return simulation started successfully",
      data,
    });
  } catch (error) {
    console.error("Error starting order return simulation:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
