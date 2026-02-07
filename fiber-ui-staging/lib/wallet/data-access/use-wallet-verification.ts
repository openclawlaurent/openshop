"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics/posthog";
import { useUserProfileContext } from "@/contexts/user-profile-context";

export interface WalletVerificationOptions {
  publicKey: string;
  signMessage: (message: string | Uint8Array) => Promise<Uint8Array>;
  walletInfo?: { name?: string };
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface WalletVerificationResult {
  success: boolean;
  error?: string;
}

/**
 * Shared hook for wallet signature verification
 * Used across onboarding, profile, and other wallet connection flows
 *
 * @returns { verifyWallet } - Function to verify wallet ownership via signature
 */
export function useWalletVerification() {
  const { refetch } = useUserProfileContext();

  const verifyWallet = useCallback(
    async ({
      publicKey,
      signMessage,
      walletInfo,
      onSuccess,
      onError,
    }: WalletVerificationOptions): Promise<WalletVerificationResult> => {
      try {
        console.log("Starting wallet signature verification for:", publicKey);
        console.log("Wallet type:", walletInfo?.name || "unknown", walletInfo);

        // Generate verification message
        const message = `Verify wallet ownership for Fiber: ${publicKey}\nTimestamp: ${Date.now()}`;
        console.log("Requesting signature for message:", message);

        // Prompt wallet for signature
        const signature = await signMessage(message);
        console.log("Signature received:", signature.length, "bytes");

        // Verify user is authenticated
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Please sign in first");
        }

        // Send signature to backend for verification
        console.log("Verifying signature with backend...");
        const response = await fetch("/api/wallet/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: publicKey,
            signature: Array.from(signature).join(","),
            network: process.env.NEXT_PUBLIC_SOLANA_ENVIRONMENT || "mainnet-beta",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Backend verification failed:", errorData);
          throw new Error(errorData.error || "Failed to verify wallet");
        }

        const responseData = await response.json();
        console.log("Wallet verification successful:", responseData);

        // Track successful verification
        trackEvent.walletConnected({
          wallet_address: publicKey,
          wallet_adapter: "reown-appkit",
          wallet_type: walletInfo?.name || "unknown",
          network: process.env.NEXT_PUBLIC_SOLANA_ENVIRONMENT || "mainnet-beta",
        });

        // Show success message
        toast.success("Wallet Connected", {
          description: "Your wallet has been successfully connected",
        });

        // Refetch user profile to get updated wallet address
        refetch();

        // Call success callback
        onSuccess?.();

        return { success: true };
      } catch (error) {
        console.error("Wallet verification error:", error);

        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        let userFriendlyMessage = errorMessage;
        let errorType = "verification_failed";

        // Categorize errors and provide user-friendly messages
        if (errorMessage.includes("User rejected") || errorMessage.includes("User denied")) {
          userFriendlyMessage =
            "You rejected the signature request. Please try again and approve the signature.";
          errorType = "user_rejected_signature";
        } else if (errorMessage.includes("Wallet not connected")) {
          userFriendlyMessage = "Wallet disconnected. Please reconnect and try again.";
          errorType = "wallet_disconnected";
        } else if (errorMessage.includes("signMessage") || errorMessage.includes("not supported")) {
          userFriendlyMessage =
            "This wallet doesn't support message signing. Please try Phantom or Solflare instead.";
          errorType = "wallet_unsupported";
        } else if (errorMessage.includes("Please sign in first")) {
          userFriendlyMessage = "Please sign in to your Fiber account first.";
          errorType = "not_authenticated";
        } else if (errorMessage.includes("network") || errorMessage.includes("RPC")) {
          userFriendlyMessage = "Network error. Please check your connection and try again.";
          errorType = "network_error";
        }

        // Track failed verification
        trackEvent.walletVerificationFailed({
          error_type: errorType,
          error_message: errorMessage,
          wallet_address: publicKey,
          wallet_adapter: "reown-appkit",
          wallet_type: walletInfo?.name || "unknown",
          network: process.env.NEXT_PUBLIC_SOLANA_ENVIRONMENT || "mainnet-beta",
        });

        // Show error message
        toast.error("Verification Failed", {
          description: userFriendlyMessage,
          duration: 6000,
        });

        // Call error callback
        const err = error instanceof Error ? error : new Error(errorMessage);
        onError?.(err);

        return { success: false, error: errorMessage };
      }
    },
    [refetch],
  );

  return { verifyWallet };
}
