import { test, expect } from "@playwright/test";
import { createAuthenticatedUser } from "./helpers/auth";
import { connectMockWallet, waitForMockWalletConnection } from "./helpers/mock-wallet";

test.describe("Complete Onboarding Flow", () => {
  test("displays onboarding modal for new users", async ({ page }) => {
    // Create user WITHOUT onboarding completed
    const user = await createAuthenticatedUser(page, "test-onboarding-view", {
      onboardingComplete: false,
    });

    await page.goto("/");

    // Wait longer for profile context to load and trigger onboarding modal
    // The modal only appears after profile loads with is_onboarding_completed === false
    await page.waitForTimeout(3000);

    // Verify onboarding modal appears
    await expect(page.getByTestId("onboarding-modal")).toBeVisible({ timeout: 5000 });

    // Verify it's on step 1 (Welcome)
    await expect(page.getByRole("heading", { name: "Welcome to Fiber" })).toBeVisible();
    await expect(page.getByText("Step 1 of 4")).toBeVisible();
  });

  test("navigates through all 4 steps sequentially", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-onboarding-steps", {
      onboardingComplete: false,
    });

    await page.goto("/");
    await page.waitForTimeout(3000);

    await expect(page.getByTestId("onboarding-modal")).toBeVisible({ timeout: 5000 });

    // Step 1: Welcome
    await expect(page.getByRole("heading", { name: "Welcome to Fiber" })).toBeVisible();
    await expect(page.getByText("Step 1 of 4")).toBeVisible();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.waitForTimeout(500);

    // Step 2: How It Works
    await expect(page.getByText("How It Works")).toBeVisible();
    await expect(page.getByText("Step 2 of 4")).toBeVisible();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.waitForTimeout(500);

    // Step 3: In Action
    await expect(page.getByText("Fiber in Action")).toBeVisible();
    await expect(page.getByText("Step 3 of 4")).toBeVisible();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.waitForTimeout(500);

    // Step 4: Start Earning (setup step)
    await expect(
      page.getByTestId("onboarding-modal").getByRole("heading", { name: "Start Earning" }),
    ).toBeVisible();
    await expect(page.getByText("Step 4 of 4")).toBeVisible();

    // Final step should show "Start Earning" button instead of "Continue"
    await expect(page.getByRole("button", { name: /start earning/i })).toBeVisible();
  });

  test.skip("allows user to skip onboarding from any step", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-onboarding-skip", {
      onboardingComplete: false,
    });

    await page.goto("/");
    await page.waitForTimeout(3000);

    await expect(page.getByTestId("onboarding-modal")).toBeVisible();

    // Click skip button (should be present on all steps)
    const skipButton = page.getByRole("button", { name: /skip/i });
    await expect(skipButton).toBeVisible();
    await skipButton.click();

    // Wait for modal to be hidden (up to 10 seconds)
    await expect(page.getByTestId("onboarding-modal")).toBeHidden({ timeout: 10000 });
  });

  test("displays token selection in Step 4 (Start Earning)", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-onboarding-token", {
      onboardingComplete: false,
    });

    await page.goto("/");
    await page.waitForTimeout(3000);

    await expect(page.getByTestId("onboarding-modal")).toBeVisible();

    // Navigate to Step 4
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: /continue/i }).click();
      await page.waitForTimeout(500);
    }

    // Should be on Step 4
    await expect(
      page.getByTestId("onboarding-modal").getByRole("heading", { name: "Start Earning" }),
    ).toBeVisible();

    // Should show token selector (shadcn Select component) - use aria-label to disambiguate
    const tokenSelect = page.getByRole("combobox", { name: /choose.*token/i });
    await expect(tokenSelect).toBeVisible();
  });

  test("allows user to select token in Step 4", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-onboarding-token-select", {
      onboardingComplete: false,
    });

    await page.goto("/");
    await page.waitForTimeout(3000);

    // Navigate to Step 4
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: /continue/i }).click();
      await page.waitForTimeout(500);
    }

    await expect(
      page.getByTestId("onboarding-modal").getByRole("heading", { name: "Start Earning" }),
    ).toBeVisible();

    // Click token selector to open dropdown (shadcn Select component) - use aria-label
    await page.getByRole("combobox", { name: /choose.*token/i }).click();
    await page.waitForTimeout(500);

    // Select first available token
    const firstOption = page.getByRole("option").first();
    await firstOption.click();
    await page.waitForTimeout(1500);

    // Should show success message or saved state
    const hasSuccessToast = await page
      .getByText(/token saved|saved successfully/i)
      .isVisible()
      .catch(() => false);

    expect(hasSuccessToast).toBe(true);
  });

  test("shows wallet connection option in Step 4", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-onboarding-wallet", {
      onboardingComplete: false,
    });

    await page.goto("/");
    await page.waitForTimeout(3000);

    // Navigate to Step 4
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: /continue/i }).click();
      await page.waitForTimeout(500);
    }

    await expect(
      page.getByTestId("onboarding-modal").getByRole("heading", { name: "Start Earning" }),
    ).toBeVisible();

    // Should show wallet connection UI - check for various possible elements
    const hasConnectWalletText = await page
      .getByText(/wallet/i)
      .first()
      .isVisible()
      .catch(() => false);

    const hasMockConnectButton = await page
      .getByTestId("mock-connect-wallet-button")
      .isVisible()
      .catch(() => false);

    const hasWalletButton = await page
      .getByRole("button")
      .filter({ hasText: /wallet/i })
      .first()
      .isVisible()
      .catch(() => false);

    // At least one wallet-related element should be visible in Step 4
    expect(hasConnectWalletText || hasMockConnectButton || hasWalletButton).toBe(true);
  });

  test("completes onboarding with token and wallet setup", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-onboarding-complete", {
      onboardingComplete: false,
    });

    await page.goto("/");
    await page.waitForTimeout(3000);

    // Navigate to Step 4
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: /continue/i }).click();
      await page.waitForTimeout(500);
    }

    // Select token - use aria-label to find the right combobox
    await page.getByRole("combobox", { name: /choose.*token/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole("option").first().click();
    await page.waitForTimeout(1500);

    // Inject mock wallet BEFORE navigating (to ensure it's available)
    await connectMockWallet(page);
    await page.waitForTimeout(500);

    // Connect wallet (if mock button is visible)
    const hasMockButton = await page
      .getByTestId("mock-connect-wallet-button")
      .isVisible()
      .catch(() => false);

    if (hasMockButton) {
      await page.click('[data-testid="mock-connect-wallet-button"]');
      await waitForMockWalletConnection(page, 10000);
      await page.waitForTimeout(1500);
    }

    // Click "Start Earning" to complete onboarding
    await page.getByRole("button", { name: /start earning/i }).click();
    await page.waitForTimeout(1500);

    // Modal should be closed after completion
    const modalVisible = await page
      .getByTestId("onboarding-modal")
      .isVisible()
      .catch(() => false);
    expect(modalVisible).toBe(false);
  });

  test("does not show onboarding modal for users with completed onboarding", async ({ page }) => {
    // Create user WITH onboarding completed
    const user = await createAuthenticatedUser(page, "test-onboarding-completed", {
      onboardingComplete: true,
    });

    await page.goto("/");

    // Wait for profile to load, modal should NOT appear for completed users
    await page.waitForTimeout(3000);

    // Modal should NOT appear
    const modalVisible = await page
      .getByTestId("onboarding-modal")
      .isVisible()
      .catch(() => false);
    expect(modalVisible).toBe(false);

    // Should see home page content instead (check for navigation or profile elements)
    const hasNavigation = await page
      .getByText(/search|earnings|profile/i)
      .isVisible()
      .catch(() => false);
    const hasOfferCards = await page
      .locator('[data-testid^="offer-card-"]')
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasNavigation || hasOfferCards).toBe(true);
  });

  test("progress indicators update correctly as user navigates", async ({ page }) => {
    const user = await createAuthenticatedUser(page, "test-onboarding-progress", {
      onboardingComplete: false,
    });

    await page.goto("/");
    await page.waitForTimeout(3000);

    // Step 1
    await expect(page.getByText("Step 1 of 4")).toBeVisible();

    // Navigate to Step 2
    await page.getByRole("button", { name: /continue/i }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText("Step 2 of 4")).toBeVisible();

    // Navigate to Step 3
    await page.getByRole("button", { name: /continue/i }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText("Step 3 of 4")).toBeVisible();

    // Navigate to Step 4
    await page.getByRole("button", { name: /continue/i }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText("Step 4 of 4")).toBeVisible();
  });
});
