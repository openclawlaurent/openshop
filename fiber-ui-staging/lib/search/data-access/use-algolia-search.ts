"use client";

import { useState, useEffect, useCallback } from "react";
import { searchViaAPI } from "@/lib/services/algolia-api-client";
import type {
  AlgoliaUnifiedRecord,
  AlgoliaSearchOptions,
  AlgoliaSearchResponse,
} from "@/types/algolia";

/**
 * Hook for performing Algolia search on the client side
 * Uses the /api/search endpoint instead of direct Algolia access
 * Supports debouncing, loading states, and error handling
 */
export function useAlgoliaSearch(
  initialQuery: string = "",
  options?: AlgoliaSearchOptions,
  debounceMs: number = 300,
) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<AlgoliaUnifiedRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<AlgoliaSearchResponse | null>(null);

  /**
   * Perform the actual search via API endpoint
   */
  const performSearch = useCallback(
    async (searchQuery: string) => {
      setLoading(true);
      setError(null);

      try {
        const searchResponse = await searchViaAPI(searchQuery, options);
        setResults(searchResponse.hits);
        setResponse(searchResponse);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Search failed"));
        setResults([]);
        setResponse(null);
      } finally {
        setLoading(false);
      }
    },
    [options],
  );

  /**
   * Debounced search effect
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query !== undefined) {
        performSearch(query);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch, debounceMs]);

  /**
   * Manual search trigger (bypasses debounce)
   */
  const search = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);
      performSearch(searchQuery);
    },
    [performSearch],
  );

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    response,
    search,
  };
}
