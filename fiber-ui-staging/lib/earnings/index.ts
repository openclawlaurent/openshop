/**
 * Earnings Domain
 *
 * Handles all earnings/activity tracking functionality including transaction history,
 * stats calculation, and blockchain transaction display.
 *
 * ## Structure
 *
 * - `ui/` - Pure UI components (ActivityStats, CashbackTransactions)
 * - `data-access/server/` - Server-side transaction fetching and stats calculation (SSR)
 * - `feature/` - Business logic and orchestration components
 * - `content/types` - Type definitions
 *
 * ## Usage
 *
 * Always import from specific submodules, never from this index file:
 *
 * ```typescript
 * // ✅ Correct
 * import { ActivityPageContent } from '@/lib/earnings/feature'
 * import { ActivityStats } from '@/lib/earnings/ui'
 * import { getActivityTransactions } from '@/lib/earnings/data-access/server'
 *
 * // ❌ Incorrect
 * import { ActivityPageContent } from '@/lib/earnings'
 * ```
 *
 * ## Key Features
 *
 * - Real-time transaction tracking
 * - Multi-token earnings display (partner tokens like BONK, USDC, SOL)
 * - Blockchain transaction status monitoring
 * - Pending vs. completed earnings separation (calculated server-side)
 * - Expandable transaction details
 * - Solscan integration for on-chain verification
 * - Copy-to-clipboard for wallet addresses
 *
 * ## Architecture Notes
 *
 * - Stats calculation is done server-side in `getActivityTransactions()`
 * - Frontend components are "dumb" - they just display data from backend
 * - FIN token support can be toggled via `finEnabled` flag in backend
 *
 * ## Related
 *
 * - Transaction types: `@/types/cashback-transaction`
 * - Partner tokens: `@/lib/data/partner-tokens`
 * - Crypto formatting: `@/lib/utils/crypto-formatter`
 */

// NO EXPORTS - Documentation only
