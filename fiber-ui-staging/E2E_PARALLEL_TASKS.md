# E2E Test Suite - Parallel Task Checklist

## Context

We have completed 3/10 E2E test suites with 100% pass rates (28 tests total). The remaining 7 test suites can be implemented in parallel by multiple agents.

## Completed Test Suites ✅

1. **Search Functionality** - `e2e/search.spec.ts` - 8 tests passing
2. **Earnings Page** - `e2e/earnings.spec.ts` - 9 tests passing
3. **Profile Page** - `e2e/profile.spec.ts` - 11 tests passing

## Test Suite Tasks (Run in Parallel)

### Task 1: FAQ Page Tests

**File**: `e2e/faq.spec.ts`
**Page Route**: `/faq`
**Target**: 6-8 tests

**Tests to Write**:

1. Display FAQ page for all users (authenticated and unauthenticated)
2. Show FAQ items with questions and answers
3. Accordion expand/collapse functionality
4. Multiple accordions can be open simultaneously
5. Page is mobile responsive
6. Navigate to FAQ from home page
7. FAQ content loads correctly
8. All FAQ items are visible

**Key Elements to Test**:

- Page heading: "FAQ" or "Frequently Asked Questions"
- Accordion items (use `getByRole("button")` for triggers)
- Collapsible content sections
- Check for common FAQ topics (earnings, wallet, tokens, etc.)

**Test User Config**: Most tests don't need authentication, but include 1-2 with `onboardingComplete: true` for navigation tests

---

### Task 2: Terms & Privacy Pages Tests

**File**: `e2e/legal-pages.spec.ts`
**Page Routes**: `/terms`, `/privacy`
**Target**: 6-8 tests

**Tests to Write**:

1. Terms page displays for all users
2. Privacy page displays for all users
3. Terms page shows correct heading and content
4. Privacy page shows correct heading and content
5. Navigate to Terms from footer/links
6. Navigate to Privacy from footer/links
7. Both pages are mobile responsive
8. Content sections are visible (multiple headings/sections)

**Key Elements to Test**:

- Page headings: "Terms of Service", "Privacy Policy"
- Content sections/paragraphs visible
- Footer links work correctly
- Pages accessible without authentication

**Test User Config**: Most tests don't need authentication

---

### Task 3: Wallet Disconnection Tests

**File**: `e2e/wallet-disconnect.spec.ts`
**Page Route**: `/profile` (wallet section)
**Target**: 5-7 tests

**Tests to Write**:

1. Connected wallet shows disconnect option
2. Disconnect button visible when wallet connected
3. Click disconnect button disconnects wallet
4. Wallet status changes from connected to disconnected
5. Reconnect after disconnect works
6. Disconnect updates profile state
7. Settings menu shows disconnect option

**Key Elements to Test**:

- `data-testid="wallet-connected-status"` when connected
- `data-testid="disconnect-wallet-button"` button
- `data-testid="wallet-disconnected-status"` after disconnect
- Settings dropdown menu with disconnect option

**Test User Config**: Use `solanaAddress: "TestWallet123456789"` to start with connected wallet

---

### Task 4: Mobile Navigation Tests

**File**: `e2e/mobile-navigation.spec.ts`
**Page Route**: `/` (home page with mobile nav)
**Target**: 6-8 tests

**Tests to Write**:

1. Mobile hamburger menu button visible on small viewport
2. Click hamburger opens navigation drawer
3. Navigation drawer shows all menu items
4. Click nav item navigates to correct page
5. Close drawer using close button
6. Drawer closes after navigation
7. Desktop navigation shows on large viewport
8. Bottom nav visible on mobile

**Key Elements to Test**:

- Set viewport: `page.setViewportSize({ width: 375, height: 667 })`
- Hamburger menu button (often `getByRole("button", { name: /menu/i })`)
- Navigation drawer/sheet component
- Nav links: Home, Earnings, Profile, etc.

**Test User Config**: `onboardingComplete: true` for full navigation access

---

### Task 5: Home Page Filtering Tests

