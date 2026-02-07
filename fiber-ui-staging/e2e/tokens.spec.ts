import { test, expect } from "@playwright/test";
import { createAuthenticatedUser } from "./helpers/auth";

test.describe("Tokens Page", () => {
  test("displays tokens page for authenticated users", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-tokens-view", {
      onboardingComplete: true,
    });

    await page.goto("/tokens");
    await page.waitForTimeout(2000);

    // Verify page loaded
    await expect(page.getByTestId("tokens-page")).toBeVisible();

    // Verify page title
    await expect(page.getByRole("heading", { name: /tokens/i })).toBeVisible();

    // Verify page description
    await expect(page.getByText(/track your tokens/i)).toBeVisible();
  });

  test("shows activity stats section", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-tokens-stats", {
      onboardingComplete: true,
      payoutPartnerTokenId: true,
    });

    await page.goto("/tokens");
    await page.waitForTimeout(2000);

    // Activity stats should be visible - look for the card titles
    const hasTotalEarnings = await page.getByText(/Total Earnings/i).isVisible();
    const hasPendingEarnings = await page.getByText(/Pending Earnings/i).isVisible();

    expect(hasTotalEarnings && hasPendingEarnings).toBe(true);
  });

  test("shows empty state when user has no transactions", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-tokens-empty", {
      onboardingComplete: true,
      payoutPartnerTokenId: true,
    });

    await page.goto("/tokens");
    await page.waitForTimeout(2000);

    // Look for empty state messaging
    const hasEmptyState =
      (await page
        .getByText(/no.*transactions|no.*tokens|get started|make.*purchase/i)
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByText(/0.*transactions/i)
        .isVisible()
        .catch(() => false));

    // Empty state should be shown for new users
    expect(hasEmptyState).toBe(true);
  });

  test("redirects unauthenticated users to login", async ({ page }) => {
    // Don't create authenticated user, just navigate directly
    await page.goto("/tokens");
    await page.waitForTimeout(2000);

    // Should redirect to login or show auth prompt
    const url = page.url();
    const isAuthPage = url.includes("login") || url.includes("auth") || url.includes("sign");

    // Or check for auth drawer/modal
    const hasAuthDrawer = await page
      .getByTestId("auth-drawer")
      .isVisible()
      .catch(() => false);

    expect(isAuthPage || hasAuthDrawer).toBe(true);
  });

  test("displays correct currency formatting for different tokens", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-tokens-format", {
      onboardingComplete: true,
      payoutPartnerTokenId: true,
    });

    await page.goto("/tokens");
    await page.waitForTimeout(2000);

    // Check that currency values are formatted correctly
    // For empty state, should show "0 FIN" or similar
    const hasCurrencyFormatting =
      (await page
        .getByText(/FIN|BONK|USDC|SOL|USDT/i)
        .first()
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByText(/completed.*offer/i)
        .isVisible()
        .catch(() => false));

    expect(hasCurrencyFormatting).toBe(true);
  });

  test("shows page title in navigation breadcrumb", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-tokens-nav", {
      onboardingComplete: true,
    });

    await page.goto("/tokens");
    await page.waitForTimeout(2000);

    // Verify "Earnings" appears in nav or breadcrumb (might be highlighted)
    const hasEarningsNav = await page
      .getByRole("navigation")
      .getByText(/tokens/i)
      .isVisible()
      .catch(() => false);

    // Or check for active/selected state in bottom nav (mobile)
    const hasActiveNav =
      hasEarningsNav ||
      (await page
        .locator('[aria-current="page"]')
        .getByText(/tokens/i)
        .isVisible()
        .catch(() => false));

    expect(hasActiveNav).toBe(true);
  });

  test("activity stats show zero values for new users", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-tokens-zero", {
      onboardingComplete: true,
      payoutPartnerTokenId: true,
    });

    await page.goto("/tokens");
    await page.waitForTimeout(2000);

    // New users should see "0 FIN" for total tokens and "None" for pending
    const hasZeroFIN = await page.getByText(/0 FIN/i).isVisible();
    const hasNonePending = await page.getByText(/None/i).isVisible();

    expect(hasZeroFIN || hasNonePending).toBe(true);
  });

  test("page is responsive and loads on mobile viewport", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-tokens-mobile", {
      onboardingComplete: true,
    });

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/tokens");
    await page.waitForTimeout(2000);

    // Verify page loaded in mobile view
    await expect(page.getByTestId("tokens-page")).toBeVisible();

    // Verify content is still accessible
    await expect(page.getByRole("heading", { name: /tokens/i })).toBeVisible();
  });

  test("navigates to tokens from home page navigation", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-tokens-navigate", {
      onboardingComplete: true,
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Find and click tokens link in navigation (use first visible one - desktop or mobile)
    const tokensLink = page.getByTestId("nav-link-tokens").first();
    await tokensLink.click();
    await page.waitForTimeout(1500);

    // Should navigate to tokens page
    expect(page.url()).toContain("/tokens");
    await expect(page.getByTestId("tokens-page")).toBeVisible();
  });
});
