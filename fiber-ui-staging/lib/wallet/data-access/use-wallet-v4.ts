"use client";

import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
  useDisconnect,
  useWalletInfo,
} from "@reown/appkit/react";
import type { Provider } from "@reown/appkit-adapter-solana/react";
import { useCallback } from "react";
import { encodeEmailParam } from "@/lib/utils/url-params";

export function useWalletV4() {
  const { open } = useAppKit();
  const { address, isConnected, caipAddress, status } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { disconnect: appKitDisconnect } = useDisconnect();
  const { walletInfo } = useWalletInfo();

  /**
   * Open the wallet connection modal
   * @param userEmail - Optional email to encode and add to URL as hint parameter
   */
  const connect = useCallback(
    (userEmail?: string) => {
      // Add encoded email to URL as "h" param before opening wallet modal
      // This allows email hint to persist if wallet opens in new browser session
      if (userEmail && typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("h", encodeEmailParam(userEmail));
        window.history.replaceState({}, "", url.toString());
      }

      open();
    },
    [open],
  );

  /**
   * Disconnect the wallet
   */
  const disconnect = useCallback(async () => {
    await appKitDisconnect();
  }, [appKitDisconnect]);

  /**
   * Sign a message with the connected wallet
   * @param message - Message to sign (string or Uint8Array)
   * @returns Signature as Uint8Array
   */
  const signMessage = useCallback(
    async (message: string | Uint8Array): Promise<Uint8Array> => {
      if (!walletProvider) {
        console.error("signMessage called but walletProvider is not available");
        throw new Error("Wallet provider not available. Please reconnect your wallet.");
      }

      if (!isConnected) {
        console.error("signMessage called but wallet is not connected");
        throw new Error("Wallet not connected. Please connect your wallet first.");
      }

      const encodedMessage =
        typeof message === "string" ? new TextEncoder().encode(message) : message;

      console.log("Calling walletProvider.signMessage with message length:", encodedMessage.length);

      try {
        const signature = await walletProvider.signMessage(encodedMessage);
        console.log("Signature successful, signature length:", signature.length);
        return signature;
      } catch (error) {
        console.error("walletProvider.signMessage failed:", error);

        // Provide more helpful error messages
        if (error instanceof Error) {
          // Check for common error patterns
          if (error.message.includes("User rejected") || error.message.includes("denied")) {
            throw new Error("User rejected the signature request");
          } else if (error.message.includes("not supported")) {
            throw new Error("This wallet doesn't support message signing");
          } else if (error.message.includes("timeout")) {
            throw new Error("Signature request timed out. Please try again.");
          }
          // Re-throw the original error if it's already descriptive
          throw error;
        }

        // Fallback for unknown errors
        throw new Error("Failed to sign message. Please try again.");
      }
    },
    [walletProvider, isConnected],
  );

  /**
   * Get the public key as a string
   */
  const publicKey = address;

  /**
   * Check if wallet is connecting
   */
  const connecting = status === "connecting";

  /**
   * Check if wallet is connected
   */
  const connected = isConnected;

  return {
    // Connection state
    connected,
    connecting,
    publicKey,
    address,
    caipAddress,
    status,

    // Actions
    connect,
    disconnect,
    signMessage,

    // Provider (for advanced usage)
    walletProvider,

    // Wallet info
    walletInfo,
  };
}
