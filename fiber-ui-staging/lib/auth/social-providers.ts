import { createClient } from "@/lib/supabase/client";
import type { Provider } from "@supabase/supabase-js";

export type SocialProvider = "google" | "twitter";

export interface OAuthOptions {
  redirectTo?: string;
  scopes?: string;
  queryParams?: Record<string, string>;
}

/**
 * Initiates OAuth sign-in flow for social providers (Google, Twitter/X)
 * @param provider - The OAuth provider to use
 * @param options - Optional configuration for the OAuth flow
 * @returns Promise with sign-in data or error
 */
export async function signInWithSocialProvider(provider: SocialProvider, options?: OAuthOptions) {
  const supabase = createClient();

  // Construct the redirect URL
  const redirectUrl = options?.redirectTo || `${window.location.origin}/auth/callback`;

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: redirectUrl,
        scopes: options?.scopes,
        queryParams: options?.queryParams,
      },
    });

    if (error) {
      console.error("[OAUTH] Initiation error:", error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`[OAUTH] Error signing in with ${provider}:`, error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error(`Failed to sign in with ${provider}`),
    };
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(redirectTo?: string) {
  return signInWithSocialProvider("google", {
    redirectTo,
    queryParams: {
      access_type: "offline",
      prompt: "consent",
    },
  });
}

/**
 * Sign in with Twitter/X OAuth
 */
export async function signInWithTwitter(redirectTo?: string) {
  return signInWithSocialProvider("twitter", { redirectTo });
}