**File**: `e2e/home-filtering.spec.ts`
**Page Route**: `/` or `/?category=xyz`
**Target**: 7-9 tests

**Tests to Write**:

1. Filter offers by category
2. Filter offers by merchant
3. Clear filters returns to all offers
4. Multiple filters can be applied
5. Filtered results update URL parameters
6. URL parameters persist on page reload
7. Filtered results show correct offer count
8. No results message when filters yield no matches
9. Reset filters button works

**Key Elements to Test**:

- Category filter dropdown/selector
- Merchant filter options
- Offer cards: `[data-testid^="offer-card-"]`
- URL params: `?category=`, `?merchant=`
- "No results" or empty state messaging

**Test User Config**: `onboardingComplete: true`

---

### Task 6: Setup Completion Flow Tests

**File**: `e2e/setup-completion.spec.ts`
**Page Routes**: `/profile`, `/payouts`
**Target**: 6-8 tests

**Tests to Write**:

1. New user completes token selection
2. New user connects wallet
3. Complete both wallet + token shows full setup
4. Setup banner disappears after completion
5. Incomplete setup shows on home page
6. Complete setup flow from profile page
7. Token saved successfully toast appears
8. Wallet connected successfully message appears

**Key Elements to Test**:

- Setup banner: `data-testid="incomplete-setup-banner"`
- Token selection flow (combobox, save button)
- Wallet connection flow
- Success states (green boxes, toasts)
- `data-testid="wallet-setup-completed"`
- `data-testid="currency-setup-completed"`

**Test User Config**: Start with `onboardingComplete: true, payoutPartnerTokenId: false` and test the flow to completion

---

### Task 7: Offer Filtering Edge Cases Tests

**File**: `e2e/offer-edge-cases.spec.ts`
**Page Route**: `/` (home page with offers)
**Target**: 5-7 tests

**Tests to Write**:

1. No offers found shows appropriate message
2. Search with no results shows empty state
3. Invalid category parameter handled gracefully
4. Invalid merchant parameter handled gracefully
5. Reset all filters from complex filter state
6. Offer cards render correctly with edge case data
7. Pagination works when many offers exist

**Key Elements to Test**:

- Empty state messaging
- Reset/clear filters button
- URL parameter handling
- Offer card edge cases (long names, missing data)
- Error handling for bad URLs

**Test User Config**: `onboardingComplete: true`

---

## Running Instructions

### For Each Agent:

1. **Read context** from completed tests: `e2e/search.spec.ts`, `e2e/earnings.spec.ts`, `e2e/profile.spec.ts`
2. **Follow patterns**: Use same helper functions, selectors, error handling
3. **Create test file** in `e2e/` directory
4. **Write tests** following the spec above
5. **Run tests** with: `doppler run -- pnpm exec playwright test e2e/[filename].spec.ts --reporter=list`
6. **Fix failures** iteratively until 100% pass rate
7. **Report results** with passing test count

### Test Patterns to Follow:

- Use `createAuthenticatedUser()` helper from `./helpers/auth`
- Add `await page.waitForTimeout(2000-3000)` after navigation
- Use `.catch(() => false)` for optional element checks
- Use `data-testid` when available, role-based selectors otherwise
- Test mobile responsiveness with viewport changes
- Include auth redirect tests where applicable

### Common Selectors:

- Pages: `page.getByTestId("[page-name]-page")`
- Headings: `page.getByRole("heading", { name: /text/i })`
- Buttons: `page.getByRole("button", { name: /text/i })`
- Links: `page.getByRole("link", { name: /text/i })`
- Comboboxes: `page.getByRole("combobox")`
- Options: `page.getByRole("option")`

### Expected Outcome:

- 7 new test files created
- Approximately 45-55 new tests total
- All tests passing (100% pass rate per file)
- Combined with existing tests: **70+ E2E tests** total

## Notes

- Each task is independent and can run in parallel
- Tests may fail initially - iterate to fix selectors, wait times, etc.
- Use existing test files as reference for patterns
- Check actual UI implementation to verify selectors
- Add longer wait times if elements load slowly
