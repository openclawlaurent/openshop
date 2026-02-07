import { Wallet, Settings } from "lucide-react";
import { Button } from "@/lib/ui/data-display/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/lib/ui/overlay/dropdown-menu";
import { cn } from "@/lib/utils";

interface WalletStatusCardProps {
  walletAddress: string;
  showCopyOption?: boolean;
  showRemoveOption?: boolean;
  showManageOption?: boolean;
  isRemoving?: boolean;
  onCopy?: () => void;
  onRemove?: () => void;
  onManage?: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * Reusable wallet status card showing connected wallet address
 * Used in onboarding, profile, and other wallet connection flows
 *
 * Displays:
 * - Green success box with wallet icon
 * - Truncated wallet address
 * - Dropdown menu with options (copy, remove, manage)
 */
export function WalletStatusCard({
  walletAddress,
  showCopyOption = false,
  showRemoveOption = false,
  showManageOption = true,
  isRemoving = false,
  onCopy,
  onRemove,
  onManage,
  className,
  compact,
}: WalletStatusCardProps) {
  const truncateAddress = (address: string, short?: boolean) => {
    if (address.length <= 12) return address;
    if (short) return `${address.slice(0, 4)}...${address.slice(-4)}`;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const hasMenuOptions = showCopyOption || showRemoveOption || showManageOption;

  return (
    <div
      className={cn(
        "flex items-center bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200 dark:border-emerald-800",
        compact ? "gap-2 px-2 h-9" : "gap-3 p-3",
        className,
      )}
    >
      <Wallet
        className={cn(
          "text-emerald-600 dark:text-emerald-400 flex-shrink-0",
          compact ? "w-4 h-4" : "w-5 h-5",
        )}
      />
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "font-mono text-emerald-700 dark:text-emerald-300 font-semibold",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {truncateAddress(walletAddress, compact)}
        </div>
      </div>
      {hasMenuOptions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isRemoving}
              className={cn(
                "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-900 flex-shrink-0",
                compact && "h-6 w-6 p-0",
              )}
            >
              <Settings className={cn(compact ? "w-3 h-3" : "w-4 h-4")} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {showCopyOption && onCopy && (
              <DropdownMenuItem onClick={onCopy}>Copy Address</DropdownMenuItem>
            )}
            {showManageOption && onManage && (
              <DropdownMenuItem onClick={onManage}>Manage Wallet</DropdownMenuItem>
            )}
            {showRemoveOption && onRemove && (
              <DropdownMenuItem
                onClick={onRemove}
                className="text-red-600 dark:text-red-400"
                disabled={isRemoving}
              >
                {isRemoving ? "Removing..." : "Remove Wallet"}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
