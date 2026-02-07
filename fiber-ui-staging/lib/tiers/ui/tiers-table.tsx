"use client";

import { TrendingUp, ShoppingBag } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/lib/ui/table";
import { Badge } from "@/lib/ui/data-display/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/lib/ui/data-display/avatar";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

type TierColorScheme = {
  bg: string;
  text: string;
  border: string;
};

type TierData = {
  id: string;
  name: string;
  description: string | null;
  payout_token_boost_multiplier: number;
  platform_token_boost_multiplier: number;
  minimum_monthly_average_purchases_amount: number;
};

type TiersTableProps = {
  tiers: TierData[];
  currentTierId: string;
  userAvatarUrl?: string | null;
  getTierColor: (tierName: string) => TierColorScheme;
};

/**
 * Pure UI component for displaying the boost tiers table
 * All data and logic is passed in via props
 * Uses shadcn Table components with responsive design
 */
export function TiersTable({ tiers, currentTierId, userAvatarUrl, getTierColor }: TiersTableProps) {
  return (
    <div className="space-y-4">
      {/* Explainer Section */}
      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2 text-xs sm:text-sm">
        <div className="flex items-start gap-2">
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div>
            <span className="font-semibold">Token Boost:</span> Your payout token earnings will be
            multiplied by this amount
          </div>
        </div>
        <div className="flex items-start gap-2">
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div>
            <span className="font-semibold">FP Boost:</span> Fiber Points (FP) are platform rewards
            that will be multiplied by this amount
          </div>
        </div>
        <div className="flex items-start gap-2">
          <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div>
            <span className="font-semibold">Min. Purchases/mo:</span> The minimum monthly purchase
            amount required to maintain this tier
          </div>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px] sm:w-[200px]">Tier</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Token Boost</span>
                  <span className="sm:hidden">Token</span>
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">FP Boost</span>
                  <span className="sm:hidden">FP</span>
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Min. Purchases/mo</span>
                  <span className="sm:hidden">Min/mo</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tiers.map((tier) => {
              const isCurrentTier = tier.id === currentTierId;
              const colorScheme = getTierColor(tier.name);

              return (
                <TableRow
                  key={tier.id}
                  className={cn(
                    colorScheme.bg,
                    isCurrentTier && ["border-l-4", colorScheme.border],
                  )}
                >
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span
                          className={cn("font-semibold text-sm sm:text-base", colorScheme.text)}
                        >
                          {tier.name}
                        </span>
                        {isCurrentTier && (
                          <div className="flex items-center gap-1">
                            <Avatar className="h-4 w-4 sm:h-5 sm:w-5">
                              <AvatarImage src={userAvatarUrl || undefined} alt="Your avatar" />
                              <AvatarFallback>
                                <User className="h-2 w-2 sm:h-3 sm:w-3" />
                              </AvatarFallback>
                            </Avatar>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs px-1.5 py-0 sm:px-2 sm:py-0.5 font-medium",
                                colorScheme.text,
                                colorScheme.border,
                              )}
                            >
                              You
                            </Badge>
                          </div>
                        )}
                      </div>
                      {tier.description && (
                        <div className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                          {tier.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="green"
                      className="text-sm sm:text-base px-2 sm:px-3 py-0.5 sm:py-1"
                    >
                      {tier.payout_token_boost_multiplier}x
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="blue"
                      className="text-sm sm:text-base px-2 sm:px-3 py-0.5 sm:py-1"
                    >
                      {tier.platform_token_boost_multiplier}x
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium text-xs sm:text-sm">
                    {tier.minimum_monthly_average_purchases_amount}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
