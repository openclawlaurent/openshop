"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/ui/layout/card";
import { Label } from "@/lib/ui/forms/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/ui/forms/select";
import { Badge } from "@/lib/ui/data-display/badge";
import { Button } from "@/lib/ui/data-display/button";
import { Skeleton } from "@/lib/ui/feedback/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/lib/ui/overlay/dropdown-menu";
import { AlertCircle, Coins, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { trackEvent } from "@/lib/analytics/posthog";
import { useUserProfileContext } from "@/contexts/user-profile-context";
import { updateUserProfileDirect } from "@/lib/data/user-profile-client";
import { PartnerToken } from "@/lib/data/partner-tokens";

export interface PayoutSettingsProps {
  initialPartnerTokens: PartnerToken[];
}

export function PayoutSettings({ initialPartnerTokens }: PayoutSettingsProps) {
  const { profile, refetch, isLoading: isLoadingProfile } = useUserProfileContext();
  const [selectedTokenId, setSelectedTokenId] = useState<string>("");
  const [initialTokenId, setInitialTokenId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [partnerTokens] = useState<PartnerToken[]>(initialPartnerTokens);

  // Load current payout token from context
  useEffect(() => {
    if (profile?.payout_partner_token_id) {
      setSelectedTokenId(profile.payout_partner_token_id);
      setInitialTokenId(profile.payout_partner_token_id);
    }
  }, [profile]);

  const handleSave = async () => {
    // Use selectedTokenId if available, otherwise don't save
    const tokenIdToSave = selectedTokenId;
    if (!tokenIdToSave) {
      toast.error("No Token Selected", {
        description: "Please select a token to save",
      });
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Please sign in first");
      }

      const updatedProfile = await updateUserProfileDirect(supabase, user.id, {
        payout_partner_token_id: tokenIdToSave,
        updated_at: new Date().toISOString(),
      });

      if (!updatedProfile) {
        throw new Error("Failed to save payout settings");
      }

      setInitialTokenId(tokenIdToSave);
      refetch(); // Refresh profile context with latest data
      const selectedToken = partnerTokens.find((token) => token.id === tokenIdToSave);

      // Track payout currency selection
      trackEvent.payoutCurrencySelected(selectedToken?.symbol || "unknown", {
        token_id: tokenIdToSave,
        token_name: selectedToken?.display_label,
        is_first_selection: !initialTokenId,
      });

      toast.success("Token Updated", {
        description: `Your token has been set to ${selectedToken?.symbol}`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save settings";

      toast.error("Save Failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card data-testid="payout-settings">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle> Choose Token </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Choose your payout token</p>
          </div>
          {!selectedTokenId && !isLoadingProfile && (
            <Badge
              variant="outline"
              className="text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              Required
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {/* Show skeleton while loading profile */}
          {isLoadingProfile && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-8" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-16 w-full rounded-md" />
            </div>
          )}

          {/* Show existing selection in green box - only if it matches the saved initial token */}
          {!isLoadingProfile &&
            initialTokenId &&
            selectedTokenId === initialTokenId &&
            !isEditing && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold">
                      {(() => {
                        const token = partnerTokens.find((t) => t.id === selectedTokenId);
                        return token ? `${token.name} (${token.symbol})` : "Selected Token";
                      })()}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-900 flex-shrink-0"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditing(true)} className="py-3 px-4">
                        <Settings className="h-5 w-5 mr-3" />
                        Change Token
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}

          {/* Show initial selection interface if no token selected OR if selected but not saved yet */}
          {!isLoadingProfile &&
            (!initialTokenId || (selectedTokenId && selectedTokenId !== initialTokenId)) &&
            !isEditing && (
              <div className="space-y-3">
                <div className="p-3 bg-yellow-500/10 rounded-md border border-yellow-500/30">
                  <p className="text-sm text-yellow-300">⚠️ Please select a token</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crypto-select">Token</Label>
                  <Select value={selectedTokenId} onValueChange={setSelectedTokenId}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      {partnerTokens.map((token) => (
                        <SelectItem key={token.id} value={token.id}>
                          {token.name} ({token.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={async () => {
                    await handleSave();
                  }}
                  disabled={!selectedTokenId || isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? "Saving..." : "Save Token"}
                </Button>
              </div>
            )}

          {/* Show dropdown when editing */}
          {!isLoadingProfile && isEditing && (
            <div className="space-y-3">
              <div className="space-y-2">
                {/* <Label htmlFor="crypto-select">
                  {initialTokenId ? "Change Token" : "Select Token"}
                </Label> */}
                <Select value={selectedTokenId} onValueChange={setSelectedTokenId}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    {partnerTokens.map((token) => (
                      <SelectItem key={token.id} value={token.id}>
                        {token.name} ({token.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setSelectedTokenId(initialTokenId);
                    setIsEditing(false);
                  }}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    await handleSave();
                    setIsEditing(false);
                  }}
                  disabled={!selectedTokenId || isLoading}
                  className="flex-1"
                  size="lg"
                >
                  {isLoading ? "Saving..." : initialTokenId ? "Update Token" : "Save Token"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
