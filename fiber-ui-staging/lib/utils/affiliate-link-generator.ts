/**
 * Affiliate Link Generation Utilities
 *
 * Centralized logic for generating affiliate tracking links.
 * All affiliate links should be generated through this utility to ensure consistency.
 */

export type AffiliateProvider = "wildfire";

export interface AffiliateLinkParams {
  provider: AffiliateProvider;
  trackingId: string | number;
  deviceId: string;
  destinationUrl?: string;
}

/**
 * Generate an affiliate tracking link through our redirect proxy
 *
 * @param params - Link generation parameters
 * @returns The proxied affiliate link (e.g., /r/w?c=123&d=abc&url=...)
 *
 * @example
 * ```typescript
 * // Generate a Wildfire link
 * const link = generateAffiliateLink({
 *   provider: 'wildfire',
 *   trackingId: '11111',
 *   deviceId: 'abc123',
 *   destinationUrl: 'https://example.com/product'
 * });
 * // Returns: /r/w?c=11111&d=abc123&url=https%3A%2F%2Fexample.com%2Fproduct
 * ```
 */
export function generateAffiliateLink(params: AffiliateLinkParams): string {
  const { provider, trackingId, deviceId, destinationUrl } = params;

  // Route to appropriate provider endpoint
  switch (provider) {
    case "wildfire":
      return generateWildfireLink(trackingId, deviceId, destinationUrl);
    default:
      throw new Error(`Unsupported affiliate provider: ${provider}`);
  }
}

/**
 * Generate a Wildfire affiliate link through our /r/w proxy
 *
 * @param trackingId - Wildfire merchant/campaign ID
 * @param deviceId - User's Wildfire device ID
 * @param destinationUrl - Optional destination URL
 * @returns Proxied Wildfire link
 */
function generateWildfireLink(
  trackingId: string | number,
  deviceId: string,
  destinationUrl?: string,
): string {
  const url = new URL("/r/w", getBaseUrl());

  url.searchParams.set("c", String(trackingId));
  url.searchParams.set("d", deviceId);

  if (destinationUrl) {
    url.searchParams.set("url", destinationUrl);
  }

  // Return relative URL for same-origin, absolute for different origin
  return url.pathname + url.search;
}

/**
 * Get the base URL for link generation
 * In production, this will be the actual domain
 * In development, this will be localhost
 */
function getBaseUrl(): string {
  // Browser context
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Server context - use environment variable or default
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // Development fallback
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // Production fallback - this should be set in environment
  return "https://fiber-ui.vercel.app"; // TODO: Update with actual production domain
}

/**
 * Validate if a link can be generated with the provided parameters
 *
 * @param trackingId - Tracking/merchant ID
 * @param deviceId - User's device ID
 * @returns true if both required parameters are present
 */
export function canGenerateAffiliateLink(
  trackingId: string | number | undefined,
  deviceId: string | undefined,
): boolean {
  return !!trackingId && !!deviceId;
}
