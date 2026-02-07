# E2E Test Coverage - Domain Features

This document tracks all major features across domains to ensure comprehensive end-to-end test coverage.

**Last Updated:** 2025-01-16 (Current: 13 tests passing)

> **Note:** This document tracks features for testing purposes. When refactoring domains, review this document to understand feature scope and update it if features change. See [REFACTOR_CHECKLIST.md](./REFACTOR_CHECKLIST.md) for refactoring progress and [CLAUDE.md](./CLAUDE.md) for architecture guidelines.

## Current Test Files

- `e2e/hello-world.spec.ts` - Basic smoke test (1 test)
- `e2e/auth.spec.ts` - Authentication session management (2 tests)
- `e2e/navigation.spec.ts` - Authenticated page navigation (4 tests)
- `e2e/unauthenticated.spec.ts` - Unauthenticated user flows (5 tests)
- `e2e/user-onboarding-states.spec.ts` - Onboarding modal display (1 test, 5 skipped)

---

## 🎯 Coverage Legend

- ✅ **Covered** - E2E test exists and passing
- 🚧 **Partial** - Some scenarios covered, needs more tests
- ❌ **Not Covered** - No E2E test exists
- 📝 **Planned** - Test planned but not implemented

---

## Authentication (`lib/auth/`)

### Features

| Feature                 | Status | Test File                            | Notes                                               |
| ----------------------- | ------ | ------------------------------------ | --------------------------------------------------- |
| **User Sign Up**        | ❌     | -                                    | Email/password registration                         |
| **OAuth Sign Up**       | ❌     | -                                    | Google OAuth registration                           |
| **User Login**          | ❌     | -                                    | Email/OTP login                                     |
| **OAuth Login**         | ❌     | -                                    | Google/Twitter OAuth login                          |
| **OAuth Provider Hint** | ❌     | -                                    | Show "Previously used Google/Twitter" hint on login |
| **Email Pre-fill**      | ❌     | -                                    | Pre-fill email from encoded URL hint (`h` param)    |
| **Auto-send OTP**       | ❌     | -                                    | Auto-send OTP when email pre-filled                 |
| **Logout**              | 🚧     | e2e/auth.spec.ts                     | Clear auth tested, full logout flow not covered     |
| **Password Reset**      | ❌     | -                                    | Forgot password flow (if applicable)                |
| **Session Persistence** | ✅     | e2e/auth.spec.ts, navigation.spec.ts | Authenticated access to protected pages works       |
| **Auth Drawer Display** | ✅     | e2e/unauthenticated.spec.ts          | Auth drawer shows for protected pages               |

### Critical User Flows

1. New user registration → profile creation → onboarding
2. Existing user login → dashboard
3. OAuth login → profile sync → dashboard
4. Returning user with `h` param → email pre-filled → OAuth hint shown ("Previously used Google") → auto-send OTP or OAuth login
5. Mobile wallet flow → new session with `h` param → email pre-filled → complete auth → wallet verification

---

## Onboarding (`lib/onboarding/`)

### Features

| Feature                         | Status | Test File                          | Notes                                       |
| ------------------------------- | ------ | ---------------------------------- | ------------------------------------------- |
| **Welcome Step**                | ❌     | -                                  | Initial welcome screen                      |
| **How It Works Step**           | ❌     | -                                  | Educational content                         |
| **In Action Step**              | ❌     | -                                  | Example demonstrations                      |
| **Start Earning Step**          | ❌     | -                                  | Wallet + token setup                        |
| **Wallet Connection**           | ❌     | -                                  | Connect Solana wallet during onboarding     |
| **Token Selection**             | ❌     | -                                  | Select payout partner token                 |
| **Onboarding Completion**       | ❌     | -                                  | Mark onboarding as complete                 |
| **Skip Onboarding**             | ❌     | -                                  | Skip flow, can revisit later                |
| **Auto-trigger on First Login** | ✅     | e2e/user-onboarding-states.spec.ts | Modal displays for users without onboarding |

### Critical User Flows

1. New user → sees onboarding modal → completes all steps → wallet connected → token selected
2. New user → skips onboarding → can access from menu later
3. User with wallet → onboarding shows connected state → can manage wallet

---

## Wallet (`lib/wallet/`)

### Features

