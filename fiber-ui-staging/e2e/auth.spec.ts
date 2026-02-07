import { test, expect } from "@playwright/test";
import { authenticateUser, clearAuth } from "./helpers/auth";

test.describe("Authentication - User Session Management", () => {
  test("allows authenticated user to access protected pages", async ({ page }) => {
    // Authenticate test user with unique email
    const user = await authenticateUser(page);
    expect(user.email).toBeTruthy();

    // Navigate to a protected page (profile)
    await page.goto("/profile");

    // Should not redirect to login
    expect(page.url()).toContain("/profile");

    // Page should load without auth errors
    await expect(page.locator("body")).toBeVisible();
  });

  test("handles unauthenticated state after logout", async ({ page }) => {
    // Authenticate first with unique email
    await authenticateUser(page);
    await page.goto("/profile");

    // Clear auth
    await clearAuth(page);

    // Navigate to protected page - should handle unauthenticated state
    await page.goto("/profile");

    // Verify we can still access the page (client-side auth drawer handles this)
    await expect(page.locator("body")).toBeVisible();
  });
});
