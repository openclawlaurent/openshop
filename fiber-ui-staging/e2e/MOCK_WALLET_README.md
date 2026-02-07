# Mock Wallet for E2E Testing

## Overview

This mock wallet system allows E2E tests to simulate Solana wallet connections (Phantom, Solflare) without requiring actual browser extensions or real cryptocurrency signatures.

## Safety Guarantees

### ✅ **The mock wallet ONLY works in E2E tests - it will NEVER run in production**

**Why it's safe:**

1. **Playwright-Only Injection**
   - The mock is injected via Playwright's `page.addInitScript()`
   - This API **only exists** in Playwright test contexts
   - Production browsers don't have this API, so the injection code never runs

2. **Test Browser Isolation**
   - E2E tests run in isolated Playwright browser instances
   - These are completely separate from your production environment
   - Port 3010 is only used for local test server (configured in `playwright.config.ts`)

3. **No Production Code Changes**
   - The mock doesn't modify any application code
   - It only injects into the test browser's `window` object
   - Your app code remains unchanged and works normally in production

4. **Environment Separation**
   - Production uses real Reown AppKit with real wallet extensions
   - Tests use mock injected before page loads
   - No environment variables or flags needed to toggle the mock

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Playwright Test                         │
│                                                             │
│  1. page.addInitScript() ──> Injects mock into browser     │
│                                                             │
│  2. Test navigates to app ──> Mock is already loaded       │
│                                                             │
│  3. App calls useWalletV4() ──> Uses mock provider         │
│                                                             │
│  4. Mock simulates connect/sign ──> No real wallet needed  │
└─────────────────────────────────────────────────────────────┘
```

### Mock Injection Flow

1. **Test Setup** (`e2e/wallet-connection.spec.ts`)

   ```typescript
   await injectMockWallet(page, { publicKey: "MockAddress123" });
   ```

2. **Mock Injection** (`e2e/helpers/mock-wallet.ts`)
   - Playwright's `addInitScript` runs **before** the page loads
   - Injects mock wallet provider into `window.__MOCK_WALLET_PROVIDER__`
   - Intercepts Reown AppKit's `open()` method
   - Auto-connects mock wallet when user clicks "Connect Wallet"

3. **App Interaction** (your app code - unchanged)

   ```typescript
   // lib/hooks/use-wallet-v4.ts
   const { connect, signMessage } = useWalletV4();

   // When user clicks connect button:
   await connect(); // Mock auto-connects without wallet popup

   // When app requests signature:
   await signMessage(message); // Mock auto-signs without user approval
   ```

4. **Backend Verification** (`app/api/wallet/verify/route.ts`)
   - Backend receives mock signature
   - Stores it in `solana_metadata.signature`
   - **Does NOT** perform cryptographic verification (your current code)
   - Sets `is_solana_wallet_connected = true`

### What Gets Mocked

| Real Wallet Behavior                 | Mock Behavior                                  |
| ------------------------------------ | ---------------------------------------------- |
| User clicks "Connect Wallet"         | Test clicks button                             |
| Reown modal opens                    | Mock intercepts, auto-connects (no modal)      |
| User selects Phantom                 | Mock simulates Phantom selection               |
| Phantom extension prompts approval   | Mock auto-approves (configurable delay)        |
| User approves connection             | Mock resolves with public key                  |
| App requests signature               | Mock generates deterministic fake signature    |
| Phantom prompts signature approval   | Mock auto-signs (configurable delay)           |
| Cryptographic signature verification | **Skipped** (backend doesn't verify currently) |

## Usage

### Basic Wallet Connection Test

```typescript
import { test, expect } from "@playwright/test";
import { createAuthenticatedUser } from "./helpers/auth";
import { injectMockWallet, waitForMockWalletConnection } from "./helpers/mock-wallet";

