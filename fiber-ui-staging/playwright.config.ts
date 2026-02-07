import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
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
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3010",

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

    // Uncomment to test on other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI
    ? {
        // CI: Use doppler run without explicit project/config (relies on env vars)
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
        // Local: Use explicit project/config for local development
        command: "doppler run --project fiber-ui --config staging_local -- pnpm run dev",
        url: "http://localhost:3010",
        reuseExistingServer: true,
        stdout: "ignore",
        stderr: "pipe",
        timeout: 120_000,
      },
});
