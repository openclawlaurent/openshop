# E2E Test Reliability Analysis & Recommendations

## Executive Summary

**Current Status:**

- **CI**: 57 test failures out of ~65 tests (~88% failure rate)
- **Local**: 8 test failures (~12% failure rate)

**Root Causes Identified:**

1. Missing environment variables in CI (`SUPABASE_SECRET_KEY`, Algolia credentials)
2. Database connection/configuration issues
3. Tests depend on sequential execution but run in parallel
4. No test isolation - tests pollute shared database state
5. Timing issues with authentication and page loads

---

## Critical Issues

### 1. Missing Environment Variables in CI

**Problem:**
The CI environment (`fiber-e2e` Doppler project) is missing critical environment variables:

```
Error: SUPABASE_SECRET_KEY is not set
Error: HTTP status code: 403 (Reown Config)
```

**Impact:**

- Test user creation fails → all authenticated tests fail
- Wallet connection fails

**Solution:**

```bash
# Add to fiber-e2e Doppler config (staging):
SUPABASE_SECRET_KEY=<service-role-key>
```

**Note:** ~~Algolia credentials are no longer required~~ - fixed by implementing lazy initialization in [lib/services/algolia-search.ts](lib/services/algolia-search.ts) and [lib/services/algolia-search-server.ts](lib/services/algolia-search-server.ts)

---

### 2. Database Isolation & State Management

**Current Problems:**

- All tests share the same Supabase database
- Test user creation uses `Date.now()` for uniqueness
  - **Race condition**: Tests running in parallel can create users at the same millisecond
  - **Cleanup issues**: Global cleanup runs once at start, but tests create data during execution
- No transaction rollback or database reset between tests
- `workers: 1` in CI (sequential) masks some concurrency issues

**Current Flow:**

```
Global Setup
  └─> cleanupTestUsers() - deletes all test-* users
        ↓
Test 1: createAuthenticatedUser("test-earnings-view")
  └─> POST /api/test-users with email test-earnings-view-1234567890@example.com
  └─> Creates user + profile in Supabase
        ↓
Test 2: createAuthenticatedUser("test-earnings-stats")
  └─> POST /api/test-users with email test-earnings-stats-1234567890@example.com
  └─> Fails if same timestamp OR
  └─> Leaves data in database that affects later tests
```

**Issues:**

1. **No cleanup between tests** - data persists and affects subsequent tests
2. **Email collision** - `Date.now()` not unique enough for parallel tests
3. **Shared database** - no isolation between test runs
4. **Order dependency** - tests must run in specific order to pass

---

### 3. Test Timing & Flakiness

**Common Pattern:**

```typescript
await page.goto("/earnings");
await page.waitForTimeout(2000); // ⚠️ Fixed 2s wait
await expect(page.getByTestId("earnings-page")).toBeVisible(); // Fails if server slow
```

**Problems:**

- Fixed timeouts (`waitForTimeout`) are brittle
- 5-second default timeout too short for CI environment
- No retry logic for network requests
- Auth cookie propagation timing issues

---

## Recommended Solutions

### Priority 1: Fix Missing Environment Variables (IMMEDIATE)

**Action:**

1. ✅ ~~Add Algolia env vars~~ - **FIXED** by lazy initialization (no longer needed)
2. Add remaining missing env var to `fiber-e2e` Doppler project:

```bash
doppler secrets set SUPABASE_SECRET_KEY=<value> --project fiber-e2e --config staging
```

3. Verify in CI workflow that all required vars are present

**Expected Impact:** Fixes 40-50 test failures immediately

---

### Priority 2: Improve Test Isolation

#### Option A: Database Per Test (Recommended)

**Approach:**

- Use Supabase test project with isolated schemas
- Each test gets a fresh schema
- Fast parallel execution

**Implementation:**