test("connects wallet successfully", async ({ page }) => {
  // 1. Create authenticated user
  const user = await createAuthenticatedUser(page, "test-wallet");

  // 2. Inject mock wallet BEFORE navigating
  await injectMockWallet(page, { publicKey: "MockAddress123" });

  // 3. Navigate to page
  await page.goto("/profile");

  // 4. Click connect button (your app's UI)
  await page.click('[data-testid="connect-wallet-button"]');

  // 5. Wait for mock connection
  await waitForMockWalletConnection(page);

  // 6. Verify wallet is connected
  await expect(page.getByTestId("wallet-connected-status")).toBeVisible();
  await expect(page.getByText("MockAddress123")).toBeVisible();
});
```

### Testing Error States

```typescript
// Simulate connection rejection
await injectMockWallet(page, { shouldFailConnect: true });

// Simulate signature rejection
await injectMockWallet(page, { shouldFailSign: true });

// Custom wallet name
await injectMockWallet(page, { walletName: "Solflare (Test)" });

// Custom delays (simulate slow network)
await injectMockWallet(page, { delay: 2000 }); // 2 second delay
```

### Available Helpers

| Helper                              | Purpose                                  |
| ----------------------------------- | ---------------------------------------- |
| `injectMockWallet(page, config)`    | Inject mock before navigating            |
| `waitForMockWalletConnection(page)` | Wait for connection to complete          |
| `isMockWalletConnected(page)`       | Check if mock wallet is connected (bool) |
| `getMockWalletAddress(page)`        | Get current mock wallet address (string) |
| `connectMockWallet(page, address)`  | Inject + setup (convenience wrapper)     |
| `disconnectMockWallet(page)`        | Trigger disconnect                       |

## Configuration Options

```typescript
type MockWalletConfig = {
  publicKey?: string; // Default: "MockSolanaAddress123..."
  walletName?: string; // Default: "Phantom (Test)"
  shouldFailConnect?: boolean; // Default: false
  shouldFailSign?: boolean; // Default: false
  delay?: number; // Default: 100ms
};
```

## Debugging

### Enable Console Logs

The mock wallet logs all actions with `[MOCK WALLET]` prefix:

```
[MOCK WALLET] Injecting mock wallet adapter for E2E testing
[MOCK WALLET] AppKit.open() intercepted, auto-connecting mock wallet
[MOCK WALLET] connect() called
[MOCK WALLET] Connected with public key: MockAddress123
[MOCK WALLET] signMessage() called with message length: 64
[MOCK WALLET] Signature created
```

### Check Mock State in Browser DevTools

```typescript
// In Playwright console or browser:
await page.evaluate(() => {
  console.log("Connected:", window.__MOCK_WALLET_CONNECTED__);
  console.log("Address:", window.__MOCK_WALLET_ADDRESS__);
  console.log("Provider:", window.__MOCK_WALLET_PROVIDER__);
});
```

### Run Test in Headed Mode

```bash
pnpm test:e2e:headed e2e/wallet-connection.spec.ts
```

## Limitations

### What the Mock Does NOT Test

1. **Real Wallet Extensions**
   - Phantom/Solflare extension behavior
   - Extension popup UI
   - Extension permissions

2. **Cryptographic Verification**
   - Signature validity
   - Public key ownership
   - Message signing correctness

3. **Network Interactions**
   - Solana RPC calls
   - On-chain transactions
   - Wallet provider network requests

4. **User Experience**
   - Actual wallet connection UX
   - Mobile wallet deep linking to real wallet apps
   - Hardware wallet flows (Ledger, Trezor)

### What the Mock DOES Test

1. **App Logic**
   - Wallet connection state management
   - `is_solana_wallet_connected` flag updates
   - Wallet address storage
   - Disconnect/remove wallet flows

2. **UI Behavior**
   - Connect button shows/hides correctly
   - Wallet address displays correctly
   - Error messages appear on failures
   - Connected/disconnected status badges

3. **Backend Integration**
   - `/api/wallet/verify` endpoint receives data
   - Database updates (`solana_address`, `is_solana_wallet_connected`)
   - Error handling for duplicate addresses

## Backend Signature Verification

### Current Behavior (No Verification)

Your current backend (`app/api/wallet/verify/route.ts`) **does not** verify Solana signatures cryptographically. It simply:

1. Receives `walletAddress` and `signature`
2. Stores them in `user_profiles` table
3. Sets `is_solana_wallet_connected = true`

This is **perfect for E2E testing** because the mock signature works without modification.

### If You Add Real Signature Verification

If you later add cryptographic signature verification (using `@solana/web3.js`), you'll need to:

**Option 1: Test Mode Flag**

```typescript
// app/api/wallet/verify/route.ts
const isTestMode = process.env.NODE_ENV === "test" || request.headers.get("X-Test-Mode") === "true";

