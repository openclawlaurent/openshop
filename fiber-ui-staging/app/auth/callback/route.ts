import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const next = requestUrl.searchParams.get("next") ?? "/";

  // Check for OAuth errors first
  if (error) {
    console.error("[OAUTH_CALLBACK] Error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(
        `/auth/error?message=${encodeURIComponent(errorDescription || error)}`,
        requestUrl.origin,
      ),
    );
  }

  if (!code) {
    console.error("[OAUTH_CALLBACK] No authorization code provided");
    return NextResponse.redirect(
      new URL("/auth/error?message=No+authorization+code+provided", requestUrl.origin),
    );
  }

  // Create a response object that we'll use to set cookies
  let response = NextResponse.next({
    request,
  });

  // Store cookie options and values so we can preserve them in the redirect
  type CookieOptions = {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
    maxAge?: number;
    path?: string;
    domain?: string;
  };
  const cookieOptionsMap = new Map<string, CookieOptions>();
  const cookieValuesMap = new Map<string, string>();

  // Helper to normalize cookie options from Supabase format to our type
  // Supabase SSR uses cookie options that can have boolean sameSite, we normalize to string
  const normalizeCookieOptions = (options?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: boolean | "strict" | "lax" | "none";
    maxAge?: number;
    path?: string;
    domain?: string;
  }): CookieOptions | undefined => {
    if (!options) return undefined;

    // Normalize sameSite: convert boolean to string or keep string value
    let sameSite: "strict" | "lax" | "none" | undefined;
    if (typeof options.sameSite === "string") {
      sameSite = options.sameSite as "strict" | "lax" | "none";
    } else if (options.sameSite === true) {
      // If true, default to lax
      sameSite = "lax";
    } else if (options.sameSite === false) {
      // If false, use none
      sameSite = "none";
    }

    return {
      httpOnly: options.httpOnly,
      secure: options.secure,
      sameSite,
      maxAge: options.maxAge,
      path: options.path,
      domain: options.domain,
    };
  };

  // Create Supabase client with request/response cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update request cookies
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          // Create new response with updated cookies
          response = NextResponse.next({
            request,
          });
          // Set cookies on the response and store their options and values
          cookiesToSet.forEach(({ name, value, options }) => {
            // Store cookie value FIRST - we'll need this for the redirect
            cookieValuesMap.set(name, value);

            // Determine secure flag - check both HTTPS protocol and production environment
            const isProduction =
              process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
            const isSecure = requestUrl.protocol === "https:";
            const shouldSecure = isSecure || isProduction;

            const cookieOptions = {
              ...options,
              secure: shouldSecure,
              sameSite: (options?.sameSite as "strict" | "lax" | "none") || "lax",
              path: options?.path || "/",
            };
            response.cookies.set(name, value, cookieOptions);
            // Store normalized options for later use in redirect
            const normalizedOptions = normalizeCookieOptions(cookieOptions);
            if (normalizedOptions) {
              cookieOptionsMap.set(name, normalizedOptions);
            }
          });
        },
      },
    },
  );

  try {
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[OAUTH_CALLBACK] Code exchange failed:", error.message);

      // Check if the error is due to signups being disabled
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "signup_disabled"
      ) {
        console.log("[OAUTH_CALLBACK] Signups disabled, redirecting to waitlist");
        return NextResponse.redirect(new URL("/waitlist", requestUrl.origin));
      }

      if (
        error.message?.toLowerCase().includes("redirect") ||
        error.message?.toLowerCase().includes("url")
      ) {
        console.error(
          "[OAUTH_CALLBACK] Redirect URL mismatch. Ensure Supabase redirect URL matches:",
          `${requestUrl.origin}/auth/callback`,
        );
      }
      return NextResponse.redirect(
        new URL(`/auth/error?message=${encodeURIComponent(error.message)}`, requestUrl.origin),
      );
    }

    // Use session data directly from exchangeCodeForSession instead of calling getUser()
    // This avoids the issue where getUser() returns null even after successful auth
    const user = sessionData.session?.user ?? sessionData.user;

    if (!user || !sessionData.session) {
      console.error("[OAUTH_CALLBACK] User/session verification failed");
      return NextResponse.redirect(
        new URL(
          `/auth/error?message=${encodeURIComponent("Failed to create session")}`,
          requestUrl.origin,
        ),
      );
    }

    // Ensure user profile is created
    // Use cookies from the session we just created (from cookieValuesMap)
    // This ensures the API call has the auth cookies needed
    try {
      // Construct Cookie header from the cookies we've set
      const cookieHeader = Array.from(cookieValuesMap.entries())
        .filter(([name]) => name.startsWith("sb-"))
        .map(([name, value]) => `${name}=${value}`)
        .join("; ");

      const profileResponse = await fetch(`${requestUrl.origin}/api/user/ensure-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader || request.headers.get("cookie") || "",
        },
      });

      if (!profileResponse.ok) {
        console.error("[OAUTH_CALLBACK] Failed to ensure user profile:", profileResponse.status);
      }
    } catch (profileError) {
      console.error("[OAUTH_CALLBACK] Error ensuring profile:", profileError);
      // Don't block the redirect if profile creation fails
    }

    const redirectUrl = new URL(next, requestUrl.origin);
    const redirectResponse = NextResponse.redirect(redirectUrl);

    // Copy all Supabase auth cookies to redirect response
    // Use the values and options we tracked during setAll (not from response.cookies)
    const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
    const isSecure = requestUrl.protocol === "https:";

    // Determine if we should use secure flag (HTTPS or production)
    const shouldSecure = isSecure || isProduction;

    // Use tracked cookie values instead of reading from response
    cookieValuesMap.forEach((value, name) => {
      // Only copy Supabase-related cookies (those starting with sb-)
      if (name.startsWith("sb-")) {
        const storedOptions = cookieOptionsMap.get(name);
        const finalOptions = storedOptions
          ? {
              ...storedOptions,
              secure: shouldSecure,
              sameSite: (storedOptions.sameSite || "lax") as "strict" | "lax" | "none",
              path: "/",
            }
          : {
              path: "/",
              httpOnly: true,
              secure: shouldSecure,
              sameSite: "lax" as const,
            };

        redirectResponse.cookies.set(name, value, finalOptions);
      }
    });

    return redirectResponse;
  } catch (error) {
    console.error(
      "[OAUTH_CALLBACK] Unexpected error:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.redirect(
      new URL(
        `/auth/error?message=${encodeURIComponent("An unexpected error occurred")}`,
        requestUrl.origin,
      ),
    );
  }
}
