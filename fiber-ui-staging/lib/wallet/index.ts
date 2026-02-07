/**
 * Wallet Domain
 *
 * Shared wallet connection and verification functionality
 * used across onboarding, profile, and other wallet flows.
 *
 * ## Structure
 * - `data-access/` - Wallet verification hooks
 * - `ui/` - Reusable wallet UI components
 *
 * ## Usage
 * ```typescript
 * // Import verification hook
 * import { useWalletVerification } from '@/lib/wallet/data-access'
 *
 * // Import UI components
 * import { WalletStatusCard, WalletConnectButton } from '@/lib/wallet/ui'
 * ```
 *
 * ## NO EXPORTS
 * Always import explicitly from submodules (data-access/, ui/)
 */
