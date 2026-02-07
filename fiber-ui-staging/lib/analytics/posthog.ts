"use client";

import posthog from "posthog-js";
import { ANALYTICS_EVENTS, type AnalyticsEvent } from "./events";

export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

class PostHogService {
  track(event: AnalyticsEvent, properties?: EventProperties & { description?: string }) {
    if (typeof window === "undefined") return;

    try {
      posthog.capture(event, properties);
    } catch (error) {
      console.error("PostHog tracking error:", error);
    }
  }

  identify(userId: string, properties?: EventProperties) {
    if (typeof window === "undefined") return;

    try {
      posthog.identify(userId, properties);
    } catch (error) {
      console.error("PostHog identify error:", error);
    }
  }

  reset() {
    if (typeof window === "undefined") return;

    try {
      posthog.reset();
    } catch (error) {
      console.error("PostHog reset error:", error);
    }
  }
}

export const analytics = new PostHogService();

export const trackEvent = {
  userSignedUp: (properties?: EventProperties & { email?: string }) => {
    const description = properties?.email
      ? `User signed up with email: ${properties.email}`
      : "User signed up";
    return analytics.track(ANALYTICS_EVENTS.USER_SIGNED_UP, { ...properties, description });
  },

  userSignedIn: (properties?: EventProperties & { email?: string }) => {
    const description = properties?.email
      ? `User signed in with email: ${properties.email}`
      : "User signed in";
    return analytics.track(ANALYTICS_EVENTS.USER_SIGNED_IN, { ...properties, description });
  },

  walletConnected: (
    properties?: EventProperties & { wallet_address?: string; wallet_adapter?: string },
  ) => {
    const description = properties?.wallet_address
      ? `Wallet connected: ${properties.wallet_address.slice(0, 8)}...${properties.wallet_address.slice(-6)} via ${properties.wallet_adapter || "unknown adapter"}`
      : "Wallet connected";
    return analytics.track(ANALYTICS_EVENTS.WALLET_CONNECTED, { ...properties, description });
  },

  walletDisconnected: (
    properties?: EventProperties & { wallet_address?: string; wallet_adapter?: string },
  ) => {
    const description = properties?.wallet_address
      ? `Wallet disconnected: ${properties.wallet_address.slice(0, 8)}...${properties.wallet_address.slice(-6)}`
      : "Wallet disconnected";
    return analytics.track(ANALYTICS_EVENTS.WALLET_DISCONNECTED, { ...properties, description });
  },

  walletConnectionFailed: (
    properties?: EventProperties & {
      error_type?: string;
      error_message?: string;
      wallet_adapter?: string;
      attempt_number?: number;
      has_extension?: boolean;
    },
  ) => {
    const description = `Wallet connection failed for ${properties?.wallet_adapter || "unknown wallet"}: ${properties?.error_type || "unknown error"}`;
    return analytics.track(ANALYTICS_EVENTS.WALLET_CONNECTION_FAILED, {
      ...properties,
      description,
    });
  },

  walletVerificationFailed: (
    properties?: EventProperties & {
      error_type?: string;
      error_message?: string;
      wallet_address?: string;
      wallet_adapter?: string;
      network?: string;
    },
  ) => {
    const description = `Wallet verification failed for ${properties?.wallet_adapter || "unknown wallet"}: ${properties?.error_type || "unknown error"}`;
    return analytics.track(ANALYTICS_EVENTS.WALLET_VERIFICATION_FAILED, {
      ...properties,
      description,
    });
  },

  walletNoExtension: (
    properties?: EventProperties & {
      requested_wallet?: string;
      available_wallets_count?: number;
      platform?: string;
    },
  ) => {
    const description = `No wallet extension found for ${properties?.requested_wallet || "unknown wallet"} on ${properties?.platform || "unknown platform"}`;
    return analytics.track(ANALYTICS_EVENTS.WALLET_NO_EXTENSION, { ...properties, description });
  },

  walletNetworkMismatch: (
    properties?: EventProperties & {
      expected_network?: string;
      actual_network?: string;
      wallet_adapter?: string;
    },
  ) => {
    const description = `Wallet network mismatch: expected ${properties?.expected_network || "unknown"}, got ${properties?.actual_network || "unknown"}`;
    return analytics.track(ANALYTICS_EVENTS.WALLET_NETWORK_MISMATCH, {
      ...properties,
      description,
    });
  },

  walletSignatureFailed: (
    properties?: EventProperties & {
      error_message?: string;
      wallet_adapter?: string;
      verification_step?: string;
    },
  ) => {
    const description = `Wallet signature failed for ${properties?.wallet_adapter || "unknown wallet"} during ${properties?.verification_step || "unknown step"}`;
    return analytics.track(ANALYTICS_EVENTS.WALLET_SIGNATURE_FAILED, {
      ...properties,
      description,
    });
  },

  payoutCurrencySelected: (currency: string, properties?: EventProperties) => {
    const description = `User selected payout token: ${currency}`;
    return analytics.track(ANALYTICS_EVENTS.PAYOUT_TOKEN_SELECTED, {
      currency,
      ...properties,
      description,
    });
  },

  offerCardClicked: (
    properties?: EventProperties & {
      merchant_name?: string;
      offer_id?: string;
      position?: number;
      query?: string;
      source?: string;
    },
  ) => {
    const description = properties?.merchant_name
      ? `User clicked offer card for ${properties.merchant_name} at position ${properties.position || "unknown"}`
      : "User clicked offer card";
    return analytics.track(ANALYTICS_EVENTS.OFFER_CARD_CLICKED, { ...properties, description });
  },

  offerClicked: (
    properties?: EventProperties & {
      merchant_name?: string;
      offer_id?: string;
      wild_link?: string;
      source?: string;
    },
  ) => {
    const description = properties?.merchant_name
      ? `User clicked Shop Now for ${properties.merchant_name} from offer details sheet`
      : "User clicked Shop Now from offer details sheet";
    return analytics.track(ANALYTICS_EVENTS.OFFER_CLICKED, { ...properties, description });
  },

  activityItemExpanded: (
    properties?: EventProperties & { transaction_id?: string; merchant_name?: string },
  ) => {
    const description = properties?.merchant_name
      ? `User expanded activity item for ${properties.merchant_name}`
      : "User expanded activity item";
    return analytics.track(ANALYTICS_EVENTS.ACTIVITY_ITEM_EXPANDED, { ...properties, description });
  },

  search: (
    searchTerm: string,
    properties?: {
      type_filters?: string;
      total_results?: number;
      search_type?: string;
    } & EventProperties,
  ) => {
    const description = `User searched for "${searchTerm}" (${properties?.total_results || 0} results)`;
    return analytics.track(ANALYTICS_EVENTS.SEARCH, {
      search_term: searchTerm,
      ...properties,
      description,
    });
  },

  onboardingPayoutsRequiredClicked: (properties?: EventProperties) => {
    const description = "User clicked payouts required button during onboarding";
    return analytics.track(ANALYTICS_EVENTS.ONBOARDING_PAYOUTS_REQUIRED_CLICKED, {
      ...properties,
      description,
    });
  },

  onboardingWalletRequiredClicked: (properties?: EventProperties) => {
    const description = "User clicked wallet required button during onboarding";
    return analytics.track(ANALYTICS_EVENTS.ONBOARDING_WALLET_REQUIRED_CLICKED, {
      ...properties,
      description,
    });
  },

  waitlistJoined: (properties?: EventProperties & { email?: string }) => {
    const description = properties?.email
      ? `User joined waitlist with email: ${properties.email}`
      : "User joined waitlist";
    return analytics.track(ANALYTICS_EVENTS.WAITLIST_JOINED, { ...properties, description });
  },
};
