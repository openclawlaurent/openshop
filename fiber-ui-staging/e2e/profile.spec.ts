import { test, expect } from "@playwright/test";
import { createAuthenticatedUser } from "./helpers/auth";

test.describe("Profile Page", () => {
  test("displays profile page for authenticated users", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-profile-view", {
      onboardingComplete: true,
    });

    await page.goto("/profile");
    await page.waitForTimeout(2000);

    // Verify page title
    await expect(page.getByRole("heading", { name: /^profile$/i })).toBeVisible();

    // Verify page description
    await expect(page.getByText(/manage your account.*payout settings/i)).toBeVisible();
  });

  test("shows logout button", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-profile-logout", {
      onboardingComplete: true,
    });

    await page.goto("/profile");
    await page.waitForTimeout(2000);

    // Logout button should be visible
    const logoutButton = page.getByRole("button", { name: /log out|logout|sign out/i });
    await expect(logoutButton).toBeVisible();
  });

  test("displays user profile card", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-profile-card", {
      onboardingComplete: true,
    });

    await page.goto("/profile");
    await page.waitForTimeout(2000);

    // Should show user email or profile information
    const hasEmail = await page
      .getByText(/@example\.com/i)
      .isVisible()
      .catch(() => false);
    const hasProfileHeading = await page
      .getByRole("heading", { name: /user|account|details/i })
      .isVisible()
      .catch(() => false);

    expect(hasEmail || hasProfileHeading).toBe(true);
  });

  test("displays payout settings section", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-profile-payout", {
      onboardingComplete: true,
      payoutPartnerTokenId: true,
    });

    await page.goto("/profile");
    await page.waitForTimeout(3000);

    // Should show "Choose Token" heading or the green success box
    const hasPayoutHeading = await page
      .getByRole("heading", { name: /choose.*token/i })
      .isVisible()
      .catch(() => false);

    const hasSuccessBox = await page
      .locator(".bg-emerald-50, .bg-green-50")
      .isVisible()
      .catch(() => false);

    expect(hasPayoutHeading || hasSuccessBox).toBe(true);
  });

  test("displays wallet connection section", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-profile-wallet", {
      onboardingComplete: true,
    });

    await page.goto("/profile");
    await page.waitForTimeout(3000);

    // Wait for any Card heading to load first (profile card, choose token, or wallet)
    // Then check if wallet section loaded
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 5000 });

    // Should show wallet-related content - could be heading, button, or status
    const hasWalletHeading = await page
      .getByRole("heading", { name: /solana.*wallet/i })
      .isVisible()
      .catch(() => false);

    const hasWalletButton = await page
      .getByRole("button")
      .filter({ hasText: /connect.*wallet|wallet/i })
      .first()
      .isVisible()
      .catch(() => false);

    const hasWalletStatus = await page
      .getByTestId("wallet-disconnected-status")
      .isVisible()
      .catch(() => false);

    expect(hasWalletHeading || hasWalletButton || hasWalletStatus).toBe(true);
  });

  test("redirects unauthenticated users to login", async ({ page }) => {
    // Don't create authenticated user, just navigate directly
    await page.goto("/profile");
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

  test("shows connected wallet address when wallet is connected", async ({ page }) => {
    // Generate unique wallet address to prevent conflicts
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    const mockAddress = `Mock${timestamp}${random}`.padEnd(44, "x");

    const user = await createAuthenticatedUser(page, "test-profile-connected", {
      onboardingComplete: true,
      solanaAddress: mockAddress,
    });

    await page.goto("/profile");
    await page.waitForTimeout(2000);

    // Should show truncated wallet address or connection status
    const hasConnectedStatus =
      (await page
        .getByTestId("wallet-connected-status")
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByText(/connected|wallet.*connected/i)
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByText(/Test.*123/i)
        .isVisible()
        .catch(() => false));

    expect(hasConnectedStatus).toBe(true);
  });

  test("navigates to profile from home page navigation", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-profile-navigate", {
      onboardingComplete: true,
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Find and click profile link in navigation (use first visible one - desktop or mobile)
    const profileLink = page.getByTestId("nav-link-profile").first();
    await profileLink.click();
    await page.waitForTimeout(1500);

    // Should navigate to profile page
    expect(page.url()).toContain("/profile");
    await expect(page.getByRole("heading", { name: /^profile$/i })).toBeVisible();
  });

  test("page is responsive and loads on mobile viewport", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-profile-mobile", {
      onboardingComplete: true,
    });

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/profile");
    await page.waitForTimeout(2000);

    // Verify page loaded in mobile view
    await expect(page.getByRole("heading", { name: /^profile$/i })).toBeVisible();

    // Logout button should still be accessible
    const logoutButton = page.getByRole("button", { name: /log out|logout|sign out/i });
    await expect(logoutButton).toBeVisible();
  });

  test("shows payout token selector when no token is selected", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-profile-no-token", {
      onboardingComplete: true,
      payoutPartnerTokenId: false, // No token selected
    });

    await page.goto("/profile");
    await page.waitForTimeout(2000);

    // Should show token selector or prompt to select token
    const hasTokenSelector = await page
      .getByRole("combobox")
      .isVisible()
      .catch(() => false);
    const hasSelectPrompt = await page
      .getByText(/select.*token|choose.*token/i)
      .isVisible()
      .catch(() => false);

    expect(hasTokenSelector || hasSelectPrompt).toBe(true);
  });

  test("displays saved payout token when token is already selected", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-profile-saved-token", {
      onboardingComplete: true,
      payoutPartnerTokenId: true, // BONK token
    });

    await page.goto("/profile");
    await page.waitForTimeout(2000);

    // Should show the selected token (BONK or success state)
    const hasTokenDisplay =
      (await page
        .getByText(/BONK|saved|selected/i)
        .isVisible()
        .catch(() => false)) ||
      (await page
        .locator(".bg-emerald-50, .bg-green-50")
        .isVisible()
        .catch(() => false));

    expect(hasTokenDisplay).toBe(true);
  });
});
