import { WalletStatusCard, WalletConnectButton, WalletVerificationStatus } from "@/lib/wallet/ui";
import { cn } from "@/lib/utils";

interface WalletConnectorProps {
  existingWallet?: string;
  isConnecting: boolean;
  onConnect: () => void;
  compact?: boolean;
}

/**
 * Wallet connector component for onboarding
 * Handles wallet connection UI and status display
 */
export function WalletConnector({
  existingWallet,
  isConnecting,
  onConnect,
  compact,
}: WalletConnectorProps) {
  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      <h3 className={cn("font-medium", compact ? "text-xs" : "text-base")}>Wallet</h3>

      {existingWallet ? (
        <WalletStatusCard walletAddress={existingWallet} compact={compact} />
      ) : isConnecting ? (
        <WalletVerificationStatus compact={compact} />
      ) : (
        <WalletConnectButton onConnect={onConnect} isConnecting={isConnecting} compact={compact} />
      )}
    </div>
  );
}
