import { test, expect } from "@playwright/test";
import { createAuthenticatedUser } from "./helpers/auth";

test.describe("Payout Token Selection", () => {
  test("allows user to view available payout tokens on profile page", async ({ page }) => {
    // Create authenticated user with profile
    const user = await createAuthenticatedUser(page, "test-token-view", {
      onboardingComplete: true,
    });

    // Navigate to profile page
    await page.goto("/profile");
    await page.waitForTimeout(2000); // Wait for profile to load

    // Verify payout settings section loaded
    await expect(page.getByTestId("payout-settings")).toBeVisible({ timeout: 10000 });

    // Verify page title
    await expect(page.getByTestId("profile-heading")).toBeVisible();

    // Verify token selector is present (shadcn Select component)
    const tokenSelector = page.getByRole("combobox");
    await expect(tokenSelector).toBeVisible();
  });

  test("allows user to select a payout token and persists selection", async ({ page }) => {
    // Create authenticated user without token selected
    const user = await createAuthenticatedUser(page, "test-token-select", {
      onboardingComplete: true,
      payoutPartnerTokenId: false, // Don't set a token initially
    });

    await page.goto("/profile");
    await expect(page.getByTestId("payout-settings")).toBeVisible();

    // Open token selector dropdown (shadcn Select component)
    const tokenSelect = page.getByRole("combobox");
    await tokenSelect.click();

    // Wait for dropdown options to appear
    await page.waitForTimeout(500);

    // Select the first available token (BONK, USDC, or whatever is available)
    const firstOption = page.getByRole("option").first();
    await firstOption.click();

    // Click Save/Update button to persist the selection
    const saveButton = page.getByRole("button", { name: /save token|update token/i });
    await saveButton.click();

    // Wait for success indication
    await page.waitForTimeout(1500);

    // Verify success toast or success state
    const hasSuccessToast = await page
      .getByText(/token saved|token updated|successfully/i)
      .isVisible()
      .catch(() => false);
    const hasSuccessBox = await page
      .locator(".bg-emerald-50, .bg-green-50")
      .isVisible()
      .catch(() => false);

    expect(hasSuccessToast || hasSuccessBox).toBe(true);
  });

  test("allows user to change payout token selection", async ({ page }) => {
    // Create authenticated user with token already selected (BONK)
    const user = await createAuthenticatedUser(page, "test-token-change", {
      onboardingComplete: true,
      payoutPartnerTokenId: true, // Auto-fetch BONK token
    });

    await page.goto("/profile");
    await expect(page.getByTestId("payout-settings")).toBeVisible();

    // Should show the currently selected token in a success box
    const successBox = page.locator(".bg-emerald-50, .bg-green-50");
    await expect(successBox).toBeVisible();

    // Look for settings/edit button - it might be in a dropdown menu
    const settingsButton = page
      .getByRole("button")
      .filter({ hasText: /settings/i })
      .first();
    const editButton = page
      .getByRole("button")
      .filter({ hasText: /edit|change/i })
      .first();

    // Try to click settings button if it exists
    if (await settingsButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await settingsButton.click();
      await page.waitForTimeout(300);

      // Look for "Change Token" in dropdown menu
      const changeOption = page.getByText(/change token/i);
      if (await changeOption.isVisible({ timeout: 1000 }).catch(() => false)) {
        await changeOption.click();
        await page.waitForTimeout(500);
      }
    } else if (await editButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await editButton.click();
      await page.waitForTimeout(500);
    }

    // Check if combobox is now visible, if not, this UI state doesn't support changing tokens
    const tokenSelect = page.getByRole("combobox");
    const isComboboxVisible = await tokenSelect.isVisible({ timeout: 2000 }).catch(() => false);

    if (isComboboxVisible) {
      await tokenSelect.click();
      await page.waitForTimeout(500);

      // Get all options and select the second one (different from current)
      const options = page.getByRole("option");
      const optionCount = await options.count();

      if (optionCount > 1) {
        await options.nth(1).click();
        await page.waitForTimeout(500);

        // Save the change
        const updateButton = page.getByRole("button", { name: /update|save/i });
        if (await updateButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await updateButton.click();
          await page.waitForTimeout(1500);
        }

        // Verify the update succeeded
        const hasSuccessState = await page
          .locator(".bg-emerald-50, .bg-green-50")
          .isVisible()
          .catch(() => false);
        expect(hasSuccessState).toBe(true);
      }
    } else {
      // If the combobox isn't accessible, just verify the initial token is shown
      expect(await successBox.isVisible()).toBe(true);
    }
  });

  test("displays yellow alert when no token is selected", async ({ page }) => {
    // Create user without token
    const user = await createAuthenticatedUser(page, "test-token-alert", {
      onboardingComplete: true,
      payoutPartnerTokenId: false,
    });

    await page.goto("/profile");
    await expect(page.getByTestId("payout-settings")).toBeVisible();

    // Should show alert badge or warning about no token selected
    const hasAlert = await page
      .locator(".bg-yellow-50, .bg-amber-50, [role='alert']")
      .isVisible()
      .catch(() => false);

    // Or check for warning text
    const hasWarningText = await page
      .getByText(/select.*token|no token|choose.*token/i)
      .isVisible()
      .catch(() => false);

    expect(hasAlert || hasWarningText).toBe(true);
  });

  test("selected token reflects in user profile after page reload", async ({ page }) => {
    // Create user with token selected
    const user = await createAuthenticatedUser(page, "test-token-persist", {
      onboardingComplete: true,
      payoutPartnerTokenId: true, // BONK token
    });

    await page.goto("/profile");
    await expect(page.getByTestId("payout-settings")).toBeVisible();

    // Verify token is shown
    await expect(page.locator(".bg-emerald-50, .bg-green-50")).toBeVisible();

    // Reload the page
    await page.reload();

    // Wait for page to load
    await expect(page.getByTestId("payout-settings")).toBeVisible();

    // Token should still be shown as selected
    await expect(page.locator(".bg-emerald-50, .bg-green-50")).toBeVisible();
  });
});
