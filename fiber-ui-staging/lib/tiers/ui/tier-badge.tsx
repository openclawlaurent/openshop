"use client";

import { Badge } from "@/lib/ui/data-display/badge";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type TierBadgeProps = {
  tierName: string;
  className?: string;
  onClick?: () => void;
  payoutTokenBoost?: number;
  platformTokenBoost?: number;
  payoutTokenLabel?: string;
  showMultipliers?: boolean;
};

/**
 * Badge component for displaying a boost tier
 * Pure UI component that accepts tier data as props
 */
export function TierBadge({
  tierName,
  className,
  onClick,
  payoutTokenBoost,
  platformTokenBoost,
  payoutTokenLabel = "Token",
  showMultipliers = false,
}: TierBadgeProps) {
  return (
    <div className="flex flex-col gap-1.5 items-start">
      <Badge
        variant="purple"
        className={cn("gap-1 cursor-pointer hover:bg-purple-400/20 transition-colors", className)}
        onClick={onClick}
      >
        <Zap className="h-3 w-3" />
        <span>{tierName}</span>
      </Badge>
      {showMultipliers && payoutTokenBoost && platformTokenBoost && (
        <div className="flex items-center gap-1.5 text-[10px] font-medium">
          <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
            {payoutTokenBoost}x {payoutTokenLabel}
          </span>
          <span className="text-muted-foreground">+</span>
          <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
            {platformTokenBoost}x FP
          </span>
        </div>
      )}
    </div>
  );
}
