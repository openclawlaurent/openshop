import { chromium, FullConfig } from "@playwright/test";
import { cleanupTestUsers } from "./helpers/auth";

/**
 * Global setup runs once before all tests
 * Cleans up all test data to ensure clean slate
 */
async function globalSetup(config: FullConfig) {
  console.log("🧹 Cleaning up test data before test run...");

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await cleanupTestUsers(page);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    await browser.close();
  }
}

export default globalSetup;
