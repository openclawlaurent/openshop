# AI Assistant Instructions - Fiber UI Backend

## Overview

Fiber UI is a Next.js application with App Router architecture, featuring:

- **Frontend**: React 19 with Next.js (latest), Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes with Supabase database
- **Authentication**: Supabase Auth with cookie-based sessions
- **Wallet Integration**: Solana wallet adapter with mobile support
- **Environment**: Doppler for environment variable management
- **Package Manager**: pnpm (REQUIRED)

## Development Commands

### Essential Commands (RUN THESE FIRST)

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Format code (ALWAYS run before committing)
pnpm run format

# Check formatting
pnpm run format:check

# Run linting and type checking
pnpm run ci:check
```

### Build and Production

```bash
# Build for production
pnpm run build

# Start production server
pnpm start

# Lint only
pnpm run lint
```

## Backend Architecture

### API Routes Structure

```
app/api/
├── cashback-transactions/route.ts  # Cashback transaction management
├── health/route.ts                 # Health check endpoint
├── offers/route.ts                 # Offer management
├── user/
│   ├── assign-avatar/route.ts      # Avatar assignment
│   ├── avatar/route.ts             # Avatar management
│   ├── ensure-profile/route.ts     # Profile creation/validation
│   ├── onboarding/route.ts         # User onboarding
│   └── profile/route.ts            # User profile CRUD
└── wallet/
    └── verify/route.ts             # Wallet verification
```

### Database & Data Layer

- **Database**: Supabase PostgreSQL
- **ORM**: Direct Supabase client calls (no ORM)
- **Auth**: Supabase Auth with SSR support (@supabase/ssr)
- **Data Access**: Located in `components/data-access/`

### Key Backend Patterns

#### API Route Structure

```typescript
// Standard Next.js API route pattern
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  // Implementation
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();
  // Implementation
  return NextResponse.json({ success: true });
}
```

#### Authentication Pattern

```typescript
// Check authentication in API routes
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

#### Error Handling

```typescript
// Standard error response format
return NextResponse.json({ error: "Error message", details: "Optional details" }, { status: 400 });
```

## Environment Setup

### Required Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Solana
NEXT_PUBLIC_SOLANA_ENVIRONMENT=devnet|mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=your_rpc_endpoint
```

### Doppler Configuration

- Project: `fiber-ui`
- Config: `local`
- Use `doppler run --` prefix for commands needing env vars

## Code Style & Best Practices

### Formatting (CRITICAL)

```bash
# ALWAYS run before committing - this is non-negotiable
pnpm run format

# Check if formatting is needed
pnpm run format:check
```

### Code Quality Checks

```bash
# Run all checks (formatting, linting, type checking)
pnpm run ci:check

# This runs:
# 1. prettier --check .
# 2. next lint
# 3. tsc --noEmit
```

### TypeScript

- Strict TypeScript configuration
- No `any` types allowed
- All API responses should be properly typed
- Use `tsc --noEmit` for type checking

### Import Patterns

```typescript
// Absolute imports with @/ alias
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/supabase";
```

### Component Patterns

```typescript
// Server Components (default)
export default function ServerComponent() {
  // No "use client" needed
}

// Client Components (when using hooks/interactivity)
("use client");
export default function ClientComponent() {
  // Uses React hooks
}
```

## Database Schema & Operations

### User Management

- Profile creation via `user/ensure-profile`
- Avatar assignment system
- Onboarding flow

### Offers System

- Offer CRUD operations
- Cashback transaction tracking
- User offer associations

### Wallet Integration

- Solana wallet verification
- Deep link support for mobile wallets
- Auto-connection capabilities

## Testing Guidelines

**Note**: No formal test suite is currently configured. Focus on:

1. **Manual Testing**: Test all API endpoints manually
2. **Type Safety**: Ensure TypeScript compilation passes
3. **Linting**: All ESLint rules must pass
4. **Formatting**: Code must be properly formatted

### Testing Checklist

- [ ] API endpoints return correct status codes
- [ ] Authentication is properly validated
- [ ] Database operations are successful
- [ ] Error handling returns appropriate responses
- [ ] TypeScript compilation passes (`tsc --noEmit`)
- [ ] Linting passes (`next lint`)
- [ ] Code is formatted (`pnpm run format`)

## Deployment

### Pre-deployment Checklist

```bash
# 1. Format code
pnpm run format

# 2. Run all checks
pnpm run ci:check

# 3. Build project
pnpm run build

# 4. Test production build locally
pnpm start
```

### Vercel Deployment

- Configured for automatic Vercel deployment
- Environment variables managed through Doppler
- Supabase integration handles database migrations

## Common Patterns & Utilities

### Supabase Client Creation

```typescript
// Server-side (API routes, Server Components)
import { createClient } from "@/lib/supabase/server";

