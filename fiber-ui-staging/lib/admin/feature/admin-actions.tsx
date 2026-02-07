"use client";

import { useState } from "react";
import { Button } from "@/lib/ui/data-display/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/ui/layout/card";
import { toast } from "sonner";
import { useUserProfileContext } from "@/contexts/user-profile-context";
import {
  Loader2,
  LucideIcon,
  RotateCcw,
  Package,
  AlertCircle,
  Clock,
  Zap,
  Trash2,
  RefreshCw,
} from "lucide-react";

interface AdminAction {
  id: string;
  title: string;
  description: string;
  endpoint: string;
  icon: LucideIcon;
  successMessage: string;
  errorMessage: string;
  testId?: string;
  category: "auto-progress" | "returns" | "cache";
  requiresProfile?: boolean; // Whether this action requires wallet/payout setup
}

const ADMIN_ACTIONS: AdminAction[] = [
  // Auto-Progression
  {
    id: "lifecycle-pending",
    title: "Simulate to PENDING",
    description:
      "Creates a commission that stays at PENDING status. Does not auto-progress or create any transactions.",
    endpoint: "/api/admin/lifecycle-pending",
    icon: Clock,
    successMessage: "PENDING commission created successfully",
    errorMessage: "Failed to create PENDING commission",
    testId: "lifecycle-pending-button",
    category: "auto-progress",
  },
  {
    id: "lifecycle-paid",
    title: "Simulate to PAID",
    description:
      "[Not supported until FIN deployment] Creates a commission and automatically progresses it to PAID status over a few minutes. The commission will move through PENDING → CONFIRMED → READY → PAID states with timed intervals.",
    endpoint: "/api/admin/lifecycle-paid",
    icon: Zap,
    successMessage: "Simulation to PAID started successfully",
    errorMessage: "Failed to start simulation to PAID",
    testId: "lifecycle-paid-button",
    category: "auto-progress",
  },
  // Returns
  {
    id: "lifecycle-return-order",
    title: "Order-Level Return",
    description:
      "Creates order-level return with same commission ID and positive amount. Updates existing commission with reduced amount. Accepts optional status (defaults to PENDING).",
    endpoint: "/api/admin/lifecycle-return-order",
    icon: RotateCcw,
    successMessage: "Order return simulation started successfully",
    errorMessage: "Failed to start order return simulation",
    testId: "lifecycle-return-order-button",
    category: "returns",
  },
  {
    id: "lifecycle-return-items",
    title: "Item-Level Return",
    description:
      "Creates item-level return with different commission ID and negative amount. Creates new commission record for returned items.",
    endpoint: "/api/admin/lifecycle-return-items",
    icon: Package,
    successMessage: "Item return simulation started successfully",
    errorMessage: "Failed to start item return simulation",
    testId: "lifecycle-return-items-button",
    category: "returns",
  },
  // Cache Management
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
    category: "cache",
    requiresProfile: false,
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
    category: "cache",
    requiresProfile: false,
  },
];

interface AdminActionsProps {
  userId: string;
}

export function AdminActions({ userId }: AdminActionsProps) {
  const { profile, refetch, isLoading: isLoadingProfile } = useUserProfileContext();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const hasWalletAddress = !!profile?.is_solana_wallet_connected;
  const hasPayoutToken = !!profile?.payout_partner_token_id;
  const canRunActions = hasWalletAddress && hasPayoutToken;
  const missingRequirements: string[] = [];

  if (!hasWalletAddress) missingRequirements.push("Solana wallet connection");
  if (!hasPayoutToken) missingRequirements.push("Payout token selection");

  const handleAction = async (action: AdminAction) => {
    // Only check profile requirements if action requires it (default: true)
    const requiresProfile = action.requiresProfile !== false;
    if (requiresProfile && !canRunActions) {
      toast.error("Please complete your profile setup first");
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [action.id]: true }));
    try {
      const response = await fetch(action.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
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

  const autoProgressActions = ADMIN_ACTIONS.filter((a) => a.category === "auto-progress");
  const returnSimulationActions = ADMIN_ACTIONS.filter((a) => a.category === "returns");
  const cacheActions = ADMIN_ACTIONS.filter((a) => a.category === "cache");

  const renderActionCard = (action: AdminAction) => {
    const Icon = action.icon;
    const isLoading = loadingStates[action.id];
    const requiresProfile = action.requiresProfile !== false;
    const isDisabled = isLoading || (requiresProfile && !canRunActions);

    return (
      <Card key={action.id} className="relative">
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
            disabled={isDisabled}
            data-testid={action.testId}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {action.category === "cache" ? "Clearing..." : "Triggering..."}
              </>
            ) : action.category === "cache" ? (
              "Clear Cache"
            ) : (
              "Trigger"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Transaction Simulation</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Test different commission states and transaction flows
          </p>
        </div>
        <Button onClick={refetch} disabled={isLoadingProfile} variant="outline" size="sm">
          {isLoadingProfile ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            "Refresh Profile"
          )}
        </Button>
      </div>

      {/* Debug info */}
      <div className="rounded-lg border bg-muted/50 p-3 text-xs font-mono">
        <div>Wallet: {profile?.solana_address || "Not connected"}</div>
        <div>Token: {profile?.payout_partner_token_id || "Not selected"}</div>
      </div>

      {!canRunActions && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-200">Profile Setup Required</h3>
              <p className="mt-1 text-sm text-yellow-300/90">
                To run lifecycle simulations, you must first complete your profile setup:
              </p>
              <ul className="mt-2 ml-4 list-disc space-y-1 text-sm text-yellow-300/90">
                {missingRequirements.map((req) => (
                  <li key={req}>{req}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-yellow-300/90">
                Please go to the Settings page to complete your profile.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Progression */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Auto-Progression
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Commissions that automatically progress through statuses
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">{autoProgressActions.map(renderActionCard)}</div>
      </div>

      {/* Return Simulations */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Return Simulations
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Test order and item-level returns</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {returnSimulationActions.map(renderActionCard)}
        </div>
      </div>

      {/* Cache Management */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Cache Management
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Manage Algolia search cache (1-hour TTL, persists across serverless instances)
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">{cacheActions.map(renderActionCard)}</div>
      </div>
    </div>
  );
}
