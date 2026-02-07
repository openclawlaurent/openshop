# e2e Testing Guide

Fast end-to-end tests using Playwright with Supabase auth bypass.

## Quick Start

```bash
# Run all e2e tests (headless)
pnpm run test:e2e

# Run with UI mode (interactive)
pnpm run test:e2e:ui

# Run in headed mode (see browser)
pnpm run test:e2e:headed
```

## How It Works

### Auth Bypass for Speed

Instead of going through the OTP flow (~5-10s per test), we:

1. Call `/api/test-auth` endpoint (test-only, blocked in production)
2. Get valid Supabase session tokens
3. Set auth cookies directly in Playwright
4. Tests run authenticated in ~50ms

### Architecture

```
e2e/
├── *.spec.ts         # Test files
├── helpers/
│   └── auth.ts       # Auth bypass utilities
└── README.md

app/api/test-auth/    # Test-only auth endpoint
playwright.config.ts  # Playwright configuration
```

## Writing Tests

### Basic Authenticated Test

```typescript
import { test, expect } from "@playwright/test";
import { authenticateUser } from "./helpers/auth";

test("my test", async ({ page }) => {
  // Authenticate with custom email
  await authenticateUser(page, "test@example.com");

  // Now you're logged in, test away!
  await page.goto("/profile");
  await expect(page.locator("h1")).toContainText("Profile");
});
```

### Using beforeEach for All Tests

```typescript
test.describe("My Feature", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateUser(page, "feature-test@example.com");
  });

  test("test 1", async ({ page }) => {
    // Already authenticated
  });

  test("test 2", async ({ page }) => {
    // Already authenticated
  });
});
```

### Testing Logout

```typescript
import { clearAuth } from "./helpers/auth";

test("logout flow", async ({ page }) => {
  await authenticateUser(page);
  await page.goto("/profile");

  // Clear authentication
  await clearAuth(page);

  // Test unauthenticated state
  await page.goto("/profile");
});
```

## Environment Setup

### Required Environment Variables

Set these in Doppler or `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-secret-key  # Service role key from Supabase Dashboard > Settings > API
```

### CI/CD Setup

#### PR-Based Tests (on push/PR)

GitHub Actions workflow automatically:

- Installs Playwright browsers
- Runs tests in parallel
- Uploads test reports on failure

See [.github/workflows/ci.yml](../.github/workflows/ci.yml)

#### Scheduled Staging Tests (hourly)

Automated tests run against deployed staging environment every hour:

- Tests against live staging URL
- Uses staging database
- Creates GitHub issues on failure
- Publishes reports to GitHub Pages

See [.github/E2E_STAGING_SETUP.md](../.github/E2E_STAGING_SETUP.md) for setup guide.

Required secrets:

- `DOPPLER_TOKEN` (for PR tests - runs local dev server)

No secrets needed for staging tests - URLs are hardcoded in the workflow file.

## Security

The `/api/test-auth` endpoint:

- ✅ Only works in `NODE_ENV !== 'production'`
- ✅ Blocked automatically in production builds
- ✅ Creates isolated test users (marked with `test_user: true` metadata)
- ✅ Uses secret key (never exposed to client)

## Best Practices

1. **Use unique emails per test** to avoid conflicts:

   ```typescript
   await authenticateUser(page, `test-${Date.now()}@example.com`);
   ```

2. **Keep tests independent** - each test should work in isolation

3. **Use data-testid for selectors** when possible:

   ```typescript
   await page.getByTestId("submit-button").click();
   ```

4. **Parallelize tests** - Playwright runs tests in parallel by default

5. **Clean up test data** if needed (or use unique IDs per test run)

## Troubleshooting

### Tests failing with auth errors?

Check that:

1. `SUPABASE_SECRET_KEY` is set correctly (service role key from Supabase Dashboard > Settings > API)
2. Dev server is running on `localhost:3000`
3. Supabase project is accessible

### Tests running slowly?

- Auth bypass should be ~50ms per test
- If slower, check network/Supabase latency
- Consider using local Supabase for even faster tests

### Need to test actual OTP flow?

For critical auth flow tests, you can:

1. Use local Supabase with Inbucket
2. Fetch OTP from `http://localhost:54324` (Inbucket API)
3. Keep these tests separate from fast feature tests
