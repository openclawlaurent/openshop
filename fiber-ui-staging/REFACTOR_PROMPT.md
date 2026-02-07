# Fiber UI - Comprehensive Refactoring Prompt

## Objective

Refactor the Fiber UI Next.js/TypeScript codebase to follow best practices, improve maintainability, eliminate code duplication, and establish clear architectural boundaries.

## Refactoring Principles

### 1. TypeScript Best Practices

- **NO `any` types**: Use proper TypeScript types everywhere
- **Strict null checks**: Enable and enforce strict TypeScript mode
- **Props typing**: All component props must have explicit type definitions
- **Object props**: Use typed interfaces/types for all object properties
- **Type convention**: Use `type` for data shapes (props, API responses, database models) and `interface` for extensible contracts
- **Database types**: Generate and use Supabase-generated types directly from the database schema
- **Enum usage**: Import and use database enums directly (no magic strings)

### 2. Architecture - 3-Layer Component System

All code should be organized into domain-specific folders with strict separation:

```
components/
├── ui/                          # Shared, reusable UI components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── search/                      # Search domain
│   ├── ui/                      # Pure, prop-driven UI components
│   │   ├── search-input.tsx
│   │   ├── search-filters.tsx
│   │   └── search-results.tsx
│   ├── data-access/            # Data fetching & API calls
│   │   ├── use-search.ts       # Client-side hook
│   │   ├── index.ts            # Client exports
│   │   └── server/             # Server-side data access
│   │       └── index.ts
│   ├── feature/                # Business logic & orchestration
│   │   └── search-container.tsx
│   └── index.ts                # Barrel export
├── earnings/                    # Earnings domain
│   ├── ui/
│   ├── data-access/
│   ├── feature/
│   └── index.ts
├── profile/                     # Profile domain
│   ├── ui/
│   ├── data-access/
│   ├── feature/
│   └── index.ts
├── onboarding/                  # Onboarding domain ("What's Fiber" link)
│   ├── ui/
│   ├── data-access/
│   ├── feature/
│   └── index.ts
├── tiers/                       # Boost tiers modal domain
│   ├── ui/
│   ├── data-access/
│   ├── feature/
│   └── index.ts
├── info-pages/                  # Static info pages (FAQ, Terms, Privacy)
│   ├── ui/
│   └── index.ts
└── [other-domains]/
```

#### Layer Responsibilities

**UI Layer (`ui/`):**

- Pure, dumb components
- Prop-driven only (no hooks for data fetching)
- No business logic
- Presentational concerns only
- Can use hooks for local UI state (useState, useReducer for forms/toggles)
- Can use React Context for cross-cutting concerns (theme, auth status)
- Highly reusable across the domain
- Example: `<SearchInput value={query} onChange={handleChange} />`

**Data Access Layer (`data-access/`):**

- All API calls and data fetching
- Custom hooks (e.g., `useSearch()`, `useEarnings()`)
- Supabase queries
- External API integrations
- Type definitions for API responses
- Separate server/client exports:
  - `index.ts` - client-side exports
  - `server/index.ts` - server-side exports (SSR, Server Components, API routes)
- No UI components
- Example: `export function useSearch(query: string): SearchResult`

**Feature Layer (`feature/`):**

- Orchestrates UI + Data Access
- Business logic and calculations (e.g., earnings calculations)
- State management
- Component composition
- User interaction handling
- Example: `<SearchContainer />` uses `useSearch()` and renders `<SearchInput />`, `<SearchResults />`

### 3. File Organization Rules

#### Co-location

- Keep related files together:
  ```
  search/
  ├── ui/
  │   ├── search-input.tsx
  │   ├── search-input.test.tsx
  │   └── search-input.types.ts
  ```

#### Barrel Exports

- Every domain folder has an `index.ts` that exports public APIs
- Enables clean imports: `import { SearchContainer } from '@/components/search'`

#### Import Strategy

- Absolute imports for cross-domain: `@/components/search/ui/search-input`
- Relative imports for closely related files within same folder: `./search-input.types`

