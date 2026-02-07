/**
 * Onboarding Domain
 *
 * Multi-step onboarding flow ("What's Fiber?") that introduces new users
 * to the platform, allows them to select a payout token, and connect their wallet.
 *
 * ## Structure
 * - `content/` - Static content for onboarding steps (welcome, how-it-works, in-action)
 * - `ui/` - Pure UI components (modal shell, step components, token/wallet selectors)
 * - `data-access/` - Step constants and utilities
 * - `feature/` - Orchestration (modal container) and context (OnboardingProvider)
 *
 * ## Usage
 * ```typescript
 * // Wrap app with provider (in layout-wrapper or similar)
 * import { OnboardingProvider } from '@/lib/onboarding/feature'
 *
 * export function LayoutWrapper({ children }) {
 *   return (
 *     <OnboardingProvider>
 *       {children}
 *     </OnboardingProvider>
 *   )
 * }
 *
 * // Use hook to trigger onboarding manually
 * import { useOnboarding } from '@/lib/onboarding/feature'
 *
 * function WhatsFiberButton() {
 *   const { showOnboarding } = useOnboarding()
 *   return <button onClick={showOnboarding}>What's Fiber?</button>
 * }
 * ```
 *
 * ## NO EXPORTS
 * Always import explicitly from submodules (ui/, content/, data-access/, feature/)
 */
