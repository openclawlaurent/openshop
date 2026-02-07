/**
 * Boost Tiers Domain
 *
 * This domain handles boost tier functionality including:
 * - Displaying tier information and benefits
 * - Fetching and managing tier data
 * - Calculating tier-based multipliers and splits
 *
 * ## Architecture
 *
 * ### UI Layer (`ui/`)
 * Pure UI components that accept all data via props:
 * - `TierBadge` - Badge component for displaying a tier
 * - `TierRow` - Individual tier row in the tiers table
 * - `TiersTable` - Complete table of all tiers
 *
 * ### Content Layer (`content/`)
 * Static content and utilities:
 * - `getTierColor()` - Color scheme mapping for tier names
 *
 * ### Data Access Layer (`data-access/`)
 * Client-side hooks and utilities:
 * - `useBoostTiers()` - Hook to fetch all boost tiers
 * - `useCurrentBoostTier()` - Hook to get user's current tier
 * - `calculateActualCashback()` - Utility for cashback calculations
 * - `getBoostTierSplit()` - Utility for token split percentages
 * - `formatCashbackPercentage()` - Utility for formatting percentages
 *
 * Server-side functions (`data-access/server/`):
 * - `getBoostTiers()` - Fetch all active tiers (SSR)
 * - `getBoostTierById()` - Fetch specific tier by ID (SSR)
 * - `fetchBoostTiers()` - Low-level fetch with custom client
 * - `fetchBoostTierById()` - Low-level fetch by ID with custom client
 *
 * ### Feature Layer (`feature/`)
 * Orchestration components:
 * - `BoostTiersDrawer` - Drawer/sheet for displaying all tiers
 *
 * ## Usage Examples
 *
 * ### Using the boost tiers drawer
 * ```tsx
 * import { BoostTiersDrawer } from '@/lib/tiers/feature'
 * import { useBoostTiers } from '@/lib/tiers/data-access'
 *
 * function MyComponent() {
 *   const { boostTiers } = useBoostTiers()
 *   const [open, setOpen] = useState(false)
 *
 *   return (
 *     <BoostTiersDrawer
 *       open={open}
 *       onOpenChange={setOpen}
 *       boostTiers={boostTiers}
 *       currentTierId={userProfile.boost_tier_id}
 *       userAvatarUrl={userProfile.avatar_url}
 *     />
 *   )
 * }
 * ```
 *
 * ### Using the tier badge
 * ```tsx
 * import { TierBadge } from '@/lib/tiers/ui'
 *
 * function MyComponent({ tier }) {
 *   return (
 *     <TierBadge
 *       tierName={tier.name}
 *       payoutTokenBoost={tier.payout_token_boost_multiplier}
 *       platformTokenBoost={tier.platform_token_boost_multiplier}
 *       showMultipliers={true}
 *     />
 *   )
 * }
 * ```
 *
 * ### Server-side data fetching
 * ```tsx
 * import { getBoostTiers } from '@/lib/tiers/data-access/server'
 *
 * export default async function MyPage() {
 *   const tiers = await getBoostTiers()
 *   return <TiersList tiers={tiers} />
 * }
 * ```
 *
 * ## Import Guidelines
 *
 * ✅ DO use explicit imports:
 * ```tsx
 * import { TierBadge } from '@/lib/tiers/ui'
 * import { useBoostTiers } from '@/lib/tiers/data-access'
 * import { BoostTiersDrawer } from '@/lib/tiers/feature'
 * import { getBoostTiers } from '@/lib/tiers/data-access/server'
 * ```
 *
 * ❌ DON'T import from the top-level domain:
 * ```tsx
 * import { TierBadge } from '@/lib/tiers' // ❌ Wrong
 * ```
 */

// This file contains NO exports - it's documentation only
// Always import from specific submodules (ui/, data-access/, feature/, etc.)