```typescript
// e2e/helpers/database.ts
export async function createTestSchema(testId: string) {
  const schemaName = `test_${testId}_${Date.now()}`;
  await supabase.raw(`CREATE SCHEMA ${schemaName}`);
  // Clone production schema structure
  await supabase.raw(`CREATE TABLE ${schemaName}.user_profiles (...)`);
  return schemaName;
}

export async function cleanupTestSchema(schemaName: string) {
  await supabase.raw(`DROP SCHEMA ${schemaName} CASCADE`);
}
```

**Pros:**

- True isolation
- Fast parallel execution
- No race conditions

**Cons:**

- Requires schema management
- More complex setup

#### Option B: Better Cleanup with Unique Namespacing

**Approach:**

- Use unique test run ID for all test data
- Cleanup before AND after each test
- Guaranteed unique emails

**Implementation:**

```typescript
// e2e/helpers/test-context.ts
import { randomUUID } from "crypto";

export function getTestRunId(): string {
  return process.env.TEST_RUN_ID || randomUUID();
}

export function createTestUser(page: Page, testName: string) {
  const runId = getTestRunId();
  const email = `test-${testName}-${runId}@example.com`;
  // ... create user
}

// In playwright.config.ts
globalSetup: async () => {
  process.env.TEST_RUN_ID = randomUUID();
},

globalTeardown: async () => {
  // Cleanup all users with this TEST_RUN_ID
  await cleanupTestRunData(process.env.TEST_RUN_ID);
}
```

**Pros:**

- Simpler than Option A
- Still allows parallel execution
- No schema management

**Cons:**

- Still shares database
- Slower than isolated schemas

---

### Priority 3: Remove Fixed Timeouts & Improve Resilience

**Current Anti-pattern:**

```typescript
await page.waitForTimeout(2000);
await expect(element).toBeVisible();
```

**Recommended Pattern:**

```typescript
// Wait for network idle + element
await expect(element).toBeVisible({ timeout: 15000 });
```

**Specific Fixes:**

1. **Increase default timeout in CI:**

```typescript
// playwright.config.ts
use: {
  timeout: process.env.CI ? 30000 : 15000,  // 30s in CI, 15s local
}
```

2. **Replace fixed waits with smart waits:**

```typescript
// ❌ Bad
await page.goto("/earnings");
await page.waitForTimeout(2000);

// ✅ Good
await page.goto("/earnings", { waitUntil: "networkidle" });
await page.waitForLoadState("domcontentloaded");
```

3. **Use custom test helpers:**

```typescript
// e2e/helpers/navigation.ts
export async function navigateAndWait(page: Page, url: string) {
  await page.goto(url, { waitUntil: "networkidle" });
  // Wait for React hydration
  await page.waitForFunction(() => document.readyState === "complete");
  // Small buffer for React state updates
  await page.waitForTimeout(500);
}
```

---

### Priority 4: Optimize Test Speed

**Current Issues:**

- Global cleanup is slow (deletes all users one by one)
- Each test creates full auth session
- No caching of test data

**Recommended Optimizations:**

1. **Batch Operations:**

```typescript
// Instead of Promise.all with individual deletes
await admin.rpc("delete_test_users_batch", { userIds: testUserIds });
```

2. **Reuse Auth Sessions:**

```typescript
// Create once, reuse across tests in same worker
let cachedTestUser: TestUser | null = null;

export async function getOrCreateTestUser(page: Page, testName: string) {
  if (cachedTestUser && !needsFreshUser(testName)) {
    return cachedTestUser;
  }
  cachedTestUser = await createTestUser(page, testName);
  return cachedTestUser;
}
```

3. **Parallel Test Execution:**

```typescript
// playwright.config.ts
workers: process.env.CI ? 3 : 3,  // Increase from 1 to 3
fullyParallel: true,
```

**Expected speedup:** 3-5x faster test execution

---

## Implementation Plan

### Phase 1: Critical Fixes (1-2 hours)

