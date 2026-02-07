"use client";

import { useSearchParams as useNextSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * Hook to manage search URL parameters
 * Provides utility functions for reading and updating search query params
 */
export function useSearchURLParams() {
  const searchParams = useNextSearchParams();
  const router = useRouter();

  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || undefined;

  /**
   * Update the search query in URL
   */
  const setQuery = useCallback(
    (newQuery: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newQuery.trim()) {
        params.set("q", newQuery);
        // When searching, set category to "all"
        params.set("category", "all");
      } else {
        params.delete("q");
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  /**
   * Update the category filter in URL
   */
  const setCategory = useCallback(
    (newCategory: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newCategory === "all") {
        params.delete("category");
      } else {
        params.set("category", newCategory);
      }
      params.delete("q"); // Clear search query when selecting a category
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  /**
   * Update the sort order in URL
   */
  const setSort = useCallback(
    (newSort: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", newSort);
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  /**
   * Clear the search query
   */
  const clearQuery = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  return {
    query,
    category,
    sort,
    setQuery,
    setCategory,
    setSort,
    clearQuery,
  };
}
