"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/lib/ui/overlay/sheet";
import { Zap } from "lucide-react";
import { BoostTier } from "../data-access/types";
import { TiersTable } from "../ui";
import { getTierColor } from "../content";

type BoostTiersDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boostTiers: BoostTier[];
  currentTierId: string;
  userAvatarUrl?: string | null;
};

/**
 * Feature component for displaying boost tiers in a drawer/sheet
 * Orchestrates the TiersTable UI component with tier data
 *
 * @param open - Whether the drawer is open
 * @param onOpenChange - Callback when the open state changes
 * @param boostTiers - Array of boost tiers to display
 * @param currentTierId - The ID of the user's current tier
 * @param userAvatarUrl - Optional URL for the user's avatar
 */
export function BoostTiersDrawer({
  open,
  onOpenChange,
  boostTiers,
  currentTierId,
  userAvatarUrl,
}: BoostTiersDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] sm:h-[85vh] overflow-y-auto p-4 sm:p-6">
        <SheetHeader className="text-center pb-4 sm:pb-6">
          <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-2 sm:mb-3">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
          </div>
          <SheetTitle className="text-xl sm:text-2xl">Boost Tiers</SheetTitle>
          <SheetDescription className="text-sm sm:text-base">
            Unlock more tokens as you stake more and shop more
          </SheetDescription>
        </SheetHeader>

        <div className="max-w-4xl mx-auto">
          <TiersTable
            tiers={boostTiers}
            currentTierId={currentTierId}
            userAvatarUrl={userAvatarUrl}
            getTierColor={getTierColor}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