1. ✅ **COMPLETED** - Increased timeouts in CI (30s action, 60s navigation)
2. ✅ **COMPLETED** - Enhanced test user email uniqueness (timestamp + random)
3. ✅ **COMPLETED** - Implemented lazy Algolia initialization (eliminates env var requirement)
4. ⏳ **PENDING** - Add SUPABASE_SECRET_KEY to fiber-e2e Doppler config

**Expected Results:** 80%+ tests passing (after SUPABASE_SECRET_KEY is added)

### Phase 2: Test Isolation (4-6 hours)

1. Implement Option B (unique namespacing + better cleanup)
2. Add before/after hooks for cleanup
3. Ensure parallel execution works

**Expected Results:** 95%+ tests passing, can run in parallel

### Phase 3: Performance Optimization (2-3 hours)

1. Remove all fixed `waitForTimeout` calls
2. Add batch cleanup operations
3. Implement auth session caching

**Expected Results:** Test suite runs in <5 minutes (from ~15 minutes)

### Phase 4: Advanced Isolation (Optional, 8-10 hours)

1. Implement Option A (database per test)
2. Set up test Supabase project
3. Migrate all tests

**Expected Results:** True isolation, 100% reliable, runs in <3 minutes

---

## Proposed Changes Summary

### Immediate (Can commit now):

1. **Add env vars to fiber-e2e Doppler config**
2. **Update playwright.config.ts:**

```typescript
use: {
  actionTimeout: process.env.CI ? 30000 : 15000,
  navigationTimeout: process.env.CI ? 60000 : 30000,
}
```

3. **Update test helper:**

```typescript
// e2e/helpers/auth.ts
export async function createAuthenticatedUser(...) {
  const testRunId = process.env.TEST_RUN_ID || Date.now().toString();
  const uniqueId = `${testRunId}-${Math.random().toString(36).substring(7)}`;
  const email = `${emailOrPrefix}-${uniqueId}@example.com`;
  // ...
}
```

### Short-term (Next PR):

1. Add test isolation with cleanup hooks
2. Remove all fixed timeouts
3. Add retry logic for flaky operations
4. Implement batch cleanup

---

## Expected Outcomes

| Metric          | Before | After Phase 1 | After Phase 2 | After Phase 3 |
| --------------- | ------ | ------------- | ------------- | ------------- |
| CI Pass Rate    | 12%    | 80%           | 95%           | 98%           |
| Local Pass Rate | 88%    | 95%           | 98%           | 99%           |
| Test Duration   | ~15min | ~12min        | ~8min         | ~5min         |
| Flakiness       | High   | Medium        | Low           | Very Low      |
| Parallel Safe   | No     | Partial       | Yes           | Yes           |

---

## Additional Recommendations

1. **Add test markers:**

```typescript
test.describe("Earnings Page @slow @database", () => {
  // Tag tests for selective execution
});
```

2. **Add health check endpoint:**

```typescript
// app/api/health/route.ts
export async function GET() {
  const dbOk = await testDatabaseConnection();
  const algoliaOk = await testAlgoliaConnection();
  return NextResponse.json({ database: dbOk, algolia: algoliaOk });
}
```

3. **Add test reporting:**

```typescript
// playwright.config.ts
reporter: [
  ["html"],
  ["junit", { outputFile: "test-results/junit.xml" }],
  ["github"], // Better CI integration
],
```

4. **Monitor test reliability:**

```bash
# Track flaky tests
pnpm exec playwright test --repeat-each=5 --reporter=json > test-stability.json
```

---

## Questions for Product/Team

1. **Database strategy**: Do we have a separate Supabase project for E2E tests, or should we continue using staging?
2. **CI budget**: Are we okay with potentially higher CI costs from parallel execution?
3. **Test coverage priority**: Which flows are most critical for E2E coverage?
4. **Flakiness tolerance**: What's acceptable failure rate for E2E tests in CI?

---

## Next Steps

1. **Immediate**: Add missing Doppler environment variables
2. **Review**: Get team feedback on proposed approach
3. **Implement**: Phase 1 fixes (today)
4. **Iterate**: Phases 2-3 based on results
