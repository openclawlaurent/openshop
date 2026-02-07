# E2E Test Priority List

**Generated:** 2025-01-16
**Current Coverage:** 15% (12 covered, 3 partial, 67 not covered)

This document prioritizes E2E tests by business impact and user journey criticality.

---

## 🔴 **CRITICAL (P0) - Core Revenue & User Flow**

These features directly impact revenue or block core user journeys. Without them, the app cannot function.

### 1. **Wallet Connection Flow** (0% covered - HIGHEST PRIORITY)

**Why Critical:** Users cannot earn commissions without connecting a wallet. This is the #1 blocker for revenue.

**Tests Needed:**

- [ ] **Desktop wallet connection** - Connect Phantom/Solflare extension → sign message → verify ownership → shows as connected
- [ ] **Mobile wallet connection** - Deep link to Phantom app → approve → return to web → session restored → verification complete
- [ ] **Wallet disconnect** - Disconnect wallet → `is_solana_wallet_connected` = false → still shows address
- [ ] **Wallet verification status** - Verify wallet shows correct connection state throughout the app
- [ ] **Remove wallet** - Remove wallet from profile → confirmation → wallet cleared

**Impact:** WITHOUT THIS: Users cannot receive payouts
**Estimated Effort:** 2-3 hours (needs wallet mocking strategy)
**Test File:** `e2e/wallet-connection.spec.ts` (new)

---

### 2. **Payout Token Selection** (0% covered)

**Why Critical:** Users must select a payout token to receive earnings. Part of core setup flow.

**Tests Needed:**

- [ ] **View available payout tokens** - Display all active partner tokens with icons/names
- [ ] **Select payout token** - Choose token → save → persisted in profile
- [ ] **Change payout token** - Switch from one token to another → confirmation → rates recalculate
- [ ] **Token reflects in offer rates** - Selected token rate displayed correctly on offer cards

**Impact:** WITHOUT THIS: Users cannot complete setup to start earning
**Estimated Effort:** 1 hour
**Test File:** `e2e/payout-token-selection.spec.ts` (new)

---

### 3. **Offer Click-Through & Affiliate Link Generation** (0% covered)

**Why Critical:** This is how we make money - users clicking through affiliate links to make purchases.

**Tests Needed:**

- [ ] **View offer details** - Click offer → detail drawer opens → shows merchant info
- [ ] **Generate affiliate link (authenticated, complete setup)** - Visit button → affiliate link generated with `/r/w?c=...&d=...` format
- [ ] **Require complete setup for affiliate link** - Incomplete setup → clicking Visit shows auth/setup prompt (already tested ✅)
- [ ] **Track click-through** - Click visit → tracking recorded (mock or verify API call)

**Impact:** WITHOUT THIS: No affiliate tracking = no revenue
**Estimated Effort:** 1.5 hours
**Test File:** `e2e/offer-click-through.spec.ts` (new) + un-skip existing tests in `user-onboarding-states.spec.ts`

---

### 4. **Complete Onboarding Flow** (11% covered - only modal display tested)

**Why Critical:** New users must complete onboarding to understand the app and set up wallet/token.

**Tests Needed:**

- [ ] **Step 1: Welcome** - Display welcome screen → click next
- [ ] **Step 2: How It Works** - Educational content → click next
- [ ] **Step 3: In Action** - Examples → click next
- [ ] **Step 4: Start Earning** - Wallet + token setup → complete
- [ ] **Complete onboarding** - All steps done → `wildfire_device_id` set → modal doesn't show again
- [ ] **Skip onboarding** - Click skip → can access later from menu

**Impact:** WITHOUT THIS: New users are confused about how the app works
**Estimated Effort:** 2 hours
**Test File:** `e2e/onboarding-flow.spec.ts` (new)

---

### 5. **User Authentication - Sign Up & Login** (18% covered - session tested, but not actual auth flow)

**Why Critical:** Users cannot access the app without authentication.

**Tests Needed:**

