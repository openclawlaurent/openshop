"use client";

import { useEffect, useState } from "react";
import { BoostTier } from "./types";
import { useBoostTiers } from "./use-boost-tiers";

type UseCurrentBoostTierReturn = {
  currentTier: BoostTier | null;
  loading: boolean;
};

/**
 * Hook to get the current boost tier for a user
 * Finds the tier from the list of all tiers based on the provided tier ID
 *
 * @param boostTierId - The ID of the user's current boost tier
 * @returns The current tier object and loading state
 */
export function useCurrentBoostTier(boostTierId?: string | null): UseCurrentBoostTierReturn {
  const { boostTiers, loading } = useBoostTiers();
  const [currentTier, setCurrentTier] = useState<BoostTier | null>(null);

  useEffect(() => {
    if (!boostTierId || !boostTiers.length) {
      setCurrentTier(null);
      return;
    }

    const tier = boostTiers.find((t) => t.id === boostTierId);
    setCurrentTier(tier || null);
  }, [boostTierId, boostTiers]);

  return { currentTier, loading };
}
