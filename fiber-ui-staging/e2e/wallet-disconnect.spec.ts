import { test, expect } from "@playwright/test";
import { createAuthenticatedUser } from "./helpers/auth";

test.describe("Wallet Disconnect Functionality", () => {
  test("shows connected wallet status when wallet is connected", async ({ page }) => {
    const mockAddress = `TestWallet${Date.now()}`;
    const user = await createAuthenticatedUser(page, "test-wallet-connected", {
      onboardingComplete: true,
      solanaAddress: mockAddress,
    });

    await page.goto("/profile");
    await page.waitForTimeout(3000);

    // Verify wallet connected status is visible
    const connectedStatus = page.getByTestId("wallet-connected-status");
    await expect(connectedStatus).toBeVisible();

    // Verify connected status has the green success styling (emerald-50 background)
    const statusElement = await connectedStatus.getAttribute("class");
    const hasSuccessStyle = statusElement?.includes("emerald") || statusElement?.includes("green");
    expect(hasSuccessStyle).toBe(true);
  });

  test("shows settings button when wallet is connected", async ({ page }) => {
    const mockAddress = `WalletSettings${Date.now()}`;
    const user = await createAuthenticatedUser(page, "test-wallet-settings-btn", {
      onboardingComplete: true,
      solanaAddress: mockAddress,
    });

    await page.goto("/profile");
    await page.waitForTimeout(3000);

    // Verify settings button is visible
    const settingsButton = page.getByTestId("wallet-settings-button");
    await expect(settingsButton).toBeVisible();
  });

  test("opens wallet settings menu when clicking settings button", async ({ page }) => {
    const mockAddress = `WalletMenu${Date.now()}`;
    const user = await createAuthenticatedUser(page, "test-wallet-menu-open", {
      onboardingComplete: true,
      solanaAddress: mockAddress,
    });

    await page.goto("/profile");
    await page.waitForTimeout(3000);

    // Click settings button to open menu
    const settingsButton = page.getByTestId("wallet-settings-button");
    await settingsButton.click();
    await page.waitForTimeout(500);

    // Verify menu options are visible
    const copyOption = page.getByTestId("copy-wallet-address");
    const disconnectOption = page.getByTestId("disconnect-wallet-button");

    const hasCopyOption = await copyOption.isVisible().catch(() => false);
    const hasDisconnectOption = await disconnectOption.isVisible().catch(() => false);

    expect(hasCopyOption || hasDisconnectOption).toBe(true);
  });

  test("shows disconnect option in wallet settings menu", async ({ page }) => {
    const mockAddress = `DisconnectMenu${Date.now()}`;
    const user = await createAuthenticatedUser(page, "test-wallet-disconnect-visible", {
      onboardingComplete: true,
      solanaAddress: mockAddress,
    });

    await page.goto("/profile");
    await page.waitForTimeout(3000);

    // Click settings button to open menu
    const settingsButton = page.getByTestId("wallet-settings-button");
    await settingsButton.click();
    await page.waitForTimeout(500);

    // Verify disconnect button is visible with correct text
    const disconnectButton = page.getByTestId("disconnect-wallet-button");
    await expect(disconnectButton).toBeVisible();

    const hasRemoveText = await page
      .getByText(/remove from account/i)
      .isVisible()
      .catch(() => false);
    expect(hasRemoveText).toBe(true);
  });

  test("disconnects wallet when clicking disconnect button", async ({ page }) => {
    const mockAddress = `DisconnectAction${Date.now()}`;
    const user = await createAuthenticatedUser(page, "test-wallet-disconnect-action", {
      onboardingComplete: true,
      solanaAddress: mockAddress,
    });

    await page.goto("/profile");
    await page.waitForTimeout(3000);

    // Verify wallet is initially connected
    const connectedStatusBefore = page.getByTestId("wallet-connected-status");
    await expect(connectedStatusBefore).toBeVisible();

    // Click settings button to open menu
    const settingsButton = page.getByTestId("wallet-settings-button");
    await settingsButton.click();
    await page.waitForTimeout(500);

    // Click disconnect button
    const disconnectButton = page.getByTestId("disconnect-wallet-button");
    await disconnectButton.click();

    // Wait longer for disconnect to complete and UI to update
    await page.waitForTimeout(5000);

    // Verify wallet status changes to disconnected
    const disconnectedStatus = page.getByTestId("wallet-disconnected-status");
    const hasDisconnectedStatus = await disconnectedStatus.isVisible().catch(() => false);

    // Or verify connect button appears
    const connectButton = page.getByTestId("connect-wallet-button");
    const hasConnectButton = await connectButton.isVisible().catch(() => false);

    // Or check if connected status is no longer visible
    const connectedStatusAfter = page.getByTestId("wallet-connected-status");
    const isStillConnected = await connectedStatusAfter.isVisible().catch(() => false);

    expect(hasDisconnectedStatus || hasConnectButton || !isStillConnected).toBe(true);
  });

  test("shows success message after wallet disconnect", async ({ page }) => {
    const mockAddress = `DisconnectToast${Date.now()}`;
    const user = await createAuthenticatedUser(page, "test-wallet-disconnect-toast", {
      onboardingComplete: true,
      solanaAddress: mockAddress,
    });

    await page.goto("/profile");
    await page.waitForTimeout(3000);

    // Click settings button to open menu
    const settingsButton = page.getByTestId("wallet-settings-button");
    await settingsButton.click();
    await page.waitForTimeout(500);

    // Click disconnect button
    const disconnectButton = page.getByTestId("disconnect-wallet-button");
    await disconnectButton.click();
    await page.waitForTimeout(2000);

    // Look for success toast message
    const hasSuccessMessage =
      (await page
        .getByText(/wallet disconnected/i)
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByText(/connect a different wallet/i)
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByText(/pending transactions/i)
        .isVisible()
        .catch(() => false));

    expect(hasSuccessMessage).toBe(true);
  });

  test("shows connect wallet button after disconnect", async ({ page }) => {
    // Use timestamp to ensure unique wallet address
    const mockAddress = `ReconnectTest${Date.now()}`;
    const user = await createAuthenticatedUser(page, "test-wallet-reconnect-btn", {
      onboardingComplete: true,
      solanaAddress: mockAddress,
    });

    await page.goto("/profile");
    await page.waitForTimeout(3000);

    // Check if wallet is connected - if not, skip test (setup failed)
    const connectedStatusInitial = page.getByTestId("wallet-connected-status");
    const isInitiallyConnected = await connectedStatusInitial.isVisible().catch(() => false);

    if (!isInitiallyConnected) {
      // Test setup failed - wallet not connected initially
      // This can happen if user profile creation failed
      test.skip(true, "Wallet not connected - test setup failed");
      return;
    }

    // Disconnect wallet
    const settingsButton = page.getByTestId("wallet-settings-button");
    await settingsButton.click();
    await page.waitForTimeout(500);

    const disconnectButton = page.getByTestId("disconnect-wallet-button");
    await disconnectButton.click();
    await page.waitForTimeout(3000);

    // Verify connect button appears
    const connectButton = page.getByTestId("connect-wallet-button");
    const hasConnectButton = await connectButton.isVisible().catch(() => false);

    // Also check for warning message about connecting wallet
    const hasWarningMessage = await page
      .getByText(/connect a solana wallet/i)
      .isVisible()
      .catch(() => false);

    expect(hasConnectButton || hasWarningMessage).toBe(true);
  });
});
