"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/ui/layout/card";
import { Button } from "@/lib/ui/data-display/button";
import { Wallet, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useWalletV4 } from "@/lib/wallet/data-access";
import { toast } from "@/lib/toast";
import { trackEvent } from "@/lib/analytics/posthog";
import { createClient } from "@/lib/supabase/client";

type ConnectionState = "ready" | "connecting" | "verifying" | "success" | "error";

function WalletConnectionPage() {
  const router = useRouter();
  const { connected, connecting, publicKey, connect, signMessage } = useWalletV4();

  const [state, setState] = useState<ConnectionState>("ready");
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);

  // Get user email on mount
  useEffect(() => {
    const fetchUserEmail = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    fetchUserEmail();
  }, []);

  // Auto-verify when wallet connects
  useEffect(() => {
    if (connected && publicKey && state === "ready") {
      handleVerifyWallet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey, state]);

  const handleConnect = useCallback(() => {
    setState("connecting");
    trackEvent.onboardingWalletRequiredClicked({
      source: "wallet_connection_page",
      attempt_number: 1,
    });
    // Pass user email for tracking in URL
    connect(userEmail);
  }, [connect, userEmail]);

  const createVerificationMessage = useCallback((walletAddress: string) => {
    const timestamp = Date.now();
    return `Verify wallet ownership for Fiber: ${walletAddress}\nTimestamp: ${timestamp}`;
  }, []);

  const handleVerifyWallet = useCallback(async () => {
    if (!publicKey || !signMessage) return;

    // Check if user is authenticated
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setState("error");
      setError("Please sign in first before connecting your wallet");
      toast.error("Authentication Required", {
        description: "Please sign in to your account first",
      });
      return;
    }

    setState("verifying");

    try {
      const message = createVerificationMessage(publicKey);
      const signature = await signMessage(message);

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
        throw new Error(errorData.error || "Failed to verify wallet");
      }

      trackEvent.walletConnected({
        wallet_address: publicKey,
        wallet_adapter: "reown-appkit",
        network: process.env.NEXT_PUBLIC_SOLANA_ENVIRONMENT || "mainnet-beta",
      });

      setState("success");
      toast.success("Wallet Connected", {
        description: "Your wallet has been successfully verified",
      });

      // Redirect to settings after 2 seconds
      setTimeout(() => {
        router.push("/settings");
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      trackEvent.walletVerificationFailed({
        error_type: "verification_failed",
        error_message: errorMessage,
        wallet_address: publicKey,
        wallet_adapter: "reown-appkit",
        network: process.env.NEXT_PUBLIC_SOLANA_ENVIRONMENT || "mainnet-beta",
      });

      setState("error");
      setError(errorMessage);
      toast.error("Verification Failed", {
        description: errorMessage,
      });
    }
  }, [publicKey, signMessage, createVerificationMessage, router]);

  const renderState = () => {
    switch (state) {
      case "error":
        return (
          <div className="space-y-4">
            <div
              data-testid="wallet-error"
              className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-red-900 dark:text-red-100">
                  Connection Error
                </div>
                <div className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</div>
              </div>
            </div>
            <Button onClick={() => router.push("/settings")} variant="outline" className="w-full">
              Return to Settings
            </Button>
          </div>
        );

      case "ready":
      case "connecting":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Click the button below to connect your Solana wallet. You&apos;ll be asked to sign a
                message to verify ownership.
              </p>
            </div>
            <Button
              data-testid="connect-wallet-button"
              onClick={handleConnect}
              disabled={connecting || connected}
              className="w-full"
              size="lg"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : connected ? (
                <>
                  <Wallet className="w-5 h-5 mr-2" />
                  Wallet Connected
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Wallet
                </>
              )}
            </Button>

            {/* Test-only mock wallet button - only visible in E2E tests */}
            {typeof window !== "undefined" && window.location.port === "3010" && (
              <Button
                data-testid="mock-connect-wallet-button"
                onClick={async () => {
                  // Get mock wallet address from window (set by E2E test)
                  interface WindowWithMockWallet extends Window {
                    __MOCK_WALLET_ADDRESS__?: string;
                    __MOCK_WALLET_SHOULD_FAIL__?: boolean;
                  }
                  const mockAddress = (window as WindowWithMockWallet).__MOCK_WALLET_ADDRESS__;
                  const shouldFailConnect = (window as WindowWithMockWallet)
                    .__MOCK_WALLET_SHOULD_FAIL__;

                  if (!mockAddress) {
                    console.error("[MOCK] No mock wallet address found");
                    return;
                  }

                  setState("verifying");

                  try {
                    // Simulate wallet connection delay
                    await new Promise((resolve) => setTimeout(resolve, 500));

                    // Check if we should simulate connection failure
                    if (shouldFailConnect) {
                      throw new Error("User rejected the connection request");
                    }

                    const supabase = createClient();
                    const {
                      data: { user },
                    } = await supabase.auth.getUser();

                    if (!user) {
                      throw new Error("Please sign in first before connecting your wallet");
                    }

                    // Skip actual signing, use mock signature
                    const mockSignature = new Array(64).fill(1).join(",");

                    const response = await fetch("/api/wallet/verify", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        walletAddress: mockAddress,
                        signature: mockSignature,
                        network: "mainnet-beta",
                      }),
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || "Failed to verify wallet");
                    }

                    setState("success");
                    toast.success("Wallet Connected", {
                      description: "Your wallet has been successfully verified",
                    });

                    setTimeout(() => {
                      router.push("/settings");
                    }, 2000);
                  } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : "Unknown error";
                    setState("error");
                    setError(errorMessage);
                    toast.error("Verification Failed", {
                      description: errorMessage,
                    });
                  }
                }}
                variant="outline"
                className="w-full"
                size="sm"
              >
                🧪 Mock Connect (Test Only)
              </Button>
            )}
            {connected && publicKey && (
              <div
                data-testid="wallet-connected-preview"
                className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200 dark:border-emerald-800"
              >
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Connected: {publicKey.slice(0, 6)}...{publicKey.slice(-6)}
                </p>
              </div>
            )}
          </div>
        );

      case "verifying":
        return (
          <div className="space-y-4">
            <div
              data-testid="wallet-verifying-status"
              className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Verifying Wallet
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Please sign the message in your wallet to complete verification...
                </div>
              </div>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="space-y-4">
            <div
              data-testid="wallet-connected-status"
              className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200 dark:border-emerald-800"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                  Wallet Connected Successfully
                </div>
                <div className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                  Redirecting you back to settings...
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6" />
            <CardTitle>Connect Your Wallet</CardTitle>
          </div>
        </CardHeader>
        <CardContent>{renderState()}</CardContent>
      </Card>
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <WalletConnectionPage />
    </Suspense>
  );
}
