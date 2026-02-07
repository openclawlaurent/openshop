import { cn } from "@/lib/utils";

interface WalletVerificationStatusProps {
  compact?: boolean;
}

/**
 * Wallet verification loading status component
 * Shows during signature verification process
 */
export function WalletVerificationStatus({ compact }: WalletVerificationStatusProps) {
  return (
    <div
      className={cn(
        "bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800",
        compact ? "p-2" : "p-3",
      )}
    >
      <p className={cn("text-blue-700 dark:text-blue-300", compact ? "text-xs" : "text-sm")}>
        {compact ? "Verifying..." : "Verifying wallet..."}
      </p>
      {!compact && (
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          Please sign the message in your wallet to complete verification
        </p>
      )}
    </div>
  );
}
