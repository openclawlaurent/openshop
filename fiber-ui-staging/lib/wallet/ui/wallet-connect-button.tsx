import { ArrowRight } from "lucide-react";
import { Button } from "@/lib/ui/data-display/button";
import { cn } from "@/lib/utils";

interface WalletConnectButtonProps {
  onConnect: () => void;
  isConnecting: boolean;
  showHelpText?: boolean;
  helpText?: string;
  helpLink?: {
    text: string;
    url: string;
  };
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  compact?: boolean;
}

/**
 * Reusable wallet connect button
 * Used in onboarding, profile, and other wallet connection flows
 *
 * Shows:
 * - Connect button with loading state
 * - Optional help text for new users
 */
export function WalletConnectButton({
  onConnect,
  isConnecting,
  showHelpText = true,
  helpText = "New to crypto?",
  helpLink = {
    text: "Get a wallet",
    url: "https://phantom.app/",
  },
  size = "lg",
  className,
  compact,
}: WalletConnectButtonProps) {
  const buttonSize = compact ? "sm" : size;

  return (
    <div className={cn("space-y-3", compact && "space-y-1")}>
      <Button
        onClick={onConnect}
        disabled={isConnecting}
        className={cn("w-full", compact && "text-xs", className)}
        size={buttonSize}
      >
        {isConnecting ? "..." : compact ? "Connect" : "Connect Wallet"}
        {!isConnecting && !compact && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
      {showHelpText && !compact && (
        <p className="text-sm text-muted-foreground text-center">
          {helpText}{" "}
          <a
            href={helpLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {helpLink.text}
          </a>
          .
        </p>
      )}
    </div>
  );
}
