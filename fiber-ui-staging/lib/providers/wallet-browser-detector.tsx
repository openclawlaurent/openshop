"use client";

import { useEffect } from "react";
import { addWalletBrowserParam, isWalletBrowser } from "@/lib/utils/wallet-browser-detection";

/**
 * Client component that detects wallet browsers and adds wallet_browser=true to URL
 * This helps track when users are accessing the app from mobile wallet in-app browsers
 */
export function WalletBrowserDetector() {
  useEffect(() => {
    // Add wallet_browser param to URL if we're in a wallet browser
    if (isWalletBrowser()) {
      addWalletBrowserParam();

      // Also log for debugging (optional)
      if (process.env.NODE_ENV === "development") {
        console.log("[WalletBrowserDetector] Running in wallet browser");
      }
    }
  }, []);

  // This component renders nothing, it just runs the detection logic
  return null;
}
