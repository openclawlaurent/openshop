"use client";

import { SearchX } from "lucide-react";

interface SearchEmptyStateProps {
  message?: string;
  className?: string;
}

/**
 * Empty state component for when search returns no results
 * Pure UI component
 */
export function SearchEmptyState({
  message = "No results found.",
  className,
}: SearchEmptyStateProps) {
  return (
    <div className={`col-span-full text-center py-8 ${className || ""}`}>
      <SearchX className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