#### File Size Limits

- Target max: **~300 lines per file**
- Complex components should be split into:
  - Sub-components (extract logical sections)
  - Custom hooks (extract stateful logic)
  - Utility functions (extract pure logic)
- Prioritize readability and maintainability over strict line counts

### 4. React Patterns

#### Context for Prop Drilling

- Use React Context to avoid excessive prop drilling
- Create domain-specific contexts where appropriate
- Contexts should use simple `useState` unless complex state requires reducers
- Examples: `UserProfileContext`, `SearchContext`, `EarningsContext`

#### Component Props

- UI components must accept `className` prop for consumer overrides
- No compound component patterns (keep it simple)
- Use `children` for composition when appropriate
- Prefer multiple simple components over complex render prop patterns

### 5. Data Access Patterns

#### Custom Hooks

- All data fetching should be wrapped in custom hooks
- Example: `useOffers()`, `useEarnings()`, `useUserProfile()`
- Use native `fetch` API (no React Query/SWR for now)

#### Server vs Client

- **Server Components** (default): For SSR, initial data loading
- **Client Components** (`"use client"`): For interactivity, hooks, event handlers
- Data access should have separate server/client exports:

  ```typescript
  // data-access/index.ts (client)
  export function useOffers() { ... }

  // data-access/server/index.ts (server)
  export async function getOffersSSR() { ... }
  ```

#### Database Integration

- Generate TypeScript types from Supabase schema
- Use Supabase-generated enums directly
- Example:

  ```typescript
  import { Database } from "@/types/database";

  type OfferStatus = Database["public"]["Enums"]["offer_status"];
  ```

### 6. Testing Strategy

#### What to Test

- ✅ **Feature components**: Basic smoke tests (renders without crashing)
- ✅ **Utility libraries**: Test all exported functions
- ✅ **Business logic**: Test calculations and transformations
- ❌ **UI components**: No snapshot tests (for now)
- ❌ **Data access**: No Supabase/API mocking (for now)
- ❌ **API routes**: No API route tests (for now)

#### Test Organization

- Co-located: `component-name.test.tsx` next to `component-name.tsx`
- Use Jest + React Testing Library (already configured)
- Basic tests to ensure refactoring doesn't break functionality

#### Test Pattern

```typescript
// search-container.test.tsx
import { render, screen } from '@testing-library/react'
import { SearchContainer } from './search-container'

describe('SearchContainer', () => {
  it('renders without crashing', () => {
    render(<SearchContainer />)
    expect(screen.getByTestId('search-container')).toBeInTheDocument()
  })
})
```

### 7. Code Quality & Validation

#### Runtime Validation

- Use **Zod** for:
  - API response validation
  - Form validation
  - Environment variable validation
- Example:

  ```typescript
  import { z } from "zod";

  const OfferSchema = z.object({
    id: z.string(),
    title: z.string(),
    rate: z.number(),
  });

  type Offer = z.infer<typeof OfferSchema>;
  ```

#### ESLint Rules

- Enforce TypeScript strictness
- No `any` types allowed
- Unused variables/imports flagged
- Consistent import ordering

#### Pre-commit Hooks

- Type checking: `pnpm exec tsc --noEmit`
- Linting: `pnpm run lint`
- Formatting: `pnpm run format`
- Tests: `pnpm run test`
- Build: `pnpm run build`

#### JSDoc Comments

- Add JSDoc comments for:
  - All exported functions
  - Complex business logic
  - Public APIs
- Example:
  ```typescript
  /**
   * Calculates user-specific earning rate with boost tier applied
   * @param offer - The merchant offer
   * @param token - User's selected payout token
   * @param boostTier - User's boost tier (if any)
   * @returns Calculated rate details with boost applied
   */
  export function calculateUserRateDetails(
    offer: Offer,
    token: string,
    boostTier: BoostTier | null,
  ): UserRateDetails {
    // ...
  }
  ```

### 8. Migration Strategy

#### Incremental Rollout

