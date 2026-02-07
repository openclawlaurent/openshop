# Refactoring Migration Checklist

Track progress for the Fiber UI refactoring project.

## Important: New Architecture Pattern

**🚨 ALL NEW CODE GOES IN `lib/[domain]/`, NOT `components/[domain]/`**

Structure:

```
lib/[domain]/
├── ui/                      # UI components
│   └── index.ts            # export * from './component-name'
├── content/                # Static content (if needed)
│   └── index.ts            # Content data + types
├── data-access/            # Data fetching (if needed)
│   ├── index.ts           # export * from './hook-name' (client-side)
│   └── server/index.ts    # export * from './function-name' (server-side)
├── feature/                # Orchestration (if needed)
│   └── index.ts           # export * from './feature-name'
└── index.ts                # Documentation only, NO exports
```

**Barrel export pattern:** Use `export *` to re-export everything from the module:

```typescript
// ✅ DO THIS - automatic re-export
// lib/faq/ui/index.ts
export * from "./faq-list";
export * from "./faq-item";

// ❌ DON'T DO THIS - explicit named exports (too much maintenance)
// lib/faq/ui/index.ts
export { FaqList } from "./faq-list";
export { FaqItem } from "./faq-item";
```

**Import pattern (explicit only):**

```typescript
// ✅ DO THIS
import { FaqList } from "@/lib/faq/ui";
import { faqItems } from "@/lib/faq/content";

// ❌ DON'T DO THIS
import { FaqList, faqItems } from "@/lib/faq";
```

## Setup & Preparation

- [x] ✅ Configure MCP servers (Supabase + Filesystem) - See [MCP_SETUP.md](./MCP_SETUP.md)
- [x] ✅ Updated architecture to use `lib/` instead of `components/`
- [x] ✅ Established explicit import pattern (no top-level barrel exports)
- [ ] Install Zod if not already: `pnpm add zod`
- [ ] Review [REFACTOR_PROMPT.md](./REFACTOR_PROMPT.md) for detailed guidelines

## Phase 1: Info Pages ✅ COMPLETE (Migrated to lib/)

### FAQ Page ✅

- [x] Create `lib/faq/` domain folder
- [x] Create `lib/faq/ui/faq-list.tsx` - pure FAQ list component
- [x] Create `lib/faq/ui/faq-item.tsx` - individual FAQ item component
- [x] Create `lib/faq/ui/index.ts` - barrel export for UI
- [x] Create `lib/faq/content/index.ts` - FAQ data with TypeScript types
- [x] Create `lib/faq/index.ts` - documentation only, no exports
- [x] Update `app/faq/page.tsx` with explicit imports
- [x] Delete old `components/info-pages/`
- [x] Verify functionality (no regressions)
- [x] Run checks: `pnpm exec tsc --noEmit` ✅

### Terms Page ✅

- [x] Create `lib/terms/` domain folder
- [x] Create `lib/terms/ui/terms-content.tsx`
- [x] Create `lib/terms/ui/index.ts` - barrel export for UI
- [x] Create `lib/terms/content/index.ts` - Terms content with types
- [x] Create `lib/terms/index.ts` - documentation only
- [x] Update `app/terms/page.tsx` with explicit imports
- [x] Verify functionality
- [x] Run checks: `pnpm exec tsc --noEmit` ✅

### Privacy Page ✅

- [x] Create `lib/privacy/` domain folder
- [x] Create `lib/privacy/ui/privacy-content.tsx`
- [x] Create `lib/privacy/ui/index.ts` - barrel export for UI
- [x] Create `lib/privacy/content/index.ts` - Privacy content with types
- [x] Create `lib/privacy/index.ts` - documentation only
- [x] Update `app/privacy/page.tsx` with explicit imports
- [x] Verify functionality
- [x] Run checks: `pnpm exec tsc --noEmit` ✅

## Phase 2: Onboarding ("What's Fiber") ✅ COMPLETE

**Status:** Migrated to `lib/onboarding/` with complete layer separation

- [x] Migrate `components/onboarding/` → `lib/onboarding/`
- [x] Create `lib/onboarding/ui/` - 7 UI components (welcome-step, how-it-works-step, etc.)
- [x] Create `lib/onboarding/content/` - Static content (welcome, how-it-works, in-action)
- [x] Create `lib/onboarding/data-access/` - Onboarding steps metadata
- [x] Create `lib/onboarding/feature/` - Container + context (onboarding-modal-container, onboarding-context)
- [x] Create all barrel exports with `export *` pattern
- [x] Create `lib/onboarding/index.ts` - documentation only, NO exports
- [x] Update imports in `components/ui/layout/footer.tsx`
- [x] Delete old `contexts/onboarding-context.tsx`
- [x] Delete old `components/onboarding/` directory
- [x] Verify functionality - TypeScript, ESLint, build all passed ✅
- [x] Run checks: `pnpm exec tsc --noEmit` ✅

