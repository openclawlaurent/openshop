import { test, expect } from "@playwright/test";
import { createAuthenticatedUser } from "./helpers/auth";

test.describe("Navigation - Authenticated User Page Access", () => {
  test.beforeEach(async ({ page }) => {
    // Create and authenticate user without navigating
    // Let each test navigate to where it needs
    await createAuthenticatedUser(page);
  });

  test("loads home page successfully", async ({ page }) => {
    await page.goto("/");
    // Verify main home page content loads
    await expect(page.getByTestId("home-page").first()).toBeVisible();
  });

  test("loads search page successfully", async ({ page }) => {
    await page.goto("/search");
    // Should redirect to /
    expect(page.url()).toContain("/");
    // Verify search page loads with home content
    await expect(page.getByTestId("home-page").first()).toBeVisible();
  });

  test("loads tokens page successfully", async ({ page }) => {
    await page.goto("/tokens");
    expect(page.url()).toContain("/tokens");
    // Verify tokens page main content loads
    await expect(page.getByTestId("tokens-page")).toBeVisible();
  });

  test("loads profile page successfully", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForTimeout(2000); // Wait for profile to load
    expect(page.url()).toContain("/profile");
    // Verify profile page loads
    await expect(page.getByTestId("profile-heading")).toBeVisible({ timeout: 10000 });
  });
});
