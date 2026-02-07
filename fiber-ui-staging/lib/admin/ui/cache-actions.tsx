"use client";

import { useState } from "react";
import { Button } from "@/lib/ui/data-display/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/ui/layout/card";
import { toast } from "sonner";
import { Loader2, LucideIcon, Trash2, RefreshCw } from "lucide-react";

interface CacheAction {
  id: string;
  title: string;
  description: string;
  endpoint: string;
  icon: LucideIcon;
  successMessage: string;
  errorMessage: string;
  testId?: string;
}

const CACHE_ACTIONS: CacheAction[] = [
  {
    id: "cache-clear-all",
    title: "Clear All Cache",
    description:
      "Clears all Algolia search cache including search results and top offers. Use this when Algolia data has been updated and you want to force fresh results.",
    endpoint: "/api/cache/revalidate?tag=all",
    icon: Trash2,
    successMessage: "All Algolia cache cleared successfully",
    errorMessage: "Failed to clear Algolia cache",
    testId: "cache-clear-all-button",
  },
  {
    id: "cache-clear-search",
    title: "Clear Search Cache",
    description:
      "Clears only the search results cache. Top offers cache will remain. Use this for targeted cache invalidation.",
    endpoint: "/api/cache/revalidate?tag=search",
    icon: RefreshCw,
    successMessage: "Search cache cleared successfully",
    errorMessage: "Failed to clear search cache",
    testId: "cache-clear-search-button",
  },
  {
    id: "cache-clear-top-offers",
    title: "Clear Top Offers Cache",
    description:
      "Clears only the top offers cache. Search results cache will remain. Use this when top merchant rankings have changed.",
    endpoint: "/api/cache/revalidate?tag=top-offers",
    icon: RefreshCw,
    successMessage: "Top offers cache cleared successfully",
    errorMessage: "Failed to clear top offers cache",
    testId: "cache-clear-top-offers-button",
  },
];

export function CacheActions() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleAction = async (action: CacheAction) => {
    setLoadingStates((prev) => ({ ...prev, [action.id]: true }));
    try {
      const response = await fetch(action.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || action.errorMessage);
      }

      toast.success(action.successMessage);
    } catch (error) {
      console.error("Error executing action", { actionId: action.id, error });
      toast.error(error instanceof Error ? error.message : action.errorMessage);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [action.id]: false }));
    }
  };

  const renderActionCard = (action: CacheAction) => {
    const Icon = action.icon;
    const isLoading = loadingStates[action.id];

    return (
      <Card key={action.id}>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{action.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{action.description}</p>
          <Button
            onClick={() => handleAction(action)}
            disabled={isLoading}
            data-testid={action.testId}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Clearing...
              </>
            ) : (
              "Clear Cache"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Cache Management</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage Algolia search cache (1-hour TTL, persists across serverless instances)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CACHE_ACTIONS.map(renderActionCard)}
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <h3 className="text-sm font-semibold mb-2">Cache Information</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Cache uses Next.js unstable_cache with 1-hour TTL</li>
          <li>• Cache persists across Vercel serverless function instances</li>
          <li>• Clearing cache forces fresh data from Algolia on next request</li>
          <li>• See ALGOLIA_CACHE.md for more details on cache implementation</li>
        </ul>
      </div>
    </div>
  );
}
