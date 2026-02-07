"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/ui/layout/card";
import { Badge } from "@/lib/ui/data-display/badge";
import { Button } from "@/lib/ui/data-display/button";
import { Skeleton } from "@/lib/ui/feedback/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/lib/ui/overlay/dropdown-menu";
import { Copy, Trash2, Settings, AlertCircle, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { trackEvent } from "@/lib/analytics/posthog";
import { useUserProfileContext } from "@/contexts/user-profile-context";
import { updateUserProfileDirect } from "@/lib/data/user-profile-client";
import { useWalletV4 } from "@/lib/wallet/data-access";
import { WalletConnectButton } from "@/lib/wallet/ui/wallet-connect-button";

export function WalletConnectionContentV4() {
  const { profile, refetch, isLoading: isLoadingProfile } = useUserProfileContext();
  const { connected, connecting, publicKey, connect, disconnect, signMessage, walletInfo } =
    useWalletV4();

  const [isRemoving, setIsRemoving] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const existingWallet = profile?.solana_address;
  const isWalletConnected = profile?.is_solana_wallet_connected ?? false;
  const userEmail = profile?.email;

  const handleConnectWallet = useCallback(async () => {
    setIsConnecting(true);

    try {
      trackEvent.onboardingWalletRequiredClicked({
        source: "wallet_connection_content_v4",
        attempt_number: 1,
      });

      // Open Reown modal to connect wallet
      // The connect() function will automatically add the encoded email to URL
      connect(userEmail ?? undefined);

      // Wait for wallet to connect and get publicKey
      // This will trigger a re-render when connected changes
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
      toast.error("Connection Failed", {
        description: errorMessage,
      });
      setIsConnecting(false);
    }
  }, [connect, userEmail]);

  // Handle signing and verification after wallet connects
  useEffect(() => {
    if (connected && publicKey && !isWalletConnected && isConnecting) {
      handleSignAndVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey, isWalletConnected, isConnecting]);

  const handleSignAndVerify = useCallback(async () => {
    if (!publicKey || !signMessage) {
      console.error("Cannot sign and verify: missing publicKey or signMessage", {
        hasPublicKey: !!publicKey,
        hasSignMessage: !!signMessage,
      });
      setIsConnecting(false);
      return;
    }

    try {
      console.log("Starting wallet signature verification for:", publicKey);
      console.log("Wallet type:", walletInfo?.name || "unknown", walletInfo);

      const message = `Verify wallet ownership for Fiber: ${publicKey}\nTimestamp: ${Date.now()}`;
      console.log("Requesting signature for message:", message);

      // This will prompt the wallet for signature
      const signature = await signMessage(message);
      console.log("Signature received:", signature.length, "bytes");

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Please sign in first");
      }

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

      trackEvent.walletConnected({
        wallet_address: publicKey,
        wallet_adapter: "reown-appkit",
        wallet_type: walletInfo?.name || "unknown",
        network: process.env.NEXT_PUBLIC_SOLANA_ENVIRONMENT || "mainnet-beta",
      });

      toast.success("Wallet Connected", {
        description: "Your wallet has been successfully connected",
      });

      // Force refetch to get updated profile with wallet address
      refetch();

      // Disconnect from AppKit after successful verification
      // This prevents auto-reconnection on page load
      // The wallet address is saved in the database, so we don't need to stay connected
      setTimeout(async () => {
        try {
          await disconnect();
          console.log("Disconnected wallet after successful verification");
        } catch (error) {
          console.error("Failed to disconnect after verification:", error);
        }
      }, 1000); // Wait 1 second to allow UI to update
    } catch (error) {
      console.error("Wallet verification error:", error);

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      let userFriendlyMessage = errorMessage;
      let errorType = "verification_failed";

      // Provide more specific error messages
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

      trackEvent.walletVerificationFailed({
        error_type: errorType,
        error_message: errorMessage,
        wallet_address: publicKey,
        wallet_adapter: "reown-appkit",
        wallet_type: walletInfo?.name || "unknown",
        network: process.env.NEXT_PUBLIC_SOLANA_ENVIRONMENT || "mainnet-beta",
      });

      toast.error("Verification Failed", {
        description: userFriendlyMessage,
        duration: 6000, // Show longer for error messages
      });

      // Disconnect wallet if verification failed
      try {
        console.log("Disconnecting wallet after verification failure...");
        await disconnect();
      } catch (disconnectError) {
        console.error("Failed to disconnect wallet after verification failure:", disconnectError);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [publicKey, signMessage, refetch, disconnect, walletInfo]);

  const handleRemoveWallet = useCallback(async () => {
    if (!isWalletConnected) return;

    setIsRemoving(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Please sign in first");
      }

      // Keep solana_address but set is_solana_wallet_connected to false
      const updatedProfile = await updateUserProfileDirect(supabase, user.id, {
        is_solana_wallet_connected: false,
        updated_at: new Date().toISOString(),
      });

      if (!updatedProfile) {
        throw new Error("Failed to remove wallet");
      }

      // Also disconnect from AppKit
      await disconnect();

      trackEvent.walletDisconnected({
        wallet_address: existingWallet ?? "",
        wallet_type: walletInfo?.name || "unknown",
      });

      toast.success("Wallet Disconnected", {
        description:
          "Wallet disconnected. Pending transactions will still go to your previous wallet until you connect a new wallet.",
      });

      refetch();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to remove wallet";
      toast.error("Failed to Disconnect Wallet", {
        description: errorMessage,
      });
    } finally {
      setIsRemoving(false);
    }
  }, [isWalletConnected, existingWallet, refetch, disconnect, walletInfo?.name]);

  const handleCopyAddress = useCallback(async () => {
    if (!existingWallet) return;

    try {
      await navigator.clipboard.writeText(existingWallet);
      toast.success("Address Copied", {
        description: "Wallet address has been copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy address:", error);
      toast.error("Failed to Copy", {
        description: "Could not copy address to clipboard",
      });
    }
  }, [existingWallet]);

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-8" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-16 w-full rounded-md" />
    </div>
  );

  const renderExistingWallet = () => (
    <div className="space-y-3">
      <div
        data-testid="wallet-connected-status"
        className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200 dark:border-emerald-800"
      >
        <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          {/* <div className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            Connected Wallet
          </div> */}
          <div className="font-mono text-sm text-emerald-700 dark:text-emerald-300">
            {truncateAddress(existingWallet || "")}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              data-testid="wallet-settings-button"
              variant="ghost"
              size="sm"
              disabled={isRemoving}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-900 flex-shrink-0"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              data-testid="copy-wallet-address"
              onClick={handleCopyAddress}
              className="py-3 px-4"
            >
              <Copy className="h-5 w-5 mr-3" />
              Copy Address
            </DropdownMenuItem>
            <DropdownMenuItem
              data-testid="disconnect-wallet-button"
              onClick={handleRemoveWallet}
              className="text-red-600 dark:text-red-400 py-3 px-4"
              disabled={isRemoving}
            >
              <Trash2 className="h-5 w-5 mr-3" />
              {isRemoving ? "Removing..." : "Remove from Account"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const renderConnectButton = () => (
    <div className="space-y-3" data-testid="wallet-disconnected-status">
      <div className="p-3 bg-yellow-500/10 rounded-md border border-yellow-500/30">
        <p className="text-sm text-yellow-300">⚠️ Connect a Solana wallet to receive payouts</p>
      </div>
      <WalletConnectButton
        onConnect={handleConnectWallet}
        isConnecting={isConnecting || connecting}
        showHelpText={true}
        size="lg"
      />
    </div>
  );

  const renderConnectingState = () => (
    <div className="space-y-3">
      <div
        data-testid="wallet-verifying-status"
        className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800"
      >
        <p className="text-sm text-blue-700 dark:text-blue-300">Verifying wallet...</p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          Please sign the message in your wallet to complete verification
        </p>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Solana Wallet</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Your token earnings will be sent to your connected wallet
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isWalletConnected && !connected && !isLoadingProfile && (
              <Badge
                variant="outline"
                className="text-yellow-300 border-yellow-500/30 bg-yellow-500/10"
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                Required
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingProfile && renderLoadingSkeleton()}
        {!isLoadingProfile && isWalletConnected && renderExistingWallet()}
        {!isLoadingProfile && !isWalletConnected && isConnecting && renderConnectingState()}
        {!isLoadingProfile && !isWalletConnected && !isConnecting && renderConnectButton()}
      </CardContent>
    </Card>
  );
}