// Client-side (Client Components)
import { createClient } from "@/lib/supabase/client";
```

### Error Handling

```typescript
try {
  // Database operation
} catch (error) {
  console.error("Operation failed:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
```

### Response Patterns

```typescript
// Success response
return NextResponse.json({
  data: result,
  message: "Operation successful",
});

// Error response
return NextResponse.json(
  {
    error: "Error message",
    code: "ERROR_CODE",
  },
  { status: 400 },
);
```

## File Organization

```
├── app/
│   ├── api/              # API routes (backend)
│   ├── (dashboard)/      # Dashboard pages
│   └── globals.css       # Global styles
├── components/
│   ├── ui/              # Base UI components (shadcn/ui)
│   ├── feature/         # Feature-specific components
│   └── data-access/     # Data fetching utilities
├── lib/
│   ├── supabase/        # Supabase client configurations
│   └── utils.ts         # Utility functions
├── types/
│   └── supabase.ts      # Database types
└── hooks/               # Custom React hooks
```

## Security Guidelines

- **Never log sensitive data** (tokens, passwords, etc.)
- **Validate all inputs** in API routes
- **Use proper authentication checks** for protected routes
- **Sanitize user inputs** before database operations
- **Use environment variables** for sensitive configuration
- **Never commit secrets** to version control

## AI Assistant Guidelines

### DO:

- Always run `pnpm run format` before making commits
- Check code with `pnpm run ci:check` before finishing
- Use absolute imports with `@/` prefix
- Follow existing patterns in the codebase
- Handle errors gracefully with proper HTTP status codes
- Validate authentication for protected routes

### DON'T:

- Use npm or yarn (use pnpm only)
- Skip formatting checks
- Ignore TypeScript errors
- Create files without following existing patterns
- Add external dependencies without explicit approval
- Modify environment configurations without understanding impact

Remember: This is a production application. Always prioritize code quality, security, and maintainability.

---

## Frontend Algolia Migration Guide

### Overview

The backend now uses a new Algolia index structure with three distinct record types: Merchants, Collections, and Products. This guide will help you refactor the frontend to use these new indexes.

### New Index Structure

#### Available Indexes

- **wildfire_v2_merchants** - Merchant/store data
- **wildfire_v2_collections** - Product categories/collections
- **wildfire_v2_products** - Individual product data
- **wildfire_v2_unified** - All record types in one index (recommended for most use cases)

#### Record Types

**1. Merchant Records (AlgoliaMerchantRecord)**

```typescript
interface AlgoliaMerchantRecord {
  objectID: string;
  type: "merchant";
  merchantId: number;
  merchantName: string;
  domain: string;
  bestRate: string; // e.g., "5%" or "$10"
  bestRateAmount: number; // Numeric value for sorting
  merchantUrl?: string;
  logoUrl?: string;
  description?: string;
  searchKeywords?: string[];
  alternativeNames?: string[];
  collectionIds?: number[];
  productCount?: number;
  isPriority?: boolean;
  // ... more fields
}
```

**2. Collection Records (AlgoliaCollectionRecord)**

```typescript
interface AlgoliaCollectionRecord {
  objectID: string;
  type: "collection";
  collectionId: number;
  collectionName: string;
  collectionSlug: string;
  collectionType?: "category" | "sale" | "seasonal" | "curated" | "brand";
  collectionPath?: string[]; // e.g., ["Men", "Shoes", "Running"]
  collectionLevel?: number; // 0 for root, 1+ for nested
  productCount?: number;
  merchantCount?: number;
  searchKeywords?: string[];
  // ... more fields
}
```

**3. Product Records (AlgoliaProductRecord)**

```typescript
interface AlgoliaProductRecord {
  objectID: string;
  type: "product";
  productId: string;
  productTitle: string;
  merchantId: number;
  merchantName: string;
  price: number;
  priceFormatted: string; // e.g., "$99.99"
  inStock: boolean;
  cashbackRate: string; // e.g., "5%" or "$5"
  cashbackAmount: number; // Calculated value
  brand?: string;
  description?: string;
  imageUrl?: string;
  collectionIds?: number[];
  primaryCollectionId?: number;
  // ... more fields
}
```

### Migration Steps

#### 1. Update Algolia Client Configuration

**Before:**

```typescript
const searchClient = algoliasearch("APP_ID", "API_KEY");
const index = searchClient.initIndex("old_index_name");
```

**After:**

```typescript
const searchClient = algoliasearch("APP_ID", "API_KEY");
const unifiedIndex = searchClient.initIndex("wildfire_v2_unified");
// Or use separate indexes:
const merchantIndex = searchClient.initIndex("wildfire_v2_merchants");
const productIndex = searchClient.initIndex("wildfire_v2_products");
const collectionIndex = searchClient.initIndex("wildfire_v2_collections");
```

#### 2. Update Search Queries

**Unified Search (Recommended)**

```typescript
// Search all record types
const results = await unifiedIndex.search(query, {
  hitsPerPage: 20,
  facetFilters: [
    // Optional: filter by record type
    // 'type:merchant',
    // 'type:product',
    // 'type:collection'
  ],
});

// Process results by type
results.hits.forEach((hit) => {
  switch (hit.type) {
    case "merchant":
      renderMerchantResult(hit);
      break;
    case "product":
      renderProductResult(hit);
      break;
    case "collection":
      renderCollectionResult(hit);
      break;
  }
});
```

**Type-Specific Searches**

```typescript
// Search only merchants
const merchantResults = await merchantIndex.search(query, {
  facetFilters: ["isPriority:true"], // Filter featured merchants
});

// Search only products with filters
const productResults = await productIndex.search(query, {
  facetFilters: ["inStock:true", `merchantId:${selectedMerchantId}`, `price:0 TO ${maxPrice}`],
  numericFilters: [`rating >= 4.0`, `price <= ${maxPrice}`],
});

// Search collections by category
const collectionResults = await collectionIndex.search(query, {
  facetFilters: [
    "collectionType:category",
    "collectionLevel:0", // Root level categories only
  ],
});
```

#### 3. Update Faceting/Filtering

**Available Facets by Record Type**

- **Merchant Facets**: type, isPriority, collectionIds, primaryCollectionId, countries
- **Product Facets**: type, merchantId, collectionIds, brand, color, size, inStock
  - **Numeric**: price, rating, discountPercentage
- **Collection Facets**: type, collectionType, parentCollectionId, collectionLevel

**Example Faceted Search**

```typescript
const facetedSearch = await unifiedIndex.search(query, {
  facets: ["type", "brand", "merchantId", "collectionType", "price"],
  facetFilters: ["type:product", "inStock:true"],
  numericFilters: ["price: 0 TO 100", "rating >= 4.0"],
});

// Access facets
const brands = facetedSearch.facets.brand;
const priceRanges = facetedSearch.facets.price;
```

#### 4. Update Result Rendering

```typescript
function renderSearchResult(hit) {
  switch (hit.type) {
    case 'merchant':
      return (
        <div className="merchant-result">
          <img src={hit.logoUrl} alt={hit.merchantName} />
          <h3>{hit.merchantName}</h3>
          <p>Best Rate: {hit.bestRate}</p>
          <span className="domain">{hit.domain}</span>
          {hit.isPriority && <badge>Featured</badge>}
        </div>
      );

    case 'product':
      return (
        <div className="product-result">
          <img src={hit.imageUrl} alt={hit.productTitle} />
          <h3>{hit.productTitle}</h3>
          <p className="price">{hit.priceFormatted}</p>
          <p className="cashback">Cashback: {hit.cashbackRate}</p>
          <span className="merchant">{hit.merchantName}</span>
          <span className="stock">{hit.inStock ? 'In Stock' : 'Out of Stock'}</span>
        </div>
      );

    case 'collection':
      return (
        <div className="collection-result">
          <h3>{hit.collectionName}</h3>
          <p>{hit.description}</p>
          <span className="counts">{hit.productCount} products, {hit.merchantCount} merchants</span>
          <span className="type">{hit.collectionType}</span>
        </div>
      );
  }
}
```

#### 5. Update Autocomplete/InstantSearch

```typescript
// With React InstantSearch
import { InstantSearch, SearchBox, Hits, RefinementList } from 'react-instantsearch-hooks-web';

function App() {
  return (
    <InstantSearch searchClient={searchClient} indexName="wildfire_v2_unified">
      <SearchBox />

      {/* Type filter */}
      <RefinementList attribute="type" />

      {/* Product-specific filters */}
      <RefinementList attribute="brand" />
      <RefinementList attribute="inStock" />

      {/* Merchant-specific filters */}
      <RefinementList attribute="isPriority" />

      <Hits hitComponent={Hit} />
    </InstantSearch>
  );
}

function Hit({ hit }) {
  return renderSearchResult(hit);
}
```

#### 6. Handle Search Analytics

```typescript
// Track searches by type
function trackSearch(query, recordType, results) {
  analytics.track("Algolia Search", {
    query,
    recordType,
    resultCount: results.nbHits,
    processingTime: results.processingTimeMS,
  });
}

// Usage
const results = await unifiedIndex.search(query);
trackSearch(query, "unified", results);

// Or for type-specific searches
const productResults = await productIndex.search(query);
trackSearch(query, "product", productResults);
```

### Key Migration Considerations

1. **Use Unified Index First**: Start with `wildfire_v2_unified` for simpler implementation
2. **Type Discrimination**: Always check the `type` field to render results correctly
3. **Backward Compatibility**: Keep old search logic during transition period
4. **Faceting Strategy**: Plan which facets to expose based on your UI/UX needs
5. **Performance**: Consider using separate indexes for specialized search pages
6. **Caching**: Cache facet values and frequently accessed data

### Required Environment Variables

Add these to your environment configuration:

```bash
# Algolia Configuration
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your_search_only_api_key

# New Index Names
NEXT_PUBLIC_ALGOLIA_INDEX_UNIFIED=wildfire_v2_unified
NEXT_PUBLIC_ALGOLIA_INDEX_MERCHANTS=wildfire_v2_merchants
NEXT_PUBLIC_ALGOLIA_INDEX_PRODUCTS=wildfire_v2_products
NEXT_PUBLIC_ALGOLIA_INDEX_COLLECTIONS=wildfire_v2_collections
```

---

## TypeScript Best Practices

### 1. Always Follow Interface Contracts

- **NEVER** create test objects that don't fully conform to their TypeScript interfaces
- **ALWAYS** include all required properties when creating objects
- **ALWAYS** use the correct types (string vs number, required vs optional)

### 2. Test Data Creation Rules

#### ❌ BAD - Missing required properties:

```typescript
const merchant: AlgoliaMerchantRecord = {
  type: "merchant",
  objectID: "merchant_123",
  merchantName: "Test Merchant",
  merchantId: 123,
  // Missing required 'domain' property
};
```

#### ✅ GOOD - All required properties included:

```typescript
const merchant: AlgoliaMerchantRecord = {
  type: "merchant",
  objectID: "merchant_123",
  merchantName: "Test Merchant",
  merchantId: 123,
  domain: "testmerchant.com", // Required property included
  bestRate: "PERCENTAGE",
  bestRateAmount: 5.0,
};
```

### 3. Type Assertion Rules

#### ❌ BAD - Unsafe type assertion:

```typescript
const unknown = {
  type: "unknown",
  someField: "value",
} as AlgoliaUnifiedRecord; // Direct assertion can mask type errors
```

#### ✅ GOOD - Safe type assertion with unknown:

```typescript
const unknown = {
  type: "unknown",
  someField: "value",
} as unknown as AlgoliaUnifiedRecord; // Explicit unknown conversion
```

### 4. Array Property Types

#### ❌ BAD - Wrong property names/types:

```typescript
allRates: [
  {
    name: "5% Rate",
    rate: "PERCENTAGE", // Wrong: should be 'kind'
    amount: 5.0, // Wrong: should be string "5.0"
    type: "percentage", // Wrong: should be 'currency'
  },
];
```

#### ✅ GOOD - Correct property names/types:

```typescript
allRates: [
  {
    name: "5% Rate",
    kind: "PERCENTAGE", // Correct property name
    amount: "5.0", // Correct type: string
    currency: "USD", // Correct property name
  },
];
```

### 5. Undefined vs Null vs Empty Values

#### ❌ BAD - Using undefined for required numeric properties:

```typescript
const merchant = {
  ...baseMerchant,
  bestRateAmount: undefined, // Can break required number type
};
```

#### ✅ GOOD - Use appropriate default values:

```typescript
const merchant = {
  ...baseMerchant,
  bestRateAmount: 0, // Use 0 for numeric defaults
};
```

### 6. Import Requirements

- **ALWAYS** import all types used in test files
- **ALWAYS** check that type definitions match actual usage

### 7. Pre-Development Checklist

Before writing any TypeScript code:

1. ✅ Read the interface definitions in `/types/`
2. ✅ Understand all required vs optional properties
3. ✅ Check property types (string vs number vs boolean)
4. ✅ Verify array element structures
5. ✅ Run `pnpm exec tsc --noEmit` frequently during development
6. ✅ Run tests after any interface changes

### 8. Error Prevention

- **NEVER** commit code with TypeScript errors
- **ALWAYS** run `pnpm exec tsc --noEmit` before committing
- **ALWAYS** run `pnpm test` to ensure tests pass
- **ALWAYS** follow existing patterns in the codebase

### 9. Interface Evolution

When changing interfaces:

1. Update the interface definition first
2. Update all implementations
3. Update all test files
4. Verify no TypeScript errors
5. Verify all tests pass

## Code Quality Standards

### Consistent Naming

- Use descriptive variable names
- Follow existing naming conventions
- Use TypeScript's strict mode benefits

### Error Handling

- Properly handle undefined/null cases
- Use type guards when necessary
- Provide meaningful error messages

---

**Remember: TypeScript is there to help prevent runtime errors. Don't fight the type system - work with it to write safer, more maintainable code.**