## Phase 3: Tiers (Boost Tiers Modal) ✅ COMPLETE

- [x] Create `lib/tiers/` domain folder
- [x] Create folder structure (`ui/`, `content/`, `data-access/`, `feature/`)
- [x] Create types for boost_tiers table
- [x] Extract pure UI components to `ui/` (`tier-badge.tsx`, `tier-row.tsx`, `tiers-table.tsx`)
- [x] Create `ui/index.ts` - barrel export for UI components
- [x] Create `data-access/use-boost-tiers.ts` hook
- [x] Create `data-access/use-current-boost-tier.ts` hook
- [x] Create `data-access/tier-utils.ts` utility functions
- [x] Create `data-access/index.ts` - client-side exports
- [x] Create `data-access/server/get-boost-tiers.ts` server functions
- [x] Create `data-access/server/index.ts` - server-side exports
- [x] Create `feature/boost-tiers-drawer.tsx` feature component
- [x] Create `content/index.ts` - tier color mapping
- [x] Add Zod validation for tier data
- [x] Create `lib/tiers/index.ts` - documentation only, NO exports
- [x] Update all imports to explicit pattern
- [x] Update `app/api/boost-tiers/route.ts`
- [x] Update `app/search/page.tsx`
- [x] Update `app/api/offers/route.ts`
- [x] Update `components/feature/user/user-profile-card.tsx`
- [x] Update `components/feature/navigation/responsive-sidebar.tsx`
- [x] Update `components/ui/data-display/offer-card.tsx`
- [x] Update `lib/utils/user-rate-calculator.ts`
- [x] Update `lib/utils/user-rate-calculator.test.ts`
- [x] Remove old tier components from `components/feature/user/`
- [x] Remove old hooks from `hooks/`
- [x] Remove old utils from `lib/utils/`
- [x] Remove old data access from `lib/data/`
- [x] Verify no tier-related type errors
- [x] Run checks: `pnpm exec tsc --noEmit` ✅

## Phase 4: Search (Most Complex)

### Setup

- [ ] Create `lib/search/` domain folder
- [ ] Create folder structure (`ui/`, `data-access/`, `feature/`)
- [ ] Review existing Algolia integration
- [ ] Generate types for search-related tables

### UI Layer

- [ ] Create `ui/search-input.tsx`
- [ ] Create `ui/search-filters.tsx`
- [ ] Create `ui/search-results.tsx`
- [ ] Create `ui/offer-card.tsx`
- [ ] Create `ui/search-empty-state.tsx`
- [ ] Add tests for UI components

### Data Access Layer

- [ ] Create `data-access/use-search.ts` (client hook)
- [ ] Create `data-access/use-search-filters.ts`
- [ ] Create `data-access/server/get-search-results-ssr.ts`
- [ ] Move URL param management to data-access
- [ ] Add Zod validation for search responses
- [ ] Keep existing Algolia caching functionality
- [ ] Add tests for search utilities

### Feature Layer

- [ ] Create `feature/search-container.tsx`
- [ ] Create `feature/search-header.tsx`
- [ ] Implement debouncing in feature layer
- [ ] Add search analytics tracking
- [ ] Add tests for search orchestration

### Context (if needed)

- [ ] Evaluate if SearchContext is needed
- [ ] Create context if prop drilling is excessive
- [ ] Document context usage

### Integration

- [ ] Create `ui/index.ts` - barrel export for UI components
- [ ] Create `data-access/index.ts` - client-side exports
- [ ] Create `data-access/server/index.ts` - server-side exports
- [ ] Create `lib/search/index.ts` - documentation only, NO exports
- [ ] Update `app/search/page.tsx` with explicit imports
- [ ] Update all search-related imports to explicit pattern
- [ ] Remove old search components
- [ ] Verify all search features work (filters, sorting, pagination)
- [ ] Test real-time search updates
- [ ] Run checks: `pnpm exec tsc --noEmit`

## Phase 5: Earnings ✅ COMPLETE

**Status:** Migrated to `lib/earnings/` with complete layer separation

### Completed Tasks

