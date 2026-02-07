import { test, expect } from "@playwright/test";
import { createTestUser, authenticateTestUser } from "./helpers/auth";

test.describe("User Setup States - Onboarding", () => {
  test("displays onboarding modal when user has not completed onboarding", async ({ page }) => {
    // Create user WITHOUT onboarding (no wildfire_device_id)
    const user = await createTestUser(page, `test-no-onboarding-${Date.now()}@example.com`, {
      onboardingComplete: false,
    });

    await authenticateTestUser(page, user.accessToken, user.refreshToken, user.userId, user.email);

    // Go to home page (search route now redirects to /)
    await page.goto("/");

    // Wait for onboarding modal to appear
    await expect(page.getByTestId("onboarding-modal")).toBeVisible();
  });
});

test.describe.skip("User Setup States - Wallet and Payout Configuration", () => {
  test("displays both wallet and currency setup prompts when neither is configured", async ({
    page,
  }) => {
    // Create user WITH onboarding but WITHOUT wallet/currency
    const user = await createTestUser(page, `test-incomplete-${Date.now()}@example.com`, {
      onboardingComplete: true,
      solanaAddress: undefined,
      payoutPartnerTokenId: undefined,
    });

    await authenticateTestUser(page, user.accessToken, user.refreshToken, user.userId, user.email);

    // Go to home page
    await page.goto("/");
    await expect(page.getByTestId("home-page").first()).toBeVisible();

    // Verify the incomplete setup banner is visible
    await expect(page.getByTestId("incomplete-setup-banner")).toBeVisible();

    // Verify both wallet and currency steps are incomplete (both clickable links)
    const banner = page.getByTestId("incomplete-setup-banner");
    await expect(banner.getByTestId("wallet-setup-incomplete")).toBeVisible();
    await expect(banner.getByTestId("currency-setup-incomplete")).toBeVisible();
  });

  test("displays currency setup prompt when wallet is configured but currency is not", async ({
    page,
  }) => {
    // Create user WITH onboarding and wallet but WITHOUT currency
    const user = await createTestUser(page, `test-wallet-only-${Date.now()}@example.com`, {
      onboardingComplete: true,
      solanaAddress: `SolanaTestAddr${Date.now()}`,
      payoutPartnerTokenId: undefined,
    });

    await authenticateTestUser(page, user.accessToken, user.refreshToken, user.userId, user.email);

    // Go to home page
    await page.goto("/");
    await expect(page.getByTestId("home-page").first()).toBeVisible();

    // Verify the incomplete setup banner is visible
    await expect(page.getByTestId("incomplete-setup-banner")).toBeVisible();

    // Verify wallet step shows as complete
    const banner = page.getByTestId("incomplete-setup-banner");
    await expect(banner.getByTestId("wallet-setup-completed")).toBeVisible();

    // Verify currency step is still incomplete (clickable link)
    await expect(banner.getByTestId("currency-setup-incomplete")).toBeVisible();
  });

  test("displays wallet setup prompt when currency is configured but wallet is not", async ({
    page,
  }) => {
    // Create user WITH onboarding and currency but WITHOUT wallet
    const user = await createTestUser(page, `test-currency-only-${Date.now()}@example.com`, {
      onboardingComplete: true,
      solanaAddress: undefined,
      payoutPartnerTokenId: "USDC",
    });

    await authenticateTestUser(page, user.accessToken, user.refreshToken, user.userId, user.email);

    // Go to home page
    await page.goto("/");
    await expect(page.getByTestId("home-page").first()).toBeVisible();

    // Verify the incomplete setup banner is visible
    await expect(page.getByTestId("incomplete-setup-banner")).toBeVisible();

    // Verify currency step shows as complete
    const banner = page.getByTestId("incomplete-setup-banner");
    await expect(banner.getByTestId("currency-setup-completed")).toBeVisible();

    // Verify wallet step is still incomplete (clickable link)
    await expect(banner.getByTestId("wallet-setup-incomplete")).toBeVisible();
  });

  test("allows viewing offer details but shows auth drawer on visit button click when setup is incomplete", async ({
    page,
  }) => {
    // Create user WITH onboarding but WITHOUT wallet/currency
    const user = await createTestUser(page, `test-incomplete-offer-${Date.now()}@example.com`, {
      onboardingComplete: true,
      solanaAddress: undefined,
      payoutPartnerTokenId: undefined,
    });

    await authenticateTestUser(page, user.accessToken, user.refreshToken, user.userId, user.email);

    // Go to home page
    await page.goto("/");
    await expect(page.getByTestId("home-page").first()).toBeVisible();

    // Click on first offer to open detail drawer
    const firstOffer = page.locator("[data-testid^='offer-card']").first();
    await expect(firstOffer).toBeVisible();
    await firstOffer.click();

    // Verify offer detail drawer opens (user can view details even with incomplete setup)
    await expect(page.getByTestId("offer-detail-drawer")).toBeVisible();

    // Click the visit button
    const visitButton = page.getByTestId("visit-offer-button");
    await expect(visitButton).toBeVisible();
    await visitButton.click();

    // Verify auth drawer appears prompting for setup completion
    await expect(page.getByTestId("auth-drawer")).toBeVisible();
  });

  test("generates valid affiliate tracking URL when setup is complete", async ({ page }) => {
    // Create user with complete profile: onboarding + wallet + currency
    const user = await createTestUser(page, `test-complete-${Date.now()}@example.com`, {
      onboardingComplete: true,
      solanaAddress: `SolanaTestAddr${Date.now()}`,
      payoutPartnerTokenId: "USDC",
    });

    await authenticateTestUser(page, user.accessToken, user.refreshToken, user.userId, user.email);

    // Go to home page
    await page.goto("/");
    await expect(page.getByTestId("home-page").first()).toBeVisible();

    // Find and click first offer
    const firstOffer = page.locator("[data-testid^='offer-card']").first();
    await expect(firstOffer).toBeVisible();
    await firstOffer.click();

    // Verify offer detail drawer opens
    await expect(page.getByTestId("offer-detail-drawer")).toBeVisible();

    // Verify visit button exists and has affiliate link
    const visitButton = page.getByTestId("visit-offer-button");
    await expect(visitButton).toBeVisible();

    // Check that the link has the expected /r/w format (proxied through our redirect)
    const affiliateLink = await visitButton.getAttribute("data-affiliate-link");
    expect(affiliateLink).toBeTruthy();
    expect(affiliateLink).toContain("/r/w?");
    expect(affiliateLink).toContain("c="); // trackingId parameter
    expect(affiliateLink).toContain("d="); // deviceId parameter
  });
});
