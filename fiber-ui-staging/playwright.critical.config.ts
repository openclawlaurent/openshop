import { defineConfig, devices } from "@playwright/test";

/**
 * Critical E2E Tests - Highest Value User Flows Only
 *
 * Run with: pnpm exec playwright test --config=playwright.critical.config.ts
 *
 * Covers 15 most important user journeys:
 * 1. Auth & protected pages
 * 2. Wallet connect/disconnect
 * 3. Token selection & persistence
 * 4. Offer click-through & affiliate links
 * 5. Search functionality
 * 6. Onboarding flow
 * 7. Unauthenticated redirects
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: [
    // Auth flows (Core session management)
    "**/auth.spec.ts",

    // Onboarding (First-run experience - Critical for growth)
    "**/onboarding-flow.spec.ts",

    // Offer interaction (Revenue flow - Critical for business)
    "**/offer-click-through.spec.ts",

    // Search (Discovery - Critical for engagement)
    "**/search.spec.ts",

    // Wallet connection (Core feature - Critical for payout)
    "**/wallet-connection.spec.ts",

    // Unauthenticated (Access control - Critical for security/SEO)
    "**/unauthenticated.spec.ts",
  ],

  /* Global setup to clean test data before all tests */
  globalSetup: "./e2e/global-setup.ts",

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* No retries for critical tests - they should pass reliably */
  retries: 0,

  /* Run sequentially in CI to avoid resource constraints, parallel locally */
  workers: process.env.CI ? 1 : 3,

  /* Longer timeout in CI due to resource constraints */
  timeout: process.env.CI ? 120000 : 30000,

  /* Reporter to use */
  reporter: process.env.CI ? [["github"], ["html"]] : "list",

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3010",

    /* Collect trace when retrying the failed test */
    trace: "on-first-retry",

    /* Screenshot on failure */
    screenshot: "only-on-failure",

    /* Only record video on failure */
    video: "retain-on-failure",

    /* Increased timeouts for CI resource constraints */
    actionTimeout: process.env.CI ? 60000 : 15000,
    navigationTimeout: process.env.CI ? 90000 : 20000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI
    ? {
        command: "doppler run -- pnpm run dev",
        url: "http://localhost:3010",
        reuseExistingServer: false,
        stdout: "pipe",
        stderr: "pipe",
        timeout: 120_000,
        env: Object.fromEntries(
          Object.entries({
            DOPPLER_TOKEN: process.env.DOPPLER_TOKEN,
            DOPPLER_PROJECT: process.env.DOPPLER_PROJECT,
            DOPPLER_CONFIG: process.env.DOPPLER_CONFIG,
          }).filter(([_, v]) => v !== undefined) as [string, string][],
        ),
      }
    : {
        command: "doppler run --project fiber-ui --config staging_local -- pnpm run dev",
        url: "http://localhost:3010",
        reuseExistingServer: true,
        stdout: "ignore",
        stderr: "pipe",
        timeout: 120_000,
      },
});