- [x] Created `lib/earnings/` domain folder with proper structure
- [x] Created folder structure (`ui/`, `content/`, `data-access/`, `data-access/server/`, `feature/`)
- [x] Created `content/types.ts` for shared types (ActivityStatsData, CryptoAmount)
- [x] Migrated `activity-stats.tsx` to `ui/` layer
- [x] Migrated `cashback-transactions.tsx` to `ui/` layer
- [x] Created `data-access/calculate-stats.ts` for statistics calculations
- [x] Created `data-access/server/get-activity-transactions.ts` for server-side data fetching
- [x] Created `feature/activity-page.tsx` to orchestrate UI and data
- [x] Created barrel exports (`ui/index.ts`, `content/index.ts`, `data-access/index.ts`, `data-access/server/index.ts`, `feature/index.ts`)
- [x] Created `lib/earnings/index.ts` - documentation only, NO exports
- [x] Updated `app/(authenticated)/earnings/page.tsx` with explicit imports
- [x] Deleted old components:
  - `components/feature/pages/activity-page.tsx`
  - `components/feature/offers/activity-stats.tsx`
  - `components/feature/offers/cashback-transactions.tsx`
  - `lib/data/activity-transactions.ts`
  - `lib/utils/activity-stats.ts`
- [x] Fixed ESLint layer boundary violations (types moved to content layer)
- [x] Verified TypeScript compilation ✅
- [x] Verified ESLint checks ✅
- [x] Verified production build ✅

### Architecture Notes

- **UI Layer**: Pure components accepting props (ActivityStats, CashbackTransactions)
- **Content Layer**: Shared types (ActivityStatsData, CryptoAmount)
- **Data Access**: Stats calculations (client-side) and transaction fetching (server-side)
- **Feature Layer**: Orchestration component that combines UI with data
- All imports use explicit pattern from submodules

## Phase 6: Profile ✅ COMPLETE

**Status:** Migrated to `lib/profile/` with complete layer separation

### Completed Tasks

- [x] Created `lib/profile/` domain folder with proper structure
- [x] Created folder structure (`ui/`, `content/`, `data-access/`, `data-access/server/`, `feature/`)
- [x] Created `content/types.ts` for UserProfile type
- [x] Migrated `user-profile-card.tsx` to `ui/` layer (pure, prop-driven)
- [x] Migrated `avatar-randomizer.tsx` to `ui/` layer
- [x] Created `data-access/server/get-user-profile.ts` for server-side profile fetching
- [x] Created `feature/user-profile-card-container.tsx` with business logic (boost tiers, token labels)
- [x] Created `feature/profile-page.tsx` to orchestrate all profile components
- [x] Created barrel exports (`ui/index.ts`, `content/index.ts`, `data-access/index.ts`, `data-access/server/index.ts`, `feature/index.ts`)
- [x] Created `lib/profile/index.ts` - documentation only, NO exports
- [x] Updated `app/(authenticated)/profile/page.tsx` with explicit imports
- [x] Updated all UserProfile type imports across the codebase
- [x] Deleted old components:
  - `components/feature/pages/profile-page.tsx`
  - `components/feature/user/user-profile-card.tsx`
  - `components/feature/profile/avatar-randomizer.tsx`
  - `components/data-access/user-profile.ts`
- [x] Fixed ESLint layer boundary violations (types moved to content, business logic to feature)
- [x] Verified TypeScript compilation ✅
- [x] Verified ESLint checks ✅
- [x] Verified production build ✅

### Architecture Notes

- **UI Layer**: Pure components (UserProfileCard, AvatarRandomizer) - prop-driven with no business logic
- **Content Layer**: Shared types (UserProfile interface)
- **Data Access**: Server-side profile fetching only
- **Feature Layer**: Container components with business logic (UserProfileCardContainer with boost tiers, profile-page with orchestration)
- Proper separation: UI doesn't import from feature/data-access, data-access doesn't import from UI
- All imports use explicit pattern from submodules

## Phase 7: Other Domains

### Payouts

- [ ] Create `lib/payouts/` domain
- [ ] Follow lib/ pattern with explicit imports
- [ ] Create `index.ts` - documentation only, NO exports
- [ ] Add tests
- [ ] Update page and imports
- [ ] Run checks: `pnpm exec tsc --noEmit`

### Wallet

- [ ] Create `lib/wallet/` domain
- [ ] Follow lib/ pattern with explicit imports
- [ ] Create `index.ts` - documentation only, NO exports
- [ ] Preserve existing wallet adapter integration
- [ ] Add tests
- [ ] Update imports
- [ ] Run checks: `pnpm exec tsc --noEmit`

