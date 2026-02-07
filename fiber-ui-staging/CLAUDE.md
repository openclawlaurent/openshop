# Fiber UI - Next.js Supabase App

## Overview

A Next.js application built with Supabase, featuring wallet integration (Solana), offer management, and user authentication. Uses shadcn/ui components with Tailwind CSS styling.

## Package Manager

- Uses **pnpm** for package management
- All commands should use `pnpm` instead of `npm` or `yarn`

## Development Commands

- `pnpm run dev` - Start development server with Doppler env vars and Turbopack
- `pnpm run build` - Build production app with Doppler env vars
- `pnpm run start` - Start production server with Doppler env vars
- `pnpm run lint` - Run ESLint for code quality checks
- `pnpm run test` - Run Jest test suite
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run check` - Run full CI check (format, lint, typecheck, test, build)

## Environment Management

- Uses **Doppler** for environment variable management
- Config: `doppler.yaml` - project: `fiber-ui`, config: `local`
- Required environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SECRET_KEY` (service role key for server-side)
  - `NEXT_PUBLIC_SOLANA_ENVIRONMENT`
  - `NEXT_PUBLIC_SOLANA_RPC_ENDPOINT`

## Tech Stack

- **Framework**: Next.js (latest) with App Router
- **Database**: Supabase with SSR (@supabase/ssr)
- **Authentication**: Supabase Auth with cookies
- **Environment**: Doppler for secret management
- **MCP**: Supabase MCP + Filesystem MCP for enhanced development (see [MCP_SETUP.md](./MCP_SETUP.md))
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks + React Context
- **Validation**: Zod for runtime validation
- **Testing**: Jest + React Testing Library
- **Icons**: Lucide React, Radix Icons
- **Wallet**: Solana wallet adapter with mobile support
- **Search**: Algolia with caching
- **Analytics**: PostHog
- **UI Library**: Radix UI primitives with custom styling

## Architecture Overview

### 🏗️ Domain-Based Architecture

The codebase follows a domain-based architecture. **Use `lib/` for all new code, NOT `components/`.**

```
lib/
├── [domain]/                    # Domain-specific folder (e.g., faq, search, earnings)
│   ├── ui/                      # Pure, prop-driven UI components
│   │   └── index.ts            # export * from './component-name'
│   ├── content/                # Static content (for domains that need it)
│   │   └── index.ts            # Content data and types
│   ├── data-access/            # Data fetching & API calls (if needed)
│   │   ├── index.ts            # export * from './hook-name' (client-side)
│   │   └── server/             # Server-side exports
│   │       └── index.ts        # export * from './function-name'
│   ├── feature/                # Business logic & orchestration (if needed)
│   │   └── index.ts            # export * from './feature-name'
│   └── index.ts                # Documentation only, NO exports
│
├── utils/                       # Shared utility functions
├── hooks/                       # Shared custom hooks
├── services/                    # External service integrations (Algolia, etc.)
└── ...                         # Other shared code

components/
├── ui/                          # ONLY shadcn/ui components (existing, legacy)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
```

**Key principles**:

- New domains go in `lib/[domain]/`, not `components/[domain]/`
- Use `export *` in barrel files (index.ts) for automatic re-exports

#### Import Dependency Flow

```
┌─────────────────────────────────────────────────────┐
│                      Pages                          │
│                  (app/**/page.tsx)                  │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
              ┌──────────────┐
              │   Feature    │ ◄── Orchestrates everything
              └──────┬───────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌────────┐  ┌─────────┐  ┌──────────────┐
   │   UI   │  │ Content │  │ Data Access  │
   └────┬───┘  └─────────┘  └──────────────┘
        │
        │ (types only)
        ▼
   ┌─────────┐
   │ Content │
   └─────────┘

Rules:
✅ Feature can import: UI, Content, Data Access
✅ UI can import: Content (types only), other UI
✅ Data Access can import: Services, Utils
❌ UI cannot import: Feature, Data Access
❌ Content cannot import: Anything
❌ Data Access cannot import: UI, Feature
```

#### Layer Responsibilities & Import Rules

**UI Layer** (`ui/`):

