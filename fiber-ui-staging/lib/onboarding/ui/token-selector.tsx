import { Coins, Settings } from "lucide-react";
import { Button } from "@/lib/ui/data-display/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/ui/forms/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/lib/ui/overlay/dropdown-menu";
import { PartnerToken } from "@/lib/data/partner-tokens";
import { cn } from "@/lib/utils";

interface TokenSelectorProps {
  selectedTokenId: string;
  onTokenChange: (tokenId: string) => void;
  partnerTokens: PartnerToken[];
  isSaving: boolean;
  isEditing: boolean;
  onEditToggle: () => void;
  onCancelEdit: () => void;
  savedToken?: PartnerToken;
  compact?: boolean;
}

/**
 * Token selector component for onboarding
 * Allows users to select their preferred payout token
 */
export function TokenSelector({
  selectedTokenId,
  onTokenChange,
  partnerTokens,
  isSaving,
  isEditing,
  onEditToggle,
  onCancelEdit,
  savedToken,
  compact,
}: TokenSelectorProps) {
  const hasTokenSaved = Boolean(savedToken);

  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      <h3 className={cn("font-medium", compact ? "text-xs" : "text-base")}>Token</h3>

      {hasTokenSaved && !isEditing ? (
        <div
          className={cn(
            "flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200 dark:border-emerald-800",
            compact ? "px-2 h-9" : "p-3 gap-3",
          )}
        >
          <Coins
            className={cn(
              "text-emerald-600 dark:text-emerald-400 flex-shrink-0",
              compact ? "w-4 h-4" : "w-5 h-5",
            )}
          />
          <div className="flex-1 min-w-0">
            <div
              className={cn(
                "text-emerald-700 dark:text-emerald-300 font-semibold",
                compact ? "text-xs" : "text-sm",
              )}
            >
              {savedToken ? `${savedToken.name} (${savedToken.symbol})` : "Selected"}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-900 flex-shrink-0",
                  compact && "h-6 w-6 p-0",
                )}
              >
                <Settings className={cn(compact ? "w-3 h-3" : "w-4 h-4")} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEditToggle}>Change Token</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <>
          <Select value={selectedTokenId} onValueChange={onTokenChange} disabled={isSaving}>
            <SelectTrigger
              id="token-select"
              className={cn(compact ? "h-9 text-xs" : "h-12 text-base")}
            >
              <SelectValue placeholder={compact ? "Select" : "Select token"} />
            </SelectTrigger>
            <SelectContent>
              {partnerTokens.map((token) => (
                <SelectItem key={token.id} value={token.id}>
                  {token.name} ({token.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isSaving && (
            <p className={cn("text-muted-foreground text-center", compact ? "text-xs" : "text-sm")}>
              Saving...
            </p>
          )}
          {isEditing && (
            <Button
              onClick={onCancelEdit}
              variant="outline"
              className="w-full"
              size={compact ? "sm" : "lg"}
            >
              Cancel
            </Button>
          )}
        </>
      )}
    </div>
  );
}