Refactor one domain at a time in this order:

1. **Phase 1 - Info Pages** (easiest, static content)
   - FAQ, Terms, Privacy pages
   - Establish patterns and templates

2. **Phase 2 - Onboarding**
   - "What's Fiber" link flow
   - Practice with simple interactive components

3. **Phase 3 - Tiers**
   - Boost tiers modal
   - Moderate complexity, isolated feature

4. **Phase 4 - Search**
   - Search domain (most complex)
   - Algolia integration, filtering, sorting
   - Sets pattern for complex data-heavy features

5. **Phase 5 - Earnings**
   - Earnings tracking and display
   - Complex calculations

6. **Phase 6 - Profile**
   - User profile management
   - Forms, validation, updates

7. **Phase 7 - Other Domains**
   - Payouts, Admin, etc.

#### Pattern Enforcement

- **Remove old patterns immediately** after refactoring a domain
- No mixing of old and new patterns within a domain
- Document migration progress in a checklist

### 9. Before/After Examples

#### ❌ Before (Anti-patterns)

```typescript
// Bad: Using any
function processData(data: any) {
  return data.items.map((item: any) => item.value)
}

// Bad: Props not typed
export function SearchInput({ value, onChange }) {
  return <input value={value} onChange={onChange} />
}

// Bad: Data fetching in UI component
export function OffersList() {
  const [offers, setOffers] = useState([])

  useEffect(() => {
    fetch('/api/offers').then(r => r.json()).then(setOffers)
  }, [])

  return <div>{offers.map(offer => ...)}</div>
}

// Bad: Magic strings for status
if (offer.status === 'active') { ... }

// Bad: Component mixing concerns (300+ lines, data + UI + logic)
export function MassiveComponent() {
  // 150 lines of data fetching
  // 100 lines of business logic
  // 50 lines of JSX
}
```

#### ✅ After (Best practices)

```typescript
// Good: Proper typing
type DataItem = {
  value: string
  id: string
}

type ProcessedData = {
  items: DataItem[]
}

function processData(data: ProcessedData): string[] {
  return data.items.map(item => item.value)
}

// Good: Typed props
type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SearchInput({ value, onChange, className }: SearchInputProps) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn('base-styles', className)}
    />
  )
}

// Good: Data fetching in data-access layer
// data-access/use-offers.ts
export function useOffers(): { offers: Offer[], loading: boolean } {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOffers().then(data => {
      setOffers(data)
      setLoading(false)
    })
  }, [])

  return { offers, loading }
}

// Good: UI component is pure
// ui/offers-list.tsx
type OffersListProps = {
  offers: Offer[]
  onOfferClick: (offer: Offer) => void
}

export function OffersList({ offers, onOfferClick }: OffersListProps) {
  return (
    <div>
      {offers.map(offer => (
        <OfferCard key={offer.id} offer={offer} onClick={() => onOfferClick(offer)} />
      ))}
    </div>
  )
}

// Good: Feature component orchestrates
// feature/offers-container.tsx
export function OffersContainer() {
  const { offers, loading } = useOffers()

  const handleOfferClick = (offer: Offer) => {
    // business logic
  }

  if (loading) return <LoadingSpinner />

  return <OffersList offers={offers} onOfferClick={handleOfferClick} />
}

// Good: Using database enums
import { Database } from '@/types/database'

type OfferStatus = Database['public']['Enums']['offer_status']

if (offer.status === 'active' as OfferStatus) { ... }

// Good: Split into focused files
// feature/offers-container.tsx (100 lines)
// data-access/use-offers.ts (50 lines)
// ui/offers-list.tsx (50 lines)
// ui/offer-card.tsx (40 lines)
```

### 10. Type Generation from Supabase

#### Using Supabase MCP (Recommended)

This project has Supabase MCP configured! Claude can now access your database schema directly without manual type generation.

**MCP Configuration:** See [MCP_SETUP.md](./MCP_SETUP.md)

**Benefits:**

- Real-time schema inspection
- No manual type generation needed
- Accurate enum values from database
- Instant validation of table structures