| Feature                     | Status | Test File | Notes                                                                        |
| --------------------------- | ------ | --------- | ---------------------------------------------------------------------------- |
| **Connect Wallet**          | ❌     | -         | Connect Solana wallet (Phantom, Solflare, etc.)                              |
| **Disconnect Wallet**       | ❌     | -         | Disconnect wallet, keep address                                              |
| **Wallet Verification**     | ❌     | -         | Sign message to verify ownership                                             |
| **Connection State**        | ❌     | -         | Correctly shows connected/disconnected based on `is_solana_wallet_connected` |
| **Mobile Deep Linking**     | ❌     | -         | Mobile wallet app integration                                                |
| **Email Hint Parameter**    | ❌     | -         | Encoded email in URL (`h` param) for session restoration                     |
| **Session Persistence**     | ❌     | -         | Restore session after mobile redirect                                        |
| **Hardware Wallet Support** | ❌     | -         | Ledger, Trezor support                                                       |
| **Wallet Status Card**      | ❌     | -         | Display connected wallet with actions                                        |
| **Copy Wallet Address**     | ❌     | -         | Copy address to clipboard                                                    |
| **Remove Wallet**           | ❌     | -         | Remove wallet from account                                                   |

### Critical User Flows

1. User connects wallet → signs message → verification succeeds → shows as connected
2. User disconnects wallet → `is_solana_wallet_connected` = false → shows as disconnected
3. Mobile user → clicks connect → `h` param added to URL → deep link to wallet app → returns → session restored → email pre-filled → verification completes
4. User removes wallet → confirmation → wallet removed from profile
5. In-app browser session → URL contains encoded email hint (`h` param) → auth page decodes → email pre-filled → OAuth hint shown

---

## Search (`lib/search/`)

### Features

| Feature                    | Status | Test File | Notes                       |
| -------------------------- | ------ | --------- | --------------------------- |
| **Keyword Search**         | ❌     | -         | Search merchants by keyword |
| **Category Filter**        | ❌     | -         | Filter by merchant category |
| **Search Results Display** | ❌     | -         | Show matching offers        |
| **Empty State**            | ❌     | -         | No results message          |
| **Search Caching**         | ❌     | -         | Algolia cache (1 hour)      |
| **Clear Search**           | ❌     | -         | Clear search query          |

### Critical User Flows

1. User enters search term → results displayed → click merchant → offer details
2. User applies category filter → filtered results shown
3. User searches invalid term → empty state shown

---

## Offers (Home/Browse)

### Features

| Feature                       | Status | Test File                                       | Notes                                   |
| ----------------------------- | ------ | ----------------------------------------------- | --------------------------------------- |
| **Browse All Offers**         | ✅     | e2e/unauthenticated.spec.ts, navigation.spec.ts | Home page displays offers               |
| **Offer Card Display**        | ✅     | e2e/unauthenticated.spec.ts                     | Offer cards visible                     |
| **Offer Detail Drawer**       | ✅     | e2e/unauthenticated.spec.ts                     | Drawer opens on click (skipped tests)   |
| **User-Specific Rates**       | ❌     | -                                               | Calculate with boost tier applied       |
| **Boost Tier Badge**          | ❌     | -                                               | Show user's current tier                |
| **Click Through to Merchant** | 🚧     | e2e/unauthenticated.spec.ts                     | Auth drawer shown on visit (not actual) |
| **Payout Token Display**      | ❌     | -                                               | Show selected payout token rate         |
| **Platform Token Display**    | ❌     | -                                               | Show platform token rate                |

### Critical User Flows

1. User browses offers → sees personalized rates → clicks offer → external link
2. User with boost tier → rates show boost multiplier applied
3. User changes payout token → all rates recalculate

---

## Earnings (`lib/earnings/`)

### Features

| Feature                   | Status | Test File | Notes                                 |
| ------------------------- | ------ | --------- | ------------------------------------- |
| **View Total Earnings**   | ❌     | -         | Lifetime earnings summary             |
| **Earnings by Token**     | ❌     | -         | Breakdown by payout token             |
| **Transaction History**   | ❌     | -         | List of all transactions              |
| **Pending vs Confirmed**  | ❌     | -         | Show transaction status               |
| **Earnings Calculations** | ❌     | -         | Accurate rate calculations with boost |

### Critical User Flows

1. User makes purchase → transaction appears as pending → confirms → earnings updated
2. User views earnings → breakdown by token shown correctly

---

## Tiers (`lib/tiers/`)

### Features

