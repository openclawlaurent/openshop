import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Handle /r/w (Wildfire) redirect proxy
  if (pathname === "/r/w") {
    const trackingId = searchParams.get("c");
    const deviceId = searchParams.get("d");
    const destinationUrl = searchParams.get("url");

    // Validate required parameters
    if (!trackingId || !deviceId) {
      return NextResponse.json(
        { error: "Missing required parameters: c (tracking ID) and d (device ID) are required" },
        { status: 400 },
      );
    }

    // Build the wild.link URL
    const wildLinkUrl = new URL("https://wild.link/e");
    wildLinkUrl.searchParams.set("c", trackingId);
    wildLinkUrl.searchParams.set("d", deviceId);

    if (destinationUrl) {
      wildLinkUrl.searchParams.set("url", destinationUrl);
    }

    // TODO: Add analytics tracking here
    // - Log redirect in database
    // - Track click metrics
    // - Associate with user if authenticated

    // Perform the redirect (307 = temporary redirect, preserves method)
    return NextResponse.redirect(wildLinkUrl.toString(), 307);
  }

  // Continue with Supabase session update for all other routes
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