- [ ] **Email/OTP sign up** - Enter email → receive OTP → enter code → profile created
- [ ] **OAuth sign up (Google)** - Click Google → OAuth flow → profile created → onboarding shown
- [ ] **Email/OTP login** - Existing user → enter email → OTP → logged in
- [ ] **OAuth login (Google/Twitter)** - Existing user → click OAuth → logged in
- [ ] **OAuth provider hint** - Returning user → email pre-filled → "Previously used Google" hint shown
- [ ] **Email pre-fill from `h` param** - URL with `?h=encoded-email` → email pre-filled in auth form

**Impact:** WITHOUT THIS: Users cannot create accounts or log in
**Estimated Effort:** 3 hours (OAuth mocking required)
**Test File:** `e2e/authentication-flows.spec.ts` (new)

---

## 🟡 **HIGH (P1) - Important User Features**

These features significantly improve user experience and are expected functionality.

### 6. **Earnings Page - View Earnings** (0% covered)

**Why Important:** Users want to see how much they've earned. Key retention feature.

**Tests Needed:**

- [ ] **View total earnings** - Display lifetime earnings summary
- [ ] **Earnings by token** - Breakdown by payout token (BONK, USDC, etc.)
- [ ] **Transaction history** - List of all commission transactions
- [ ] **Pending vs confirmed** - Show transaction status correctly
- [ ] **Empty state** - New user with no earnings → helpful empty state message

**Impact:** WITHOUT THIS: Users don't know if they're earning money
**Estimated Effort:** 1 hour
**Test File:** `e2e/earnings-page.spec.ts` (new)

---

### 7. **Boost Tiers - View & Understand** (0% covered)

**Why Important:** Boost tiers are a key gamification/retention feature to encourage staking.

**Tests Needed:**

- [ ] **View all boost tiers** - Display tier list with names, requirements, benefits
- [ ] **View current tier** - Show user's current tier badge
- [ ] **Tier requirements** - Display staking amount and purchase requirements clearly
- [ ] **Tier benefits** - Show boost multipliers and split percentages
- [ ] **Open tier modal** - Click tier badge → modal with detailed comparison

**Impact:** WITHOUT THIS: Users don't understand how to increase their earnings
**Estimated Effort:** 1 hour
**Test File:** `e2e/boost-tiers.spec.ts` (new)

---

### 8. **Search Functionality** (0% covered)

**Why Important:** Users need to find specific merchants easily.

**Tests Needed:**

- [ ] **Keyword search** - Enter search term → results displayed
- [ ] **Category filter** - Select category → filtered results shown
- [ ] **Empty state** - Search invalid term → "No results" message
- [ ] **Clear search** - Clear button → reset to all offers

**Impact:** WITHOUT THIS: Users struggle to find merchants they want
**Estimated Effort:** 1 hour
**Test File:** `e2e/search-functionality.spec.ts` (new)

---

### 9. **Profile Management** (7% covered - only page load tested)

**Why Important:** Users need to manage their settings and view their wallet.

**Tests Needed:**

- [ ] **View profile** - Display user info, wallet address, tier, payout token
- [ ] **Edit avatar** - Change avatar → saved
- [ ] **View wallet status** - Connected wallet displayed with copy button
- [ ] **Copy wallet address** - Click copy → address copied to clipboard → toast shown
- [ ] **View payout settings** - Current payout token shown
- [ ] **View boost tier** - Current tier badge and benefits displayed

**Impact:** WITHOUT THIS: Users cannot manage their account
**Estimated Effort:** 1.5 hours
**Test File:** `e2e/profile-management.spec.ts` (new)

---

## 🟢 **MEDIUM (P2) - Nice to Have**

These improve robustness but are not critical for core functionality.

### 10. **User-Specific Rate Calculations** (0% covered)

**Why Useful:** Ensure rates are calculated correctly with boost tier applied.

**Tests Needed:**

- [ ] **Base rate for starter tier** - No boost tier → shows base merchant rate
- [ ] **Boosted rate for gold tier** - Gold tier user → rate shows boost multiplier applied
- [ ] **Rate changes with token selection** - Change payout token → rates recalculate
- [ ] **Platform token display** - Shows correct platform token rate

**Impact:** WITHOUT THIS: Users might see incorrect earnings estimates
**Estimated Effort:** 1.5 hours
**Test File:** `e2e/rate-calculations.spec.ts` (new)

