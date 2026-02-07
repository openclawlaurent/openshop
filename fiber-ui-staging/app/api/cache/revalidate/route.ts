import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { ALGOLIA_CACHE_TAGS } from "@/lib/services/algolia-cache";
import { createClient } from "@/lib/supabase/server";

/**
 * API endpoint to revalidate Algolia cache
 *
 * Usage examples:
 *
 * 1. Clear all Algolia cache (admin only):
 *    POST /api/cache/revalidate?tag=all
 *
 * 2. Clear only search cache (admin only):
 *    POST /api/cache/revalidate?tag=search
 *
 * 3. Clear only top offers cache (admin only):
 *    POST /api/cache/revalidate?tag=top-offers
 *
 * 4. With secret for external services (bypasses auth):
 *    POST /api/cache/revalidate?tag=all&secret=YOUR_SECRET
 *
 * Set CACHE_REVALIDATE_SECRET in your environment to allow external services
 */
export async function POST(request: NextRequest) {
  try {
    // Check for secret token first (for external services like webhooks)
    const secret = request.nextUrl.searchParams.get("secret");
    const expectedSecret = process.env.CACHE_REVALIDATE_SECRET;

    // If secret is provided and valid, skip user auth check
    if (expectedSecret && secret === expectedSecret) {
      // Secret is valid, proceed to cache clearing
    } else {
      // No secret or invalid secret - check for authenticated admin user
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const isAdmin = user?.email?.endsWith("@fiber.shop") ?? false;

      if (!isAdmin) {
        return NextResponse.json(
          { error: "Unauthorized - Admin access required" },
          { status: 403 },
        );
      }
    }

    // Get the tag to revalidate (default to 'all')
    const tagParam = request.nextUrl.searchParams.get("tag") || "all";

    // Map user-friendly tag names to actual cache tags
    const tagMap: Record<string, string> = {
      all: ALGOLIA_CACHE_TAGS.ALL,
      search: ALGOLIA_CACHE_TAGS.SEARCH,
      "top-offers": ALGOLIA_CACHE_TAGS.TOP_OFFERS,
    };

    const tag = tagMap[tagParam];

    if (!tag) {
      return NextResponse.json(
        {
          error: "Invalid tag",
          validTags: Object.keys(tagMap),
        },
        { status: 400 },
      );
    }

    // Revalidate the cache
    revalidateTag(tag);

    return NextResponse.json({
      success: true,
      message: `Cache revalidated for tag: ${tagParam}`,
      tag: tag,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cache revalidation error:", error);
    return NextResponse.json({ error: "Failed to revalidate cache" }, { status: 500 });
  }
}

/**
 * GET endpoint to check cache status and available options
 */
export async function GET() {
  return NextResponse.json({
    message: "Algolia Cache Revalidation API",
    method: "POST",
    availableTags: {
      all: "Clear all Algolia cache",
      search: "Clear search cache only",
      "top-offers": "Clear top offers cache only",
    },
    usage: {
      basic: "POST /api/cache/revalidate?tag=all",
      withSecret: "POST /api/cache/revalidate?tag=all&secret=YOUR_SECRET",
    },
    requiresSecret: !!process.env.CACHE_REVALIDATE_SECRET,
  });
}
