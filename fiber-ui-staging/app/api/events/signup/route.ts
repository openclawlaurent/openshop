import { NextRequest, NextResponse } from "next/server";

interface SignupEventRequestBody {
  email: string;
  userName?: string;
  userId?: string;
}

interface SignupEventResponse {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: SignupEventRequestBody = await request.json();

    if (!body.email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    // Call backend API
    const apiUrl = process.env.API_URL || "";

    if (!apiUrl) {
      console.warn("API_URL not configured, skipping welcome email");
      return NextResponse.json<SignupEventResponse>(
        {
          success: true,
          message: "API_URL not configured - email skipped",
        },
        { status: 202 },
      );
    }

    // console.log({ apiUrl });

    const response = await fetch(`${apiUrl}/v1/events/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ADMIN_API_KEY || "",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to trigger signup event");
    }

    // console.log("User signup event triggered:", {
    //   email: body.email,
    //   userId: body.userId,
    // });

    return NextResponse.json<SignupEventResponse>(
      {
        success: true,
        message: "User signup event triggered",
        data,
      },
      { status: 202 },
    );
  } catch (error) {
    console.error("Error triggering signup event:", error);
    // Return success anyway - we don't want to fail user signup if email fails
    return NextResponse.json<SignupEventResponse>(
      {
        success: true,
        message: "Signup completed (email may have failed)",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 202 },
    );
  }
}
