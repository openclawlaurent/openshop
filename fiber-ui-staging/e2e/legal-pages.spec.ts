import { test, expect } from "@playwright/test";
import { createAuthenticatedUser } from "./helpers/auth";

test.describe("Legal Pages - Terms of Service", () => {
  test("displays terms page for unauthenticated users", async ({ page }) => {
    // Navigate without authentication
    await page.goto("/terms");
    await page.waitForTimeout(2000);

    // Verify page heading is visible
    await expect(page.getByRole("heading", { name: /^Terms of Service$/i })).toBeVisible();

    // Verify page loaded successfully (no redirect to auth)
    expect(page.url()).toContain("/terms");
  });

  test("displays terms page for authenticated users", async ({ page }) => {
    await createAuthenticatedUser(page, "test-terms-auth", {
      onboardingComplete: true,
    });

    await page.goto("/terms");
    await page.waitForTimeout(2000);

    // Verify page heading is visible
    await expect(page.getByRole("heading", { name: /^Terms of Service$/i })).toBeVisible();

    // Verify page loaded successfully
    expect(page.url()).toContain("/terms");
  });

  test("shows correct heading and last updated date", async ({ page }) => {
    await page.goto("/terms");
    await page.waitForTimeout(2000);

    // Main heading should be visible
    await expect(page.getByRole("heading", { name: /^Terms of Service$/i })).toBeVisible();

    // Last updated date should be visible
    await expect(page.getByText(/Last updated.*2025/i)).toBeVisible();

    // Card title should be visible (rendered as div, not heading)
    await expect(page.getByText(/Terms and Conditions/i)).toBeVisible();
  });

  test("displays multiple content sections", async ({ page }) => {
    await page.goto("/terms");
    await page.waitForTimeout(2000);

    // Check for specific section titles
    const hasAcceptance = await page.getByText(/Acceptance of Terms/i).isVisible();
    const hasServiceDescription = await page.getByText(/Service Description/i).isVisible();
    const hasUserAccounts = await page.getByText(/User Accounts.*Wallet/i).isVisible();

    // At least one section should be visible
    expect(hasAcceptance || hasServiceDescription || hasUserAccounts).toBe(true);

    // Should have multiple headings (h1 + h3 sections)
    const headings = page.locator("h1, h2, h3");
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(2);
  });

  test("terms link accessible from navigation", async ({ page }) => {
    await createAuthenticatedUser(page, "test-terms-nav", {
      onboardingComplete: true,
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Check if Terms link exists in the page (navigation or footer)
    const termsLink = page.getByRole("link", { name: /Terms/i }).first();
    const hasTermsLink = await termsLink.isVisible().catch(() => false);

    // Terms link should be accessible somewhere on the page
    expect(hasTermsLink).toBe(true);
  });

  test("terms page is mobile responsive", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/terms");
    await page.waitForTimeout(2000);

    // Verify page loaded in mobile view
    await expect(page.getByRole("heading", { name: /^Terms of Service$/i })).toBeVisible();

    // Content should be visible and readable
    await expect(page.getByText(/Last updated.*2025/i)).toBeVisible();

    // Card should be responsive
    const card = page.locator('[class*="card"]').first();
    await expect(card).toBeVisible();
  });
});

test.describe("Legal Pages - Privacy Policy", () => {
  test("displays privacy page for unauthenticated users", async ({ page }) => {
    // Navigate without authentication
    await page.goto("/privacy");
    await page.waitForTimeout(2000);

    // Verify page heading is visible
    await expect(page.getByRole("heading", { name: /^Privacy Policy$/i })).toBeVisible();

    // Verify page loaded successfully (no redirect to auth)
    expect(page.url()).toContain("/privacy");
  });

  test("displays privacy page for authenticated users", async ({ page }) => {
    await createAuthenticatedUser(page, "test-privacy-auth", {
      onboardingComplete: true,
    });

    await page.goto("/privacy");
    await page.waitForTimeout(2000);

    // Verify page heading is visible
    await expect(page.getByRole("heading", { name: /^Privacy Policy$/i })).toBeVisible();

    // Verify page loaded successfully
    expect(page.url()).toContain("/privacy");
  });

  test("shows correct heading and last updated date", async ({ page }) => {
    await page.goto("/privacy");
    await page.waitForTimeout(2000);

    // Main heading should be visible
    await expect(page.getByRole("heading", { name: /^Privacy Policy$/i })).toBeVisible();

    // Last updated date should be visible
    await expect(page.getByText(/Last updated.*2025/i)).toBeVisible();

    // Card title should be visible (rendered as div, not heading)
    await expect(page.getByText(/Your Privacy Matters/i)).toBeVisible();
  });

  test("displays multiple content sections", async ({ page }) => {
    await page.goto("/privacy");
    await page.waitForTimeout(2000);

    // Check for specific section titles using catch to handle errors
    const hasIntroduction = await page
      .getByText(/Introduction/i)
      .isVisible()
      .catch(() => false);
    const hasInformationCollected = await page
      .getByText(/Information We Collect/i)
      .isVisible()
      .catch(() => false);
    const hasWalletData = await page
      .getByRole("heading", { name: /Wallet.*Blockchain/i })
      .isVisible()
      .catch(() => false);

    // At least one section should be visible
    expect(hasIntroduction || hasInformationCollected || hasWalletData).toBe(true);

    // Should have multiple headings (h1 + h3 sections)
    const headings = page.locator("h1, h2, h3");
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(2);
  });

  test("privacy link accessible from navigation", async ({ page }) => {
    await createAuthenticatedUser(page, "test-privacy-nav", {
      onboardingComplete: true,
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Check if Privacy link exists in the page (navigation or footer)
    const privacyLink = page.getByRole("link", { name: /Privacy/i }).first();
    const hasPrivacyLink = await privacyLink.isVisible().catch(() => false);

    // Privacy link should be accessible somewhere on the page
    expect(hasPrivacyLink).toBe(true);
  });

  test("privacy page is mobile responsive", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/privacy");
    await page.waitForTimeout(2000);

    // Verify page loaded in mobile view
    await expect(page.getByRole("heading", { name: /^Privacy Policy$/i })).toBeVisible();

    // Content should be visible and readable
    await expect(page.getByText(/Last updated.*2025/i)).toBeVisible();

    // Card should be responsive
    const card = page.locator('[class*="card"]').first();
    await expect(card).toBeVisible();
  });
});
