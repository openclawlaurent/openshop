"use client";

import { OnboardingStepCard } from "./onboarding-step-card";
import { WalletConnector } from "./wallet-connector";
import { TokenSelector } from "./token-selector";
import { PartnerToken } from "@/lib/data/partner-tokens";
import { ONBOARDING_CONTENT } from "../content";

const content = ONBOARDING_CONTENT.setup;

interface SetupStepProps {
  isLoggedIn: boolean;
  selectedTokenId: string;
  onTokenChange: (tokenId: string) => void;
  partnerTokens: PartnerToken[];
  isSavingToken: boolean;
  isEditingToken: boolean;
  onEditTokenToggle: () => void;
  onCancelTokenEdit: () => void;
  savedToken?: PartnerToken;
  existingWallet?: string;
  isConnectingWallet: boolean;
  onConnectWallet: () => void;
}

/**
 * Step 3: Setup - connect wallet and choose token (logged in)
 * Or sign in prompt (logged out)
 */
export function SetupStep({
  isLoggedIn,
  selectedTokenId,
  onTokenChange,
  partnerTokens,
  isSavingToken,
  isEditingToken,
  onEditTokenToggle,
  onCancelTokenEdit,
  savedToken,
  existingWallet,
  isConnectingWallet,
  onConnectWallet,
}: SetupStepProps) {
  return (
    <OnboardingStepCard
      title={isLoggedIn ? content.title : (content.unauthTitle ?? content.title)}
      description={
        isLoggedIn ? content.description : (content.unauthDescription ?? content.description)
      }
      imageSrc={content.imagePath}
      imageAlt={content.imageAlt}
    >
      {isLoggedIn && (
        <div className="grid grid-cols-2 gap-3">
          <WalletConnector
            existingWallet={existingWallet}
            isConnecting={isConnectingWallet}
            onConnect={onConnectWallet}
            compact
          />
          <TokenSelector
            selectedTokenId={selectedTokenId}
            onTokenChange={onTokenChange}
            partnerTokens={partnerTokens}
            isSaving={isSavingToken}
            isEditing={isEditingToken}
            onEditToggle={onEditTokenToggle}
            onCancelEdit={onCancelTokenEdit}
            savedToken={savedToken}
            compact
          />
        </div>
      )}
    </OnboardingStepCard>
  );
}