| Feature                  | Status | Test File | Notes                                 |
| ------------------------ | ------ | --------- | ------------------------------------- |
| **View Boost Tiers**     | ❌     | -         | See all available tiers               |
| **Current Tier Display** | ❌     | -         | Show user's current tier              |
| **Tier Requirements**    | ❌     | -         | Display staking/purchase requirements |
| **Tier Benefits**        | ❌     | -         | Show boost multipliers and splits     |
| **Tier Modal**           | ❌     | -         | Detailed tier comparison              |

### Critical User Flows

1. User views tiers → sees requirements → understands current tier
2. User qualifies for new tier → tier updated → rates recalculated

---

## Navigation & Page Access

### Features

| Feature                      | Status | Test File                   | Notes                           |
| ---------------------------- | ------ | --------------------------- | ------------------------------- |
| **Home Page Access**         | ✅     | e2e/navigation.spec.ts      | Authenticated users can access  |
| **Search Page Redirect**     | ✅     | e2e/navigation.spec.ts      | /search redirects to /          |
| **Earnings Page Access**     | ✅     | e2e/navigation.spec.ts      | Authenticated users can access  |
| **Payouts Page Access**      | ✅     | e2e/navigation.spec.ts      | Authenticated users can access  |
| **Profile Page Access**      | ✅     | e2e/auth.spec.ts            | Authenticated users can access  |
| **Unauthenticated Redirect** | ✅     | e2e/unauthenticated.spec.ts | Auth drawer shown for protected |

---

## Profile (`lib/profile/`)

### Features

| Feature                  | Status | Test File        | Notes                            |
| ------------------------ | ------ | ---------------- | -------------------------------- |
| **View Profile**         | 🚧     | e2e/auth.spec.ts | Page loads, content not verified |
| **Edit Avatar**          | ❌     | -                | Change profile avatar            |
| **View Wallet**          | ❌     | -                | Display connected wallet         |
| **Manage Wallet**        | ❌     | -                | Connect/disconnect/remove wallet |
| **View Payout Settings** | ❌     | -                | Current payout token             |
| **Change Payout Token**  | ❌     | -                | Select different payout token    |
| **View Boost Tier**      | ❌     | -                | Current tier and benefits        |

### Critical User Flows

1. User views profile → edits avatar → avatar updated
2. User changes payout token → confirmation → token updated → rates recalculated
3. User manages wallet → disconnects → wallet state updated

---

## Payouts

### Features

| Feature                  | Status | Test File | Notes                                  |
| ------------------------ | ------ | --------- | -------------------------------------- |
| **View Payout Settings** | ❌     | -         | Current payout configuration           |
| **Select Payout Token**  | ❌     | -         | Choose from available partner tokens   |
| **Save Payout Settings** | ❌     | -         | Persist payout token selection         |
| **Token List Display**   | ❌     | -         | Show all available tokens with details |

### Critical User Flows

1. User selects payout token → saves → token updated in profile
2. User views offers → rates reflect selected payout token

---

## Admin

### Features

| Feature                        | Status | Test File | Notes                                     |
| ------------------------------ | ------ | --------- | ----------------------------------------- |
| **Admin Dashboard**            | ❌     | -         | Admin-only dashboard access               |
| **Cache Management**           | ❌     | -         | Clear/revalidate Algolia cache            |
| **Merchant Filter Management** | ❌     | -         | Manage categories and sort options        |
| **Admin Authentication**       | ❌     | -         | Role-based access control for admin pages |

### Critical User Flows

1. Admin logs in → accesses admin dashboard → manages cache/filters
2. Admin clears cache → cache revalidated → updated results shown

---

## Static Content

### FAQ (`lib/faq/`)

| Feature                  | Status | Test File | Notes                          |
| ------------------------ | ------ | --------- | ------------------------------ |
| **Display FAQ Items**    | ❌     | -         | Show all FAQ questions/answers |
| **Collapsible Sections** | ❌     | -         | Expand/collapse FAQ items      |

### Terms (`lib/terms/`)

| Feature                | Status | Test File | Notes                 |
| ---------------------- | ------ | --------- | --------------------- |
| **Display Terms**      | ❌     | -         | Show terms of service |
| **Section Navigation** | ❌     | -         | Navigate to sections  |

### Privacy (`lib/privacy/`)

| Feature                    | Status | Test File | Notes                |
| -------------------------- | ------ | --------- | -------------------- |
| **Display Privacy Policy** | ❌     | -         | Show privacy policy  |
| **Section Navigation**     | ❌     | -         | Navigate to sections |

---

## Cross-Domain Critical Flows

### Complete User Journey - New User

