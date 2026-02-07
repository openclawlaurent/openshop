/**
 * Profile Domain
 *
 * Handles user profile management including avatar selection,
 * profile display, and account settings.
 *
 * ## Structure
 *
 * - `ui/` - Pure UI components (UserProfileCard, AvatarRandomizer)
 * - `data-access/server/` - Server-side profile fetching (SSR)
 * - `feature/` - Business logic and orchestration components
 *
 * ## Usage
 *
 * Always import from specific submodules, never from this index file:
 *
 * ```typescript
 * // ✅ Correct
 * import { ProfilePageContent } from '@/lib/profile/feature'
 * import { UserProfileCard } from '@/lib/profile/ui'
 * import { getUserProfile } from '@/lib/profile/data-access/server'
 *
 * // ❌ Incorrect
 * import { ProfilePageContent } from '@/lib/profile'
 * ```
 *
 * ## Key Features
 *
 * - User profile display with avatar
 * - Random avatar generation and selection
 * - Member since date display
 * - Boost tier badge display with modal
 * - Profile editing capabilities
 * - Integration with wallet and payout settings
 *
 * ## Related
 *
 * - User profile types: `@/lib/profile/ui/user-profile-card`
 * - Avatar utilities: `@/lib/utils/avatar-pregenerated`
 * - Boost tiers: `@/lib/tiers/ui`, `@/lib/tiers/feature`
 * - Profile context: `@/contexts/user-profile-context`
 */

// NO EXPORTS - Documentation only