- Pure, dumb components (prop-driven)
- No data fetching or business logic
- Can use local state hooks (useState, useReducer) for UI state only
- Can consume React Context for cross-cutting concerns
- Must accept `className` prop for style overrides
- Highly reusable within the domain
- **Allowed imports**:
  - ✅ `@/components/ui/*` (shared UI components)
  - ✅ `@/lib/[domain]/content` (types only, NOT data)
  - ✅ Other UI components within same domain
- **Forbidden imports**:
  - ❌ `@/lib/[domain]/feature` (UI cannot import features)
  - ❌ `@/lib/[domain]/data-access` (UI cannot fetch data)
  - ❌ `@/lib/[domain]/content` data (only types allowed)

**Content Layer** (`content/`):

- Static content for the domain (FAQ items, email templates, etc.)
- Type definitions for content
- No logic, just data and types
- Always in a directory with `index.ts` barrel export
- **Allowed imports**:
  - ✅ None - content is pure data
- **Forbidden imports**:
  - ❌ Everything (content has no dependencies)

**Data Access Layer** (`data-access/`):

- All API calls and data fetching
- Custom hooks (e.g., `useOffers()`, `useSearch()`)
- Supabase queries
- External API integrations
- Type definitions for API responses
- **Separate exports for client/server**:
  - `index.ts` - client-side hooks and functions
  - `server/index.ts` - server-side functions (SSR, Server Components)
- **Allowed imports**:
  - ✅ `@/lib/supabase/*` (database client)
  - ✅ `@/lib/services/*` (external services)
  - ✅ `@/lib/utils/*` (utilities)
  - ✅ `@/types/*` (shared types)
- **Forbidden imports**:
  - ❌ `@/lib/[domain]/ui` (data-access cannot import UI)
  - ❌ `@/lib/[domain]/feature` (data-access cannot import features)

**Feature Layer** (`feature/`):

- Orchestrates UI + Data Access + Content
- Business logic and calculations
- State management
- Component composition
- User interaction handling
- **Allowed imports**:
  - ✅ `@/lib/[domain]/ui` (UI components)
  - ✅ `@/lib/[domain]/content` (static data)
  - ✅ `@/lib/[domain]/data-access` (data fetching)
  - ✅ `@/lib/utils/*` (utilities)
  - ✅ `@/lib/hooks/*` (shared hooks)