if (!isTestMode) {
  // Real signature verification
  const isValid = await verifySignature(walletAddress, signature, message);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
}
```

**Option 2: Mock Signature Endpoint**

```typescript
// app/api/test/wallet/verify/route.ts (E2E only)
export async function POST(request: NextRequest) {
  // Skip signature verification for tests
  // Same logic as real endpoint but no crypto verification
}
```

## Manual Testing

The mock wallet **only works in E2E tests**. For manual testing, you must use:

- **Local development**: Real Phantom/Solflare extension
- **Staging**: Real Phantom/Solflare extension
- **Production**: Real Phantom/Solflare extension

The mock will **never** interfere with manual testing because `page.addInitScript()` only exists in Playwright.

## Security Considerations

### ✅ Safe

- Mock only runs in isolated test browsers
- No production code modified
- No environment variables to accidentally leak
- Playwright API not available in production browsers

### ⚠️ Important

- **Never** commit real private keys to test files
- **Never** use real wallet addresses in tests (use mock addresses)
- **Never** connect tests to mainnet Solana (use mock or devnet)

## Troubleshooting

### Mock not working?

1. **Check injection timing**

   ```typescript
   // ✅ Correct: Inject BEFORE navigation
   await injectMockWallet(page, { publicKey: "MockAddress" });
   await page.goto("/profile");

   // ❌ Wrong: Inject AFTER navigation
   await page.goto("/profile");
   await injectMockWallet(page, { publicKey: "MockAddress" });
   ```

2. **Check test data-testid attributes**
   - Ensure your UI has `data-testid="connect-wallet-button"`, etc.
   - Update selectors in tests to match your actual UI

3. **Check console logs**
   - Look for `[MOCK WALLET]` logs
   - Check for errors in test output

### Tests timing out?

- Increase `waitForMockWalletConnection` timeout
- Add `page.waitForTimeout()` after connection
- Check that your app's wallet state updates correctly

### Backend errors?

- Verify user is authenticated before connecting wallet
- Check that `user_profiles` table exists
- Verify no unique constraint violations (duplicate wallet addresses)

## Future Enhancements

Potential improvements for more comprehensive testing:

1. **Transaction Mocking**
   - Mock `signTransaction()` for future transaction tests
   - Mock Solana RPC responses

2. **Multi-Wallet Testing**
   - Test switching between Phantom/Solflare
   - Test multiple wallet addresses

3. **Hardware Wallet Simulation**
   - Mock Ledger/Trezor adapters
   - Test hardware wallet flows

4. **Network Error Simulation**
   - Mock network timeouts
   - Test offline scenarios

## Resources

- [Playwright addInitScript](https://playwright.dev/docs/api/class-page#page-add-init-script)
- [Reown AppKit Docs](https://docs.reown.com/appkit/overview)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [E2E Testing Guide](./E2E_TESTING_GUIDE.md)

---

**Remember**: The mock wallet is a testing tool, not a replacement for real wallet testing. Always manually test with real Phantom/Solflare extensions before deploying to production.
