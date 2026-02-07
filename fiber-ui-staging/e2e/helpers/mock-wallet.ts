import { Page } from "@playwright/test";

/**
 * Configuration for mock wallet behavior
 */
export type MockWalletConfig = {
  /** Mock Solana public key address */
  publicKey?: string;
  /** Simulate connection failure */
  shouldFailConnect?: boolean;
};

/**
 * Generate a unique mock Solana wallet address for testing
 * Format: Base58-like string (44 characters, alphanumeric)
 */
function generateMockWalletAddress(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  const uniqueId = `${timestamp}${random}`.padEnd(44, "x");
  return `Mock${uniqueId.substring(0, 40)}`;
}

/**
 * Inject mock wallet address into browser window for E2E testing
 *
 * This is a simplified approach that doesn't mock the actual wallet adapter.
 * Instead, it sets a mock address in window that the test-only "Mock Connect" button uses.
 *
 * SAFETY: This only works in E2E tests because:
 * 1. The mock button only appears when port === "3010" (test server)
 * 2. Production uses the real wallet connection flow
 * 3. The mock address is only set via Playwright's page.evaluate
 *
 * @param page - Playwright page instance
 * @param config - Mock wallet configuration
 */
export async function injectMockWallet(page: Page, config: Partial<MockWalletConfig> = {}) {
  const mockAddress = config.publicKey || generateMockWalletAddress();
  const shouldFailConnect = config.shouldFailConnect || false;

  await page.evaluate(
    ({ address, shouldFail }) => {
      console.log("[MOCK WALLET] Setting mock wallet address:", address);
      (window as any).__MOCK_WALLET_ADDRESS__ = address;
      (window as any).__MOCK_WALLET_SHOULD_FAIL__ = shouldFail;
      (window as any).__MOCK_WALLET_CONNECTED__ = false;
    },
    { address: mockAddress, shouldFail: shouldFailConnect },
  );
}

/**
 * Helper to wait for mock wallet connection to complete
 * Checks if the success state was reached in the UI
 */
export async function waitForMockWalletConnection(page: Page, timeout = 5000) {
  console.log("[TEST] Waiting for mock wallet connection...");

  try {
    // Wait for the success status to appear
    await page.waitForSelector('[data-testid="wallet-connected-status"]', {
      timeout,
      state: "visible",
    });

    console.log("[TEST] Mock wallet connected successfully");
    return true;
  } catch (error) {
    console.error("[TEST] Mock wallet connection timeout");
    return false;
  }
}

/**
 * Helper to check if wallet is connected (for assertions)
 */
export async function isMockWalletConnected(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    return (window as any).__MOCK_WALLET_CONNECTED__ === true;
  });
}

/**
 * Helper to get mock wallet address (for assertions)
 */
export async function getMockWalletAddress(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    return (window as any).__MOCK_WALLET_ADDRESS__;
  });
}

/**
 * Complete wallet connection flow helper
 * Sets up mock wallet address for the test
 *
 * @param page - Playwright page
 * @param address - Optional custom wallet address (auto-generated if not provided)
 */
export async function connectMockWallet(page: Page, address?: string) {
  const walletAddress = address || generateMockWalletAddress();
  console.log("[TEST] Setting up mock wallet with address:", walletAddress);
  await injectMockWallet(page, { publicKey: walletAddress });
}

/**
 * Simulate wallet disconnection (not needed with current implementation)
 */
export async function disconnectMockWallet(page: Page) {
  console.log("[TEST] Mock wallet disconnect (no-op in current implementation)");
  // The actual disconnection is handled by clicking the UI button
}
