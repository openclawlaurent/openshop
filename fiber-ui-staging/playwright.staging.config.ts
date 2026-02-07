import { defineConfig, devices } from "@playwright/test";

/**
 * Staging E2E Tests Configuration
 *
 * Run with: pnpm run test:e2e:staging
 *
 * targeted against: https://app.staging.fiber.shop
 */
export default defineConfig({
  testDir: "./e2e",
  /* Global setup to clean test data before all tests */
  globalSetup: "./e2e/global-setup.ts",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. Limit workers to avoid Supabase rate limiting */
  workers: process.env.CI ? 2 : 3,
  /* Timeout for each test */
  timeout: process.env.CI ? 60000 : 30000,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [["github"], ["html"]] : "list",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "https://app.staging.fiber.shop",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Screenshot on failure */
    screenshot: "only-on-failure",

    /* Record video only on first retry (not all tests) */
    video: "retain-on-failure",

    /* Increase timeouts in CI environment for reliability */
    actionTimeout: process.env.CI ? 30000 : 15000,
    navigationTimeout: process.env.CI ? 60000 : 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* No webServer configuration needed as we test against deployed environment */
});