### Auth

- [ ] Create `lib/auth/` domain
- [ ] Follow lib/ pattern with explicit imports
- [ ] Create `index.ts` - documentation only, NO exports
- [ ] Preserve Supabase Auth integration
- [ ] Add tests
- [ ] Update imports
- [ ] Run checks: `pnpm exec tsc --noEmit`

### Admin

- [ ] Create `lib/admin/` domain
- [ ] Follow lib/ pattern with explicit imports
- [ ] Create `index.ts` - documentation only, NO exports
- [ ] Add tests
- [ ] Update page and imports
- [ ] Run checks: `pnpm exec tsc --noEmit`

## Final Steps

### Code Quality

- [ ] Run full type check: `pnpm exec tsc --noEmit` (zero errors)
- [ ] Run linter: `pnpm run lint` (zero errors)
- [ ] Run formatter: `pnpm run format`
- [ ] Run all tests: `pnpm run test` (all passing)
- [ ] Run build: `pnpm run build` (successful)
- [ ] Run full check: `pnpm run check` (all passing)

### Documentation

- [ ] Update CLAUDE.md with any new patterns discovered
- [ ] Add JSDoc comments to all exported functions
- [ ] Document any new contexts created
- [ ] Update architecture diagrams (if any)

### Validation

- [ ] Search for any remaining `any` types: `grep -r "any" lib/`
- [ ] Verify no files over ~300 lines: `find lib/ -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -n`
- [ ] Check for duplicate code
- [ ] Verify all domains follow lib/ pattern with explicit imports
- [ ] Verify all `lib/[domain]/index.ts` files have NO exports (documentation only)
- [ ] Test all major user flows end-to-end

### Cleanup

- [ ] Remove any commented-out old code
- [ ] Remove unused imports
- [ ] Remove unused components/files
- [ ] Clean up any TODOs or FIXMEs
- [ ] Update .gitignore if needed

### Deployment

- [ ] Create PR with refactoring changes
- [ ] Request code review
- [ ] Address review feedback
- [ ] Merge to staging branch
- [ ] Test on staging environment
- [ ] Monitor for any issues
- [ ] Merge to production when stable

## Success Metrics

After refactoring is complete, verify:

- ✅ Zero `any` types in codebase
- ✅ All code in `lib/[domain]/`, NOT `components/[domain]/`
- ✅ All domains follow layer architecture (ui/content/data-access/feature as needed)
- ✅ All imports are explicit (from `ui/`, `content`, `data-access/`, etc.)
- ✅ All `lib/[domain]/index.ts` files are documentation only (NO exports)
- ✅ All files under ~300 lines
- ✅ All exported functions have JSDoc comments
- ✅ All tests passing
- ✅ Type check passing with no errors: `pnpm exec tsc --noEmit`
- ✅ Build succeeds without warnings: `pnpm run build`
- ✅ No functionality regressions
- ✅ All database enums used directly (no magic strings)
- ✅ Proper separation of client/server data access

## Notes

- Add notes here as you encounter issues or learn new patterns during refactoring
- Document any deviations from the plan and why
- Track any technical debt that needs to be addressed later

## Related Documentation

- [REFACTOR_PROMPT.md](./REFACTOR_PROMPT.md) - Comprehensive refactoring guidelines
- [CLAUDE.md](./CLAUDE.md) - Main development guide and architecture reference
- [E2E_TEST_COVERAGE.md](./E2E_TEST_COVERAGE.md) - Feature tracking for e2e test planning
  - **Important:** When refactoring a domain, review its features in E2E_TEST_COVERAGE.md
  - Update the coverage document if new features are added or features change during refactoring
  - Consider adding tests for critical features as you refactor

---

**Last Updated:** January 15, 2025
**Current Phase:** Phase 7 - Other Domains (Payouts, Wallet, Auth)
**Overall Progress:** 6/7 phases complete (86%)
**Completed Phases:**

- ✅ Phase 1: Info Pages (FAQ, Terms, Privacy)
- ✅ Phase 2: Onboarding ("What's Fiber")
- ✅ Phase 3: Tiers (Boost Tiers Modal)
- ✅ Phase 4: Search (Algolia integration)
- ✅ Phase 5: Earnings (Activity tracking & transactions)
- ✅ Phase 6: Profile (User profile & avatar management)
  **Architecture Change:** ✅ Migrated from `components/` to `lib/` with explicit imports