---

### 11. **Session Persistence & Mobile Flows** (18% covered - basic persistence tested)

**Why Useful:** Ensure users stay logged in across page refreshes and mobile app switches.

**Tests Needed:**

- [ ] **Session persists across refresh** - Log in → refresh page → still authenticated
- [ ] **Mobile wallet deep link recovery** - Wallet app returns → session restored → auth continues
- [ ] **Email hint parameter (`h`)** - Mobile flow → URL contains encoded email → email pre-filled
- [ ] **Session timeout** - Session expires after inactivity → requires re-login

**Impact:** WITHOUT THIS: Mobile users get stuck in auth loops
**Estimated Effort:** 2 hours (mobile simulation required)
**Test File:** `e2e/session-persistence.spec.ts` (new)

---

### 12. **Static Content Pages** (0% covered)

**Why Useful:** Compliance and user trust (terms, privacy, FAQ).

**Tests Needed:**

- [ ] **FAQ page loads** - Display all FAQ items
- [ ] **FAQ expand/collapse** - Click item → expands → click again → collapses
- [ ] **Terms page loads** - Display terms of service
- [ ] **Privacy page loads** - Display privacy policy

**Impact:** WITHOUT THIS: Potential legal/compliance issues
**Estimated Effort:** 30 minutes
**Test File:** `e2e/static-content.spec.ts` (new)

---

## 🔵 **LOW (P3) - Edge Cases & Admin**

These are important for completeness but can wait.

### 13. **Admin Features** (0% covered)

**Tests Needed:**

- [ ] Admin dashboard access (role-based)
- [ ] Cache management
- [ ] Filter management

**Impact:** Low - internal tooling
**Estimated Effort:** 1 hour
**Test File:** `e2e/admin.spec.ts` (new)

---

### 14. **Error States** (0% covered)

**Tests Needed:**

- [ ] Failed wallet connection → error message
- [ ] Network error during offer load → retry mechanism
- [ ] Invalid search input → handled gracefully

**Impact:** Low - edge cases
**Estimated Effort:** 1.5 hours
**Test File:** `e2e/error-states.spec.ts` (new)

---

## 📊 Summary

### By Priority

| Priority  | Tests    | Estimated Effort | Business Impact   |
| --------- | -------- | ---------------- | ----------------- |
| P0 (🔴)   | 5 suites | ~10 hours        | Revenue-blocking  |
| P1 (🟡)   | 4 suites | ~4.5 hours       | Key user features |
| P2 (🟢)   | 3 suites | ~4 hours         | Robustness        |
| P3 (🔵)   | 2 suites | ~2.5 hours       | Edge cases        |
| **Total** | **14**   | **~21 hours**    | **Full coverage** |

### Recommended Implementation Order

**Week 1 (P0 - CRITICAL):**

1. Wallet connection (2-3h) ← START HERE
2. Payout token selection (1h)
3. Offer click-through (1.5h)
4. Onboarding flow (2h)
5. Authentication flows (3h)

**Week 2 (P1 - HIGH):** 6. Earnings page (1h) 7. Boost tiers (1h) 8. Search (1h) 9. Profile management (1.5h)

**Week 3 (P2-P3 - MEDIUM/LOW):** 10. Rate calculations (1.5h) 11. Session persistence (2h) 12. Static content (30m) 13. Admin features (1h) 14. Error states (1.5h)

---

## Next Steps

**Option A: Start with highest ROI**

- Implement **Wallet Connection** (#1) first - this is the biggest blocker for users

**Option B: Leverage existing patterns**

- Un-skip tests in `user-onboarding-states.spec.ts` for offer detail/setup flows (#3)
- Then build on that pattern for wallet connection (#1)

**Option C: Quick wins first**

- Start with easier tests (Payout Token, Boost Tiers, Static Content)
- Build confidence and patterns
- Then tackle complex wallet/auth flows

**Recommendation:** Start with **#1 (Wallet Connection)** since it's the highest priority business blocker. The wallet mocking strategy you develop will be reusable for onboarding tests too.
