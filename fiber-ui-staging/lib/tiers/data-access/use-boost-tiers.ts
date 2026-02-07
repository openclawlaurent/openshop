"use client";

import { useEffect, useState } from "react";
import { BoostTier } from "./types";

type UseBoostTiersReturn = {
  boostTiers: BoostTier[];
  loading: boolean;
  error: string | null;
};

/**
 * Hook to fetch all active boost tiers from the API
 * Automatically fetches on mount and provides loading/error states
 */
export function useBoostTiers(): UseBoostTiersReturn {
  const [boostTiers, setBoostTiers] = useState<BoostTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoostTiers = async () => {
      try {
        const response = await fetch("/api/boost-tiers");
        if (!response.ok) {
          throw new Error("Failed to fetch boost tiers");
        }
        const data = await response.json();
        setBoostTiers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchBoostTiers();
  }, []);

  return { boostTiers, loading, error };
}
