"use client";

import { useState, useEffect } from "react";
import { useWalletV4 } from "@/lib/wallet/data-access";
import { useUserProfileContext } from "@/contexts/user-profile-context";
import { useAuth } from "@/contexts/auth-context";
import { useWalletVerification } from "@/lib/wallet/data-access";
import { updateUserProfile } from "@/lib/data/user-profile-client";
import { toast } from "@/lib/toast";
import { PartnerToken } from "@/lib/data/partner-tokens";
import { OnboardingModalShell } from "../ui/onboarding-modal-shell";
import { WelcomeStep } from "../ui/earn-rewards-step";
import { HowItWorksStep } from "../ui/search-and-shop-step";
import { SetupStep } from "../ui/connect-and-choose-step";
import { ONBOARDING_STEPS } from "../data-access/onboarding-steps";

interface OnboardingModalContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  partnerTokens: PartnerToken[];
}

/**
 * Onboarding modal container (feature layer)
 * Orchestrates the onboarding flow with wallet connection and token selection
 */
export function OnboardingModalContainer({
  isOpen,
  onClose,
  onComplete,
  partnerTokens,
}: OnboardingModalContainerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTokenId, setSelectedTokenId] = useState<string>("");
  const [isEditingToken, setIsEditingToken] = useState(false);
  const [isSavingToken, setIsSavingToken] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const { connected, publicKey, connect, disconnect, signMessage, walletInfo } = useWalletV4();
  const { profile, refetch } = useUserProfileContext();
  const { user } = useAuth();
  const { verifyWallet } = useWalletVerification();
  const isLoggedIn = Boolean(user);

  const totalSteps = 3;
  const existingWallet =
    profile?.is_solana_wallet_connected && profile?.solana_address
      ? profile.solana_address
      : undefined;

  // Load saved token from profile
  useEffect(() => {
    if (profile?.payout_partner_token_id) {
      setSelectedTokenId(profile.payout_partner_token_id);
    }
  }, [profile]);

  // Reset to first step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setIsEditingToken(false);
    }
  }, [isOpen]);

  // Handle wallet connection - trigger verification when connected
  useEffect(() => {
    if (
      connected &&
      publicKey &&
      !existingWallet &&
      isConnectingWallet &&
      typeof signMessage !== "undefined"
    ) {
      handleWalletVerification();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey, existingWallet, isConnectingWallet]);

  const handleConnectWallet = async () => {
    setIsConnectingWallet(true);
    try {
      connect(profile?.email ?? undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
      toast.error(errorMessage);
      setIsConnectingWallet(false);
    }
  };

  const handleWalletVerification = async () => {
    if (!publicKey || !signMessage) {
      console.error("Cannot sign and verify: missing publicKey or signMessage");
      setIsConnectingWallet(false);
      return;
    }

    try {
      await verifyWallet({
        publicKey,
        signMessage,
        walletInfo,
        onSuccess: async () => {
          // Disconnect after successful verification
          setTimeout(async () => {
            try {
              await disconnect();
            } catch (error) {
              console.error("Failed to disconnect after verification:", error);
            }
          }, 1000);
        },
        onError: async () => {
          // Disconnect on error
          try {
            await disconnect();
          } catch (disconnectError) {
            console.error(
              "Failed to disconnect wallet after verification failure:",
              disconnectError,
            );
          }
        },
      });
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleSaveToken = async (tokenId: string) => {
    if (!tokenId) return;

    setIsSavingToken(true);
    try {
      await updateUserProfile({
        payout_partner_token_id: tokenId,
      });

      toast.success("Token saved successfully!");
      setIsEditingToken(false);
      refetch();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save token";
      toast.error(errorMessage);
    } finally {
      setIsSavingToken(false);
    }
  };

  const handleTokenChange = (tokenId: string) => {
    setSelectedTokenId(tokenId);
    handleSaveToken(tokenId);
  };

  const handleEditTokenToggle = () => {
    setIsEditingToken(true);
  };

  const handleCancelTokenEdit = () => {
    setIsEditingToken(false);
    if (profile?.payout_partner_token_id) {
      setSelectedTokenId(profile.payout_partner_token_id);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const savedToken = partnerTokens.find((token) => token.id === profile?.payout_partner_token_id);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case ONBOARDING_STEPS.WELCOME:
        return <WelcomeStep />;
      case ONBOARDING_STEPS.HOW_IT_WORKS:
        return <HowItWorksStep />;
      case ONBOARDING_STEPS.SETUP:
        return (
          <SetupStep
            isLoggedIn={isLoggedIn}
            selectedTokenId={selectedTokenId}
            onTokenChange={handleTokenChange}
            partnerTokens={partnerTokens}
            isSavingToken={isSavingToken}
            isEditingToken={isEditingToken}
            onEditTokenToggle={handleEditTokenToggle}
            onCancelTokenEdit={handleCancelTokenEdit}
            savedToken={savedToken}
            existingWallet={existingWallet}
            isConnectingWallet={isConnectingWallet}
            onConnectWallet={handleConnectWallet}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <OnboardingModalShell
        isOpen={isOpen}
        onClose={onClose}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={handleNext}
        onBack={handleBack}
        onComplete={onComplete}
        isLastStep={currentStep === totalSteps}
        isLoggedIn={isLoggedIn}
      >
        {renderStepContent()}
      </OnboardingModalShell>
    </>
  );
}
