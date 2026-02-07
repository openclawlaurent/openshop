export const ANALYTICS_EVENTS = {
  USER_SIGNED_UP: "User Signed Up",
  USER_SIGNED_IN: "User Signed In",
  WALLET_CONNECTED: "Wallet Connected",
  WALLET_DISCONNECTED: "Wallet Disconnected",
  WALLET_CONNECTION_FAILED: "Wallet Connection Failed",
  WALLET_VERIFICATION_FAILED: "Wallet Verification Failed",
  WALLET_NO_EXTENSION: "Wallet No Extension",
  WALLET_NETWORK_MISMATCH: "Wallet Network Mismatch",
  WALLET_SIGNATURE_FAILED: "Wallet Signature Failed",
  PAYOUT_TOKEN_SELECTED: "Payout Token Selected",
  OFFER_CARD_CLICKED: "Offer Card Clicked",
  OFFER_CLICKED: "Offer Clicked",
  ACTIVITY_ITEM_EXPANDED: "Activity Item Expanded",
  SEARCH: "Search",
  ONBOARDING_PAYOUTS_REQUIRED_CLICKED: "Onboarding Payouts Required Clicked",
  ONBOARDING_WALLET_REQUIRED_CLICKED: "Onboarding Wallet Required Clicked",
  WAITLIST_JOINED: "Waitlist Joined",
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
