/**
 * Onboarding Content Layer
 * Static content for onboarding flow steps
 */

export type OnboardingStepId = "welcome" | "howItWorks" | "setup";

export interface OnboardingFeature {
  label: string;
  icon: "coins" | "sparkles" | "mousePointerClick" | "shoppingBag" | "clock";
  color?: string;
}

export interface OnboardingStepContent {
  id: OnboardingStepId;
  title: string;
  description: string;
  imagePath: string;
  imageAlt: string;
  features?: OnboardingFeature[];
  /** Title shown to unauthenticated users (optional) */
  unauthTitle?: string;
  /** Description shown to unauthenticated users (optional) */
  unauthDescription?: string;
}

export const ONBOARDING_CONTENT: Record<OnboardingStepId, OnboardingStepContent> = {
  welcome: {
    id: "welcome",
    title: "Get Crypto When You Shop",
    description:
      "Shop at 50,000+ stores through Fiber and earn Fiber Points (FP) and crypto. Boost your tier to unlock higher rates and token rewards.",
    imagePath: "/onboarding/profit.png",
    imageAlt: "Welcome to Fiber",
    features: [
      { label: "50,000+ stores", icon: "shoppingBag", color: "primary" },
      { label: "Get crypto", icon: "coins", color: "purple-500" },
    ],
  },
  howItWorks: {
    id: "howItWorks",
    title: "How It Works",
    description:
      "Search for a store on Fiber, tap to shop on the merchant's site, and we'll track your purchase. You'll earn Fiber Points and crypto that appear in your wallet within a few days.",
    imagePath: "/onboarding/shopping.png",
    imageAlt: "How Fiber works",
    features: [
      { label: "Find store", icon: "mousePointerClick", color: "primary" },
      { label: "Shop", icon: "shoppingBag", color: "primary" },
      { label: "Get FP + crypto", icon: "coins", color: "primary" },
    ],
  },
  setup: {
    id: "setup",
    title: "Almost There",
    description:
      "Connect a Solana wallet to receive your crypto, then pick which token you want to earn.",
    imagePath: "/onboarding/tokens-to-wallet.png",
    imageAlt: "Wallet and token selection",
    unauthTitle: "Ready to Get Crypto?",
    unauthDescription:
      "Sign in to connect your wallet, choose your token, and start getting crypto on every purchase.",
  },
};
