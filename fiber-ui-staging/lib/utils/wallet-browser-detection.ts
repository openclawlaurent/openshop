/**
 * Utility functions to detect if the app is running inside a mobile wallet's in-app browser
 */

/**
 * Check if the current browser is a wallet's in-app browser
 * @returns true if running inside Phantom, MetaMask, Solflare, or other wallet browsers
 */
export function isWalletBrowser(): boolean {
  if (typeof window === "undefined") return false;

  const userAgent = navigator.userAgent || "";

  // Check for Phantom in-app browser
  if (userAgent.includes("Phantom")) return true;

  // Check for MetaMask mobile browser
  if (userAgent.includes("MetaMaskMobile")) return true;

  // Check for Solflare mobile browser
  if (userAgent.includes("Solflare")) return true;

  // Check for Trust Wallet
  if (userAgent.includes("Trust")) return true;

  // Check for Coinbase Wallet
  if (userAgent.includes("CoinbaseWallet")) return true;

  return false;
}

/**
 * Check if the app is opened from a mobile wallet (either via deep link or in-app browser)
 * Checks both user agent and URL parameters
 */
export function isFromMobileWallet(): boolean {
  if (typeof window === "undefined") return false;

  // Check if we're in a wallet's in-app browser
  if (isWalletBrowser()) return true;

  // Check if wallet_browser param is set in URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("wallet_browser") === "true") return true;

  // Check referrer for wallet apps
  const referrer = document.referrer || "";
  if (
    referrer.includes("phantom.app") ||
    referrer.includes("metamask.io") ||
    referrer.includes("solflare.com")
  ) {
    return true;
  }

  return false;
}

/**
 * Add wallet_browser=true to current URL if in wallet browser
 * Useful for tracking and analytics
 * Preserves all existing query parameters (like email)
 */
export function addWalletBrowserParam(): void {
  if (typeof window === "undefined") return;

  // Only add if we're in a wallet browser and param isn't already set
  if (isWalletBrowser()) {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("wallet_browser")) {
      url.searchParams.set("wallet_browser", "true");
      // Use replaceState to preserve existing params like email
      window.history.replaceState({}, "", url.toString());
    }
  }
}

/**
 * Get the wallet browser name if running inside one
 */
export function getWalletBrowserName(): string | null {
  if (typeof window === "undefined") return null;

  const userAgent = navigator.userAgent || "";

  if (userAgent.includes("Phantom")) return "Phantom";
  if (userAgent.includes("MetaMaskMobile")) return "MetaMask";
  if (userAgent.includes("Solflare")) return "Solflare";
  if (userAgent.includes("Trust")) return "Trust Wallet";
  if (userAgent.includes("CoinbaseWallet")) return "Coinbase Wallet";

  return null;
}
