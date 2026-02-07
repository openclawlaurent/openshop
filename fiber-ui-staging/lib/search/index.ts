/**
 * Search Domain
 *
 * Handles all search functionality including Algolia integration,
 * category filtering, merchant search, and search UI components.
 *
 * ## Structure
 *
 * - `ui/` - Pure UI components (SearchCommand, SearchDialog, SearchEmptyState)
 * - `data-access/` - Client-side hooks and URL param management
 * - `data-access/server/` - Server-side search result fetching (SSR)
 * - `feature/` - Business logic and orchestration components
 *
 * ## Usage
 *
 * Always import from specific submodules, never from this index file:
 *
 * ```typescript
 * // ✅ Correct
 * import { SearchCommand } from '@/lib/search/ui'
 * import { useSearchURLParams } from '@/lib/search/data-access'
 * import { getSearchResults } from '@/lib/search/data-access/server'
 *
 * // ❌ Incorrect
 * import { SearchCommand } from '@/lib/search'
 * ```
 *
 * ## Key Features
 *
 * - Algolia unified search (merchants, products, collections)
 * - Real-time search with debouncing
 * - Category filtering
 * - Sort options (relevance, cashback, popularity)
 * - Mobile-responsive search dialog
 * - SSR-compatible with caching
 * - URL parameter management
 *
 * ## Related
 *
 * - Algolia service: `@/lib/services/algolia-search`
 * - Algolia cache: `@/lib/services/algolia-cache`
 * - Merchant filters: `@/lib/services/merchant-filters`
 */

// NO EXPORTS - Documentation only