```
1. Sign up (OAuth) → Profile created
2. Onboarding modal appears automatically
3. Complete onboarding steps (wallet + token)
4. Browse offers with personalized rates
5. Click offer → track click through
6. Make purchase → earnings recorded
7. View earnings in profile
```

**Status:** ❌ Not Covered

### Complete User Journey - Returning User

```
1. Login → Session restored
2. View offers → rates based on tier + token
3. Change payout token → rates recalculate
4. View earnings → transaction history
5. Manage wallet → disconnect/reconnect
```

**Status:** ❌ Not Covered

### Wallet Connection Flow - Desktop

```
1. Click connect wallet
2. Select wallet provider (Phantom/Solflare)
3. Approve connection in extension
4. Sign verification message
5. Wallet verified → shows as connected
6. is_solana_wallet_connected = true
```

**Status:** ❌ Not Covered

### Wallet Connection Flow - Mobile

```
1. Click connect wallet on mobile
2. Deep link to wallet app
3. Approve connection in app
4. Return to web app → session restored
5. Sign verification message
6. Wallet verified → shows as connected
```

**Status:** ❌ Not Covered

---

## Test Coverage Goals

### Phase 1: Critical Paths (Priority 1)

- [ ] Authentication (sign up, login, logout)
- [ ] Wallet connection (desktop + mobile)
- [ ] Onboarding complete flow
- [ ] Offer browsing with personalized rates
- [ ] Payout token selection

### Phase 2: Core Features (Priority 2)

- [ ] Profile management
- [ ] Search functionality
- [ ] Earnings tracking
- [ ] Boost tiers display
- [ ] Wallet management (disconnect, remove)

### Phase 3: Edge Cases (Priority 3)

- [ ] Session persistence across refreshes
- [ ] Mobile wallet deep linking edge cases
- [ ] Error states (failed wallet connection, etc.)
- [ ] Empty states (no earnings, no offers)
- [ ] Rate calculations with different tiers

---

## Notes for Test Implementation

### Testing Tools

- **Framework:** Playwright (recommended for Next.js)
- **Wallet Mocking:** Mock Solana wallet for deterministic testing
- **API Mocking:** Mock external APIs (Algolia, Supabase where needed)
- **Test Data:** Use test database with seeded data

### Key Testing Considerations

1. **Wallet Testing**
   - Mock wallet adapters to avoid real wallet connections
   - Test both connection success and failure paths
   - Verify `is_solana_wallet_connected` flag updates correctly

2. **Rate Calculations**
   - Test with different boost tiers
   - Test with different payout tokens
   - Verify boost multipliers applied correctly

3. **Mobile Testing**
   - Test deep linking flows
   - Test session persistence after app switch
   - Test mobile viewport layouts

4. **Authentication**
   - Test cookie-based session persistence
   - Test RLS enforcement
   - Test logout cleanup

---

## Updating This Document

When adding new features:

1. Add feature to appropriate domain section
2. Mark status as ❌ (not covered)
3. Update when test is implemented
4. Add to critical flows if it's a major user journey
5. Update last updated date at top

When implementing tests:

1. Create test file in appropriate location
2. Update status column (❌ → 🚧 → ✅)
3. Add test file path to table
4. Add notes about test coverage

---

## Quick Reference: Test Status by Domain

| Domain         | Total Features | Covered | Partial | Not Covered | Coverage % |
| -------------- | -------------- | ------- | ------- | ----------- | ---------- |
| Authentication | 11             | 2       | 1       | 8           | 18%        |
| Onboarding     | 9              | 1       | 0       | 8           | 11%        |
| Wallet         | 11             | 0       | 0       | 11          | 0%         |
| Search         | 6              | 0       | 0       | 6           | 0%         |
| Offers         | 8              | 3       | 1       | 4           | 38%        |
| Navigation     | 6              | 6       | 0       | 0           | 100%       |
| Earnings       | 5              | 0       | 0       | 5           | 0%         |
| Tiers          | 5              | 0       | 0       | 5           | 0%         |
| Profile        | 7              | 0       | 1       | 6           | 7%         |
| Payouts        | 4              | 0       | 0       | 4           | 0%         |
| Admin          | 4              | 0       | 0       | 4           | 0%         |
| Static Content | 6              | 0       | 0       | 6           | 0%         |
| **Total**      | **82**         | **12**  | **3**   | **67**      | **15%**    |

---

_This document should be updated whenever new features are added or tests are implemented._