#### Manual Type Generation (Alternative)

If MCP is not available, use the Supabase CLI:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref pqzdcscbwwapxsuygizi

# Generate types
supabase gen types typescript --linked > types/database.types.ts
```

#### Using Generated Types

```typescript
import { Database } from "@/types/database.types";

// Tables
type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
type UserProfileInsert = Database["public"]["Tables"]["user_profiles"]["Insert"];
type UserProfileUpdate = Database["public"]["Tables"]["user_profiles"]["Update"];

// Enums
type OfferStatus = Database["public"]["Enums"]["offer_status"];
type TransactionStatus = Database["public"]["Enums"]["transaction_status"];

// Functions return types
type GetOffersResponse = Database["public"]["Functions"]["get_offers"]["Returns"];
```

### 11. Domain-Specific Considerations

#### Search Domain

- Keep existing Algolia caching functionality
- Move URL param management to data-access layer
- Real-time filtering/sorting in feature layer
- Debouncing in data-access hooks

#### Earnings Domain

- Keep complex calculations in feature layer
- Server-side calculations should stay server-side
- Use utilities for shared calculation logic

#### Profile Domain

- Form validation with Zod
- Keep existing functionality (no new features)
- Optimistic updates for better UX

#### Info Pages Domain

- Static content components
- Minimal logic, mostly presentational
- Good starting point for refactoring

## Refactoring Checklist (Per Domain)

For each domain being refactored:

- [ ] Create domain folder structure (`ui/`, `data-access/`, `feature/`)
- [ ] Generate/update Supabase types for domain tables
- [ ] Create type definitions (no `any` types)
- [ ] Extract data fetching into `data-access/` with custom hooks
- [ ] Create pure UI components in `ui/`
- [ ] Build feature components that orchestrate UI + data
- [ ] Add React Context if prop drilling is excessive
- [ ] Add basic tests for feature components and utilities
- [ ] Add JSDoc comments to exported functions
- [ ] Create barrel exports (`index.ts`)
- [ ] Add Zod validation where appropriate
- [ ] Update imports throughout codebase
- [ ] Remove old code/patterns
- [ ] Verify all tests pass (`pnpm run test`)
- [ ] Run type check (`pnpm exec tsc --noEmit`)
- [ ] Run formatter (`pnpm run format`)
- [ ] Run linter (`pnpm run lint`)
- [ ] Run build (`pnpm run build`)

## Success Criteria

A successfully refactored domain should have:

1. ✅ Zero `any` types
2. ✅ Clear 3-layer separation (ui/data-access/feature)
3. ✅ All files under ~300 lines
4. ✅ No duplicate code
5. ✅ Proper TypeScript types for all props and data
6. ✅ Database enums used directly (no magic strings)
7. ✅ Data fetching isolated in data-access layer
8. ✅ UI components are pure and prop-driven
9. ✅ Basic tests added and passing
10. ✅ JSDoc comments on exported functions
11. ✅ No functionality regressions (app works exactly the same)

## Questions or Issues?

If you encounter:

- Unclear requirements → Ask before proceeding
- Breaking changes → Discuss migration strategy
- Complex refactoring → Break into smaller PRs
- Test failures → Fix before moving to next domain

## Additional Resources

### Internal Documentation

- [CLAUDE.md](./CLAUDE.md) - Main development guide
- [REFACTOR_CHECKLIST.md](./REFACTOR_CHECKLIST.md) - Track refactoring progress
- [E2E_TEST_COVERAGE.md](./E2E_TEST_COVERAGE.md) - Feature tracking for e2e tests
- [ALGOLIA_CACHE.md](./ALGOLIA_CACHE.md) - Search caching documentation
- [MCP_SETUP.md](./MCP_SETUP.md) - MCP configuration guide

### External Resources

- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/
- Supabase Type Generation: https://supabase.com/docs/guides/api/generating-types
- Zod Documentation: https://zod.dev/
- React Testing Library: https://testing-library.com/react
