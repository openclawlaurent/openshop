import { Page } from "@playwright/test";

export interface TestUser {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export interface UserProfileOptions {
  /** Whether the user has completed onboarding (sets wildfire_device_id) */
  onboardingComplete?: boolean;
  /** Solana wallet address */
  solanaAddress?: string;
  /** Partner token ID - pass true to auto-fetch BONK, or provide specific token ID */
  payoutPartnerTokenId?: string | boolean;
}

/**
 * Creates a test user with optional profile configuration
 * Automatically generates unique email if prefix provided
 */
export async function createTestUser(
  page: Page,
  emailOrPrefix: string,
  profile?: UserProfileOptions,
): Promise<TestUser> {
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://127.0.0.1:3010";

  // Auto-generate unique email if it looks like a prefix (no @)
  // Use high-resolution timestamp + random string to avoid collisions in parallel tests
  const email = emailOrPrefix.includes("@")
    ? emailOrPrefix
    : `${emailOrPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@example.com`;

  const response = await page.request.post(`${baseUrl}/api/test-users`, {
    data: { email, profile },
  });

  if (!response.ok()) {
    const status = response.status();
    const errorText = await response.text();
    throw new Error(`Failed to create test user: ${status} ${errorText}`);
  }

  const result = await response.json();
  console.log(`✓ Created test user: ${result.email}`);
  return result;
}

/**
 * Set Supabase auth cookies to authenticate the user
 */
export async function authenticateTestUser(
  page: Page,
  accessToken: string,
  refreshToken: string,
  userId?: string,
  email?: string,
): Promise<void> {
  const projectRef = getSupabaseProjectRef();

  await page.context().addCookies([
    {
      name: `sb-${projectRef}-auth-token`,
      value: JSON.stringify({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: "bearer",
        user: userId && email ? { id: userId, email } : undefined,
      }),
      domain: "localhost",
      path: "/",
      httpOnly: false,
      sameSite: "Lax",
      expires: Date.now() / 1000 + 3600,
    },
  ]);

  // Small delay to ensure cookies are set
  await page.waitForTimeout(100);
}

/**
 * Create and authenticate a test user in one step
 * Simplified version that doesn't navigate - let the test navigate where it needs
 */
export async function createAuthenticatedUser(
  page: Page,
  emailOrPrefix: string = "test-user",
  profile?: UserProfileOptions,
): Promise<TestUser> {
  const user = await createTestUser(page, emailOrPrefix, profile);
  await authenticateTestUser(page, user.accessToken, user.refreshToken, user.userId, user.email);
  return user;
}

/**
 * Creates a test user and authenticates them by setting Supabase auth cookies
 * This is a legacy helper - navigates to "/" which adds overhead
 * Consider using createAuthenticatedUser() instead
 */
export async function authenticateUser(
  page: Page,
  email?: string,
  profileOptions?: UserProfileOptions,
): Promise<{ email: string; id?: string }> {
  // Generate unique email if not provided to avoid conflicts in shared databases
  if (!email) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    email = `test-${timestamp}-${random}@example.com`;
  }

  // Build profile config for new API
  // Default to completed onboarding if no profile options provided
  const profile = profileOptions
    ? {
        onboardingComplete: profileOptions.onboardingComplete,
        solanaAddress: profileOptions.solanaAddress,
        payoutPartnerTokenId: profileOptions.payoutPartnerTokenId,
      }
    : {
        onboardingComplete: true,
      };

  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://127.0.0.1:3010";

  // Use new consolidated endpoint
  const response = await page.request.post(`${baseUrl}/api/test-users`, {
    data: { email, profile },
  });

  if (!response.ok()) {
    const status = response.status();
    const responseText = await response.text();
    const error = new Error("Auth failed");
    console.error(error.message, { status, responseText });
    throw error;
  }

  const { userId, email: userEmail, accessToken, refreshToken } = await response.json();

  // Set Supabase auth cookies
  const projectRef = getSupabaseProjectRef();

  await page.context().addCookies([
    {
      name: `sb-${projectRef}-auth-token`,
      value: JSON.stringify({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: "bearer",
        user: { id: userId, email: userEmail },
      }),
      domain: "localhost",
      path: "/",
      httpOnly: false,
      sameSite: "Lax",
      expires: Date.now() / 1000 + 3600,
    },
  ]);

  // Navigate to homepage to trigger cookie loading and wait for auth to initialize
  await page.goto("/");

  // Wait for auth context to initialize by checking for authenticated UI elements
  // The home page should show the main content once auth is loaded
  try {
    await page.waitForSelector('[data-testid="home-page"]', { timeout: 5000 });
  } catch (error) {
    console.warn("Auth may not have initialized properly - home page not visible");
  }

  return { email: userEmail, id: userId };
}

/**
 * Clean up all test users from the database
 * Automatically called by global setup before tests run
 */
export async function cleanupTestUsers(page: Page): Promise<number> {
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://127.0.0.1:3010";

  const response = await page.request.delete(`${baseUrl}/api/test-users`);

  if (!response.ok()) {
    console.warn(`⚠️  Cleanup failed: ${response.status()} ${response.statusText()}`);
    return 0;
  }

  const data = await response.json();
  console.log(`🧹 Cleaned up ${data.deletedCount} test users`);
  return data.deletedCount || 0;
}

/**
 * Clear authentication cookies
 */
export async function clearAuth(page: Page): Promise<void> {
  await page.context().clearCookies();
}

/**
 * Extracts the Supabase project reference from the SUPABASE_URL
 * Format: https://[PROJECT_REF].supabase.co
 */
function getSupabaseProjectRef(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL not set");
  }

  // If using localhost/127.0.0.1 (local Supabase), still use the production project ref
  // because the cookie name is based on the production Supabase instance
  const match = supabaseUrl.match(/https?:\/\/([^.]+)\./);
  if (!match) {
    throw new Error("Could not extract project ref from SUPABASE_URL");
  }

  const projectRef = match[1];

  // If we got "127" or "localhost", it means we're using local Supabase
  // but the cookie name should still match the production project ref
  if (projectRef === "127" || projectRef === "localhost") {
    return "pqzdcscbwwapxsuygizi"; // Use the actual production project ref
  }

  return projectRef;
}
