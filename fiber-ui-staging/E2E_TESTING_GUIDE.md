# E2E Testing Guide

## Quick Start

```bash
# Run all tests (recommended)
pnpm test:e2e

# Run with interactive UI
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e:headed

# Debug a failing test
pnpm test:e2e:debug
```

## Prerequisites

### One-time Setup

1. **Install Playwright browsers**

   ```bash
   pnpm exec playwright install chromium
   ```

2. **Verify Doppler configuration**

   ```bash
   doppler configure get
   # Should show: project: fiber-ui, config: staging_local
   ```

3. **Ensure environment variables are set**
   ```bash
   # These should return values (Doppler handles this automatically)
   doppler secrets get NEXT_PUBLIC_SUPABASE_URL --plain
   doppler secrets get SUPABASE_SECRET_KEY --plain
   ```

## Running Tests

### Basic Commands

```bash
# Run all tests (uses Doppler for env vars)
pnpm test:e2e

# Run with list reporter (shows each test name)
doppler run -- playwright test --reporter=list

# Run specific test file
doppler run -- playwright test e2e/navigation.spec.ts

# Run specific test by line number
doppler run -- playwright test e2e/navigation.spec.ts:11

# Run in UI mode (best for development)
pnpm test:e2e:ui

# Run in headed mode (see the browser)
pnpm test:e2e:headed

# Debug mode (pauses on actions)
pnpm test:e2e:debug
```

### Advanced Options

```bash
# Run tests sequentially (easier debugging)
doppler run -- playwright test --workers=1

# Run with trace recording
doppler run -- playwright test --trace=on

# Generate HTML report
doppler run -- playwright test --reporter=html
pnpm exec playwright show-report

# Run only tests matching a pattern
doppler run -- playwright test --grep="navigation"
```

## Test Data Management

### Automatic Cleanup ✅

- **Global setup** runs before all tests and cleans up test users
- Each test creates users with unique timestamps
- Test users are identified by:
  - Email starting with `test-`
  - Email containing `@example.com`
  - User metadata `test_user: true`

### What Gets Deleted

When cleanup runs, it deletes:

1. ✅ **User profiles** from `user_profiles` table
2. ✅ **Auth users** from `auth.users` table (via Supabase Admin API)
3. ✅ **Cascade deletes** any related data linked to user_id

**Note**: `commission_activity_summary` is a VIEW (read-only) and `commission_blockchain_transactions` doesn't have direct user references, so they rely on cascade deletes.

### Manual Cleanup

```bash
# Call cleanup endpoint directly
curl -X DELETE http://localhost:3010/api/test-users

# Or just run tests (global setup does cleanup)
pnpm test:e2e
```

### Verify Cleanup is Working

```bash
# Run tests and check cleanup logs
pnpm test:e2e 2>&1 | grep "🧹\|Cleaned"
# Should show: "🧹 Cleaned up X test users"
```

## Test Structure

### Helper Functions

All test helpers are in `e2e/helpers/auth.ts`:

```typescript
// Create test user (doesn't authenticate)
const user = await createTestUser(page, "test-user", {
  onboardingComplete: true,
  solanaAddress: "wallet123",
  payoutPartnerTokenId: true, // Auto-fetch BONK
});

// Authenticate existing user (set cookies)
await authenticateTestUser(page, user.accessToken, user.refreshToken);

// Create AND authenticate in one step (fast, no navigation)
const user = await createAuthenticatedUser(page, "test-user", {
  onboardingComplete: true,
});

// Legacy helper (navigates to "/" - slower)
await authenticateUser(page);

// Cleanup all test users
const deletedCount = await cleanupTestUsers(page);
```

### Email Generation

Test users are created with unique emails to avoid conflicts:

```typescript
// Pattern 1: Auto-generate from prefix
createTestUser(page, "test-user");
// → test-user-1763272075067@example.com

// Pattern 2: Use full email
createTestUser(page, "specific@example.com");
// → specific@example.com

// Pattern 3: Legacy with timestamp
await authenticateUser(page);
// → test-1763272075067-abc123@example.com
```

