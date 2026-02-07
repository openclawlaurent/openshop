import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * API endpoint to clear cache by revalidating paths
 *
 * This is a simpler alternative to tag-based revalidation.
 * It clears the cache for specific routes.
 *
 * Usage examples:
 *
 * 1. Clear home page cache:
 *    POST /api/cache/clear?path=/
 *
 * 2. Clear all pages (layout revalidation):
 *    POST /api/cache/clear?path=/&type=layout
 *
 * 3. With secret for production (recommended):
 *    POST /api/cache/clear?path=/&secret=YOUR_SECRET
 *
 * Set CACHE_REVALIDATE_SECRET in your environment to require authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Check secret token for production security
    const secret = request.nextUrl.searchParams.get("secret");
    const expectedSecret = process.env.CACHE_REVALIDATE_SECRET;

    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }

    // Get the path to revalidate
    const path = request.nextUrl.searchParams.get("path");
    const type = request.nextUrl.searchParams.get("type") as "page" | "layout" | undefined;

    if (!path) {
      return NextResponse.json(
        {
          error: "Missing path parameter",
          usage: "POST /api/cache/clear?path=/",
        },
        { status: 400 },
      );
    }

    // Revalidate the path
    if (type) {
      revalidatePath(path, type);
    } else {
      revalidatePath(path);
    }

    return NextResponse.json({
      success: true,
      message: `Cache cleared for path: ${path}`,
      path: path,
      type: type || "page",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cache clear error:", error);
    return NextResponse.json({ error: "Failed to clear cache" }, { status: 500 });
  }
}

/**
 * GET endpoint to check available options
 */
export async function GET() {
  return NextResponse.json({
    message: "Path-based Cache Clear API",
    method: "POST",
    commonPaths: {
      "/": "Clear home page cache",
      "/ (layout)": "Clear all pages (use type=layout)",
    },
    usage: {
      basic: "POST /api/cache/clear?path=/",
      withType: "POST /api/cache/clear?path=/&type=layout",
      withSecret: "POST /api/cache/clear?path=/&secret=YOUR_SECRET",
    },
    requiresSecret: !!process.env.CACHE_REVALIDATE_SECRET,
  });
}