- **Forbidden imports**:
  - ❌ `@/lib/[other-domain]/feature` (features don't import other features)
  - ✅ Exception: Can import other domain's UI/data-access if needed

### Domain Organization

Current domains in `lib/`:

- **faq/** - FAQ page (UI + static content)
- **terms/** - Terms of Service page (UI + static content)
- **privacy/** - Privacy Policy page (UI + static content)

Legacy domains in `components/` (to be migrated):

- **search/** - Search functionality with Algolia integration
- **earnings/** - Earnings tracking and calculations
- **profile/** - User profile management
- **onboarding/** - User onboarding flow ("What's Fiber")
- **tiers/** - Boost tiers modal and management
- **auth/** - Authentication components
- **wallet/** - Wallet connection and management
- **admin/** - Admin dashboard features

## TypeScript Standards

### Type Conventions

- Use `type` for data shapes (props, API responses, database models)
- Use `interface` for extensible contracts
- **NEVER use `any`** - always use proper types
- All component props must have explicit type definitions
- All object properties must be typed

### Database Types

**Using Supabase MCP (Recommended):**

This project has Supabase MCP configured for direct database schema access. See [MCP_SETUP.md](./MCP_SETUP.md) for details.

**Manual type generation (if needed):**

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref pqzdcscbwwapxsuygizi

# Generate types
supabase gen types typescript --linked > types/database.types.ts
```

**Usage:**

```typescript
import { Database } from "@/types/database.types";

// Table types
type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
type UserProfileInsert = Database["public"]["Tables"]["user_profiles"]["Insert"];
type UserProfileUpdate = Database["public"]["Tables"]["user_profiles"]["Update"];

// Enum types (use directly, no magic strings)
type OfferStatus = Database["public"]["Enums"]["offer_status"];
type TransactionStatus = Database["public"]["Enums"]["transaction_status"];
```

### Type Definition Location

- **Co-located**: Types should live next to the code that uses them
- **Domain types**: In `lib/[domain]/` - either in the same file or as `.types.ts`
  - Content types: `lib/faq/content.ts` exports `FaqItem` interface
  - Data types: `lib/[domain]/data-access/` as `.types.ts` files
  - UI types: `lib/[domain]/ui/` - in the same file or as `.types.ts`
- **Shared types**: In `types/` directory (e.g., `algolia.ts`, `database.types.ts`)

## Component Patterns

### File Organization

**Domain structure example:**

```
lib/faq/
├── ui/
│   ├── faq-list.tsx         # Pure UI component (prop-driven)
│   ├── faq-item.tsx         # Pure UI component
│   └── index.ts             # export * from './faq-list'; export * from './faq-item'
├── content/
│   └── index.ts             # FAQ items + types
├── feature/
│   ├── faq-page.tsx         # Orchestrates content + UI
│   └── index.ts             # export * from './faq-page'
└── index.ts                 # Documentation only, NO exports
```

**Barrel export pattern - use `export *` for automatic re-exports:**

```typescript
// ✅ DO THIS - automatic re-export (less maintenance)
// lib/faq/ui/index.ts
export * from "./faq-list";
export * from "./faq-item";

// ❌ DON'T DO THIS - explicit named exports (requires manual updates)
// lib/faq/ui/index.ts
export { FaqList } from "./faq-list";
export { FaqItem } from "./faq-item";
```

**Layer separation - UI components are pure and prop-driven:**

```typescript
// ❌ DON'T DO THIS - UI importing content directly
// lib/faq/ui/faq-list.tsx
import { faqItems } from '../content'
export function FaqList() {
  return <div>{faqItems.map(...)}</div>
}

// ✅ DO THIS - Feature orchestrates, UI is pure
// lib/faq/feature/faq-page.tsx
import { FaqList } from '../ui'
import { faqItems } from '../content'
export function FaqPage() {
  return <FaqList items={faqItems} />
}
```

**NO top-level barrel exports - always import explicitly:**

```typescript
// ❌ DON'T DO THIS - not explicit
import { FaqPage } from "@/lib/faq";

// ✅ DO THIS - explicit and clear
import { FaqPage } from "@/lib/faq/feature";
```

### Import Strategy

- **Explicit imports only**: Always import from specific submodules (`feature`, `content`, `ui`, `data-access`)
- **Pages import features**: `import { FaqPage } from '@/lib/faq/feature'`
- **Features import UI + content**: Features orchestrate by importing from `ui/` and `content/`
- **UI stays pure**: UI components only import types from `content/`, never data
- **Within domain**: Use relative imports `import { FaqItem } from '../content'`
- **Cross-domain**: Use absolute explicit paths:
  - `import { FaqPage } from '@/lib/faq/feature'`
  - `import { FaqList } from '@/lib/faq/ui'` (rare - usually import feature)
  - `import { useSearch } from '@/lib/search/data-access'`
- **Shared UI**: `import { Button } from '@/components/ui/button'`

### Component Styling

- Uses `cn()` utility for className merging: `cn(baseClasses, conditionalClasses)`
- Tailwind CSS with custom design tokens
- Dark/light theme support via next-themes
- All UI components accept optional `className` prop

### File Size Guidelines

- **Target: ~300 lines per file max**
- Split large files into:
  - Sub-components (extract logical sections)
  - Custom hooks (extract stateful logic)
  - Utility functions (extract pure logic)

## Data Fetching Patterns

### Client-Side

**Custom hooks in `data-access/`:**

```typescript
// components/search/data-access/use-search.ts
export function useSearch(query: string): { results: SearchResult[]; loading: boolean } {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // fetch logic
  }, [query]);

  return { results, loading };
}
```

**Usage in feature components:**

```typescript
// components/search/feature/search-container.tsx
import { useSearch } from '../data-access'

export function SearchContainer() {
  const { results, loading } = useSearch(query)
  return <SearchResults results={results} loading={loading} />
}
```

### Server-Side

**Server exports in `data-access/server/`:**

```typescript
// components/search/data-access/server/index.ts
export async function getSearchResultsSSR(query: string): Promise<SearchResult[]> {
  const supabase = await createClient();
  // server-side fetch logic
}
```

**Usage in page components:**

```typescript
// app/search/page.tsx
import { getSearchResultsSSR } from '@/components/search/data-access/server'

export default async function SearchPage({ searchParams }: PageProps) {
  const results = await getSearchResultsSSR(searchParams.q)
  return <SearchContainer initialResults={results} />
}
```

### Algolia Search Caching

- Uses Next.js `unstable_cache` for 1-hour persistent caching
- Cache persists across serverless instances on Vercel
- See [ALGOLIA_CACHE.md](./ALGOLIA_CACHE.md) for cache clearing options
- Location: `lib/services/algolia-cache.ts`

## State Management

### React Context

Use React Context to avoid prop drilling:

```typescript
// contexts/search-context.tsx
type SearchContextValue = {
  query: string
  setQuery: (query: string) => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('')
  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearchContext() {
  const context = useContext(SearchContext)
  if (!context) throw new Error('useSearchContext must be used within SearchProvider')
  return context
}
```

### State Guidelines

- Use `useState` for simple state
- Use `useReducer` for complex state (forms with multiple fields)
- Use Context for cross-cutting concerns (auth, user profile, theme)
- URL params managed in data-access layer (use `useSearchParams`)

## Validation

### Zod for Runtime Validation

Use Zod for:

- API response validation
- Form validation
- Environment variable validation

```typescript
import { z } from "zod";

const OfferSchema = z.object({
  id: z.string(),
  title: z.string(),
  rate: z.number().min(0),
  status: z.enum(["active", "inactive", "pending"]),
});

type Offer = z.infer<typeof OfferSchema>;

// Validate API responses
const offers = OfferSchema.array().parse(apiResponse);

// Validate form input
const formSchema = z.object({
  email: z.string().email(),
  amount: z.number().positive(),
});
```

## Testing

### Test Strategy

**What to test:**

- ✅ Feature components (basic smoke tests)
- ✅ Utility functions (all exported functions)
- ✅ Business logic (calculations, transformations)
- ❌ UI components (not required)
- ❌ Data access (no mocking for now)
- ❌ API routes (not required)

### Test Patterns

**Co-located tests:**

```typescript
// components/search/feature/search-container.test.tsx
import { render, screen } from '@testing-library/react'
import { SearchContainer } from './search-container'

describe('SearchContainer', () => {
  it('renders without crashing', () => {
    render(<SearchContainer />)
    expect(screen.getByTestId('search-container')).toBeInTheDocument()
  })
})
```

**Utility tests:**

```typescript
// lib/utils/user-rate-calculator.test.ts
import { calculateUserRateDetails } from "./user-rate-calculator";

describe("calculateUserRateDetails", () => {
  it("calculates rate with boost tier applied", () => {
    const result = calculateUserRateDetails(mockOffer, "SOL", mockBoostTier);
    expect(result.boostedRate).toBe(5.5);
  });
});
```

## Code Quality

### ESLint Rules

- Enforce TypeScript strictness (no `any` types)
- Flag unused variables/imports
- Consistent import ordering
- Prettier integration
- **Layer import boundary enforcement**: ESLint automatically prevents architectural violations
  - UI cannot import from feature or data-access
  - Data-access cannot import from UI or feature
  - Content cannot import from any layer in the same domain
  - Violations will cause lint failures with helpful error messages

### Pre-commit Hooks

Configured to run:

- Type checking: `pnpm exec tsc --noEmit`
- Linting: `pnpm run lint`
- Formatting: `pnpm run format`
- Tests: `pnpm run test`
- Build: `pnpm run build`

### JSDoc Comments

Add JSDoc for:

- All exported functions
- Complex business logic
- Public APIs

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
  // implementation
}
```

## Authentication & Authorization

### Supabase Auth

- Cookie-based sessions
- Works across Client/Server Components, Route Handlers, Middleware
- Two client types:
  - **Standard client**: Row-Level Security (RLS) enforced
  - **Service role client**: Bypasses RLS (server-side only, never expose to client)

```typescript
// Standard client (RLS enforced)
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();

// Service role client (bypasses RLS)
import { createServiceRoleClient } from "@/lib/supabase/server";
const supabase = createServiceRoleClient();
```

## Wallet Integration

- Solana wallet adapter with mobile support
- Deep link support for mobile wallets
- Auto-connection and manual connection modes
- Wallet state managed in context

## File Naming Conventions

- **kebab-case** for files and directories
- **PascalCase** for component exports
- **camelCase** for functions and variables
- API routes: `route.ts` in directory structure
- Pages: `page.tsx` in directory structure
- Tests: `*.test.tsx` or `*.test.ts`
- Types: `*.types.ts` (if complex, otherwise co-locate in same file)

## Development Tips

- Use `doppler run --` prefix for commands that need environment variables
- Components should be `"use client"` if they use hooks or interactivity
- Server components by default (no `"use client"` directive needed)
- Error boundaries and loading states are handled at component level
- Toast notifications via sonner library
- Always run `pnpm run check` before committing

## Testing & Quality Assurance

### Unit & Integration Testing

- **Framework**: Jest + React Testing Library
- **What to test**: Feature components, utility functions, business logic
- **What to skip**: UI components, data access (for now), API routes
- See testing section above for patterns and examples

### E2E Test Coverage

- See [E2E_TEST_COVERAGE.md](./E2E_TEST_COVERAGE.md) for comprehensive feature tracking
- All major features across domains are documented for e2e test planning
- Update the coverage document when adding new features or implementing tests
- Critical user flows and test priorities are outlined

## Refactoring Guidelines

See [REFACTOR_PROMPT.md](./REFACTOR_PROMPT.md) and [REFACTOR_CHECKLIST.md](./REFACTOR_CHECKLIST.md) for comprehensive refactoring guidelines.

**Key principles:**

- NO `any` types
- **Use `lib/[domain]/` for all new code** (NOT `components/[domain]/`)
- Strict layer architecture (ui/content/data-access/feature as needed)
- Explicit imports only (no top-level barrel exports)
- Domain-based organization
- Files under ~300 lines
- Database enums used directly
- Proper TypeScript everywhere

**Completed migrations:**

1. ✅ FAQ - `lib/faq/` (ui/ + content.ts pattern)
2. ✅ Terms - `lib/terms/` (ui/ + content.ts pattern)
3. ✅ Privacy - `lib/privacy/` (ui/ + content.ts pattern)

**Legacy code to migrate:**

- Onboarding (components/onboarding/) → migrate to lib/
- Tiers, Search, Earnings, Profile, etc. → migrate to lib/

## Deployment

- Configured for Vercel deployment
- Environment variables managed through Doppler
- Supabase integration handles database setup
- Automatic deployments from `staging` branch

## Common Patterns Reference

### ❌ Anti-patterns (avoid these)

```typescript
// ❌ Using any
function process(data: any) {}

// ❌ Untyped props
export function Component({ value, onChange }) {}

// ❌ Data fetching in UI component
export function List() {
  useEffect(() => {
    fetch("/api/data");
  }, []);
}

// ❌ Magic strings
if (status === "active") {
}

// ❌ Massive files (500+ lines mixing concerns)
```

### ✅ Best practices (do these)

```typescript
// ✅ Proper typing
type Data = { id: string; value: number };
function process(data: Data): string {}

// ✅ Typed props
type ComponentProps = {
  value: string;
  onChange: (value: string) => void;
};
export function Component({ value, onChange }: ComponentProps) {}

// ✅ Data fetching in data-access
export function useData() {
  // custom hook with fetch logic
}

// ✅ Database enums
type Status = Database["public"]["Enums"]["status"];
if (status === ("active" as Status)) {
}

// ✅ Focused files (<300 lines, single responsibility)
```

## Additional Resources

- [Refactoring Guide](./REFACTOR_PROMPT.md)
- [Refactoring Checklist](./REFACTOR_CHECKLIST.md)
- [E2E Test Coverage Tracking](./E2E_TEST_COVERAGE.md)
- [Algolia Cache Documentation](./ALGOLIA_CACHE.md)
- [MCP Setup Guide](./MCP_SETUP.md)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Supabase Type Generation](https://supabase.com/docs/guides/api/generating-types)
- [Zod Documentation](https://zod.dev/)
