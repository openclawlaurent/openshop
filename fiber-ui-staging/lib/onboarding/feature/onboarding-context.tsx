"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useUserProfileContext } from "@/contexts/user-profile-context";
import { OnboardingModalContainer } from "./onboarding-modal-container";
import { OnboardingNudge } from "../ui/onboarding-nudge";
import { PartnerToken } from "@/lib/data/partner-tokens";

interface OnboardingContextType {
  showOnboarding: () => void;
  isOnboardingComplete: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { profile, refetch } = useUserProfileContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [hasTriggeredOnLogin, setHasTriggeredOnLogin] = useState(false);
  const [partnerTokens, setPartnerTokens] = useState<PartnerToken[]>([]);

  // Fetch partner tokens on mount
  useEffect(() => {
    const fetchPartnerTokens = async () => {
      try {
        const response = await fetch("/api/partner-tokens");
        if (response.ok) {
          const data = await response.json();
          setPartnerTokens(data);
        }
      } catch (error) {
        console.error("Error fetching partner tokens:", error);
      }
    };

    fetchPartnerTokens();
  }, []);

  // Check if user needs onboarding after successful authentication
  useEffect(() => {
    if (user && profile !== null && !isCompleting) {
      const needsOnboarding = profile?.is_onboarding_completed === false;

      // Only trigger once per session and if we haven't already triggered for this user
      if (needsOnboarding && !hasTriggeredOnLogin && !isModalOpen) {
        setHasTriggeredOnLogin(true);
        setIsModalOpen(true);
      }
    }
  }, [user, profile, isCompleting, hasTriggeredOnLogin, isModalOpen]);

  // Reset trigger flag when user changes (logout/login)
  useEffect(() => {
    if (!user) {
      setHasTriggeredOnLogin(false);
      setIsModalOpen(false);
      setIsCompleting(false);
    }
  }, [user]);

  const showOnboarding = () => {
    setIsModalOpen(true);
  };

  const handleComplete = async () => {
    setIsCompleting(true);

    try {
      const response = await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_onboarding_completed: true,
        }),
      });

      if (response.ok) {
        // Immediately close modal to prevent race condition
        setIsModalOpen(false);

        // Wait a bit before refetching to ensure database is updated
        setTimeout(() => {
          refetch();
          setIsCompleting(false);
        }, 100);
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setIsCompleting(false);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const isOnboardingComplete = profile?.is_onboarding_completed === true;

  // Always show nudge when modal is closed (small and unobtrusive)
  const showNudge = !isModalOpen;

  return (
    <OnboardingContext.Provider value={{ showOnboarding, isOnboardingComplete }}>
      {children}
      <OnboardingModalContainer
        isOpen={isModalOpen}
        onClose={handleClose}
        onComplete={handleComplete}
        partnerTokens={partnerTokens}
      />
      {showNudge && <OnboardingNudge onClick={showOnboarding} />}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