## Debugging Failed Tests

### View Test Results

```bash
# Open HTML report (automatically generated)
pnpm exec playwright show-report

# View screenshots/videos from failed tests
ls test-results/
open test-results/[test-name]/test-failed-1.png
```

### Debug Specific Test

```bash
# Run with debug mode (pauses on each step)
doppler run -- playwright test e2e/navigation.spec.ts --debug

# Run with full trace
doppler run -- playwright test --trace=on

# View trace file
pnpm exec playwright show-trace test-results/.../trace.zip
```

### Common Issues

#### "NEXT_PUBLIC_SUPABASE_URL not set"

**Cause**: Running tests without Doppler
**Fix**: Always use `doppler run --` or npm scripts

```bash
# ❌ Wrong - missing env vars
pnpm exec playwright test

# ✅ Correct - uses Doppler
pnpm test:e2e
```

#### "Port 3010 already in use"

**Cause**: Dev server already running
**Fix**: Kill existing process or use different port

```bash
# Kill process on port 3010
lsof -ti:3010 | xargs kill -9

# Or change port in playwright.config.ts
```

#### Tests fail randomly

**Cause**: Race conditions with parallel execution
**Fix**: Run sequentially

```bash
doppler run -- playwright test --workers=1
```

#### "Cookie name mismatch"

**Cause**: Using wrong Supabase project ref
**Fix**: Helper automatically handles this (uses `pqzdcscbwwapxsuygizi` for localhost)

## Configuration

### Playwright Config

Location: `playwright.config.ts`

Key settings:

- **Base URL**: http://localhost:3010
- **Workers**: 4 (parallel tests)
- **Timeout**: 30s per test
- **Global setup**: Runs cleanup before all tests
- **Retry**: 0 (fail fast)

### Test Files

```
e2e/
├── helpers/
│   └── auth.ts              # All test helpers
├── global-setup.ts          # Runs before all tests (cleanup)
├── auth.spec.ts             # Auth flow tests
├── navigation.spec.ts       # Page navigation tests
├── user-onboarding-states.spec.ts  # Onboarding tests
├── unauthenticated.spec.ts  # Unauthenticated user tests
└── hello-world.spec.ts      # Smoke test
```

## Best Practices

### ✅ Do

- Use `pnpm test:e2e` for consistent results
- Use `createAuthenticatedUser()` for faster tests
- Let tests navigate to where they need (don't pre-navigate in helpers)
- Use unique email prefixes for different test scenarios
- Run in UI mode when developing tests

### ❌ Don't

- Don't run tests without Doppler (`pnpm exec playwright test`)
- Don't manually delete test data (global setup handles it)
- Don't use `authenticateUser()` if you can use `createAuthenticatedUser()` (slower)
- Don't commit test screenshots/videos (in .gitignore)

## CI/CD Integration

Tests run in CI with:

```bash
doppler run -- playwright test --reporter=list
```

Same command works locally and in CI - no special configuration needed!

## Performance

Current test performance:

- **13 tests passing** in ~22s
- **Global cleanup** runs once (not per-suite)
- **Fast auth** using `createAuthenticatedUser()` (100ms vs 5s)
- **Parallel execution** with 4 workers

## Troubleshooting

### Check Doppler is working

```bash
doppler run -- env | grep SUPABASE
# Should show multiple SUPABASE_* variables
```

### Verify test database connection

```bash
# Run hello-world test (smoke test)
doppler run -- playwright test e2e/hello-world.spec.ts
```

### Check cleanup endpoint

```bash
# Start dev server
doppler run -- pnpm run dev

# In another terminal
curl -X DELETE http://localhost:3010/api/test-users
# Should return: {"deletedCount": X, "message": "..."}
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
- Project API endpoint: `/api/test-users` (POST to create, DELETE to cleanup)
