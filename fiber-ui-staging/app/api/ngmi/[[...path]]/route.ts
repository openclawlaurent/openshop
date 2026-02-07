import { NextRequest, NextResponse } from "next/server";

/**
 * PostHog proxy endpoint to avoid ad blockers
 * Routes all PostHog requests through our backend at /api/ngmi
 *
 * This is a catch-all route that forwards any path under /api/ngmi to PostHog.
 * Supported endpoints:
 * - POST /api/ngmi/batch - Batch events (capture, identify, etc.)
 * - POST /api/ngmi/flags - Feature flags (decide v2)
 * - POST /api/ngmi/decide - Feature flags and experiments
 * - GET /api/ngmi/decide - Feature flags (GET)
 * - GET /api/ngmi/array/:key/config - Array config
 * - POST /api/ngmi/e - Single event capture (legacy)
 * - POST /api/ngmi/engage - Person properties updates
 */

const POSTHOG_HOST = "https://us.i.posthog.com";

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { path = [] } = await context.params;
    const pathname = path.length > 0 ? `/${path.join("/")}` : "/batch/";
    const searchParams = request.nextUrl.searchParams;
    const contentType = request.headers.get("content-type") || "";

    // Check if this is a gzipped request
    const compression = searchParams.get("compression");
    const isGzipped = compression === "gzip-js";

    let body: BodyInit;
    const forwardHeaders: Record<string, string> = {};

    // Handle different content types
    if (contentType.includes("application/x-www-form-urlencoded")) {
      // PostHog sends form-encoded data with a 'data' parameter containing the JSON payload
      const formData = await request.formData();
      const dataParam = formData.get("data");

      if (dataParam) {
        // The data is base64-encoded JSON in the 'data' parameter
        body = `data=${dataParam}`;
      } else {
        body = await request.text();
      }
      forwardHeaders["Content-Type"] = "application/x-www-form-urlencoded";
    } else if (isGzipped || contentType.includes("text/plain")) {
      // For gzipped data or plain text, preserve binary data integrity
      // Using blob() instead of text() prevents corruption of binary gzipped data
      body = await request.blob();
      forwardHeaders["Content-Type"] = contentType || "text/plain";

      // Add Content-Encoding header for gzipped data
      if (isGzipped) {
        forwardHeaders["Content-Encoding"] = "gzip";
      }
    } else {
      // Regular JSON body
      body = await request.text();
      forwardHeaders["Content-Type"] = "application/json";
    }

    // Build query string
    const queryString = searchParams.toString();
    const url = `${POSTHOG_HOST}${pathname}${queryString ? `?${queryString}` : ""}`;

    // Forward to PostHog with the appropriate headers
    const response = await fetch(url, {
      method: "POST",
      headers: forwardHeaders,
      body,
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("PostHog proxy error:", error);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { path = [] } = await context.params;
    const pathname = path.length > 0 ? `/${path.join("/")}` : "/decide/";
    const searchParams = request.nextUrl.searchParams;

    // Build query string
    const queryString = searchParams.toString();
    const url = `${POSTHOG_HOST}${pathname}${queryString ? `?${queryString}` : ""}`;

    // Forward to PostHog
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("PostHog proxy error:", error);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
