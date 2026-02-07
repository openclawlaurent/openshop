"use client";

import { Badge } from "@/lib/ui/data-display/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/ui/overlay/dialog";
import { Info } from "lucide-react";

export type TransactionStatus = "PENDING" | "CONFIRMED" | "READY" | "PAID" | "CANCELLED" | "help";

interface StatusBadgeProps {
  status: TransactionStatus;
  title?: string;
  children?: React.ReactNode;
  showInfo?: boolean;
}

export function StatusBadge({ status, title, children, showInfo = true }: StatusBadgeProps) {
  const getStatusConfig = (status: TransactionStatus) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Pending",
          variant: "yellow" as const,
          title: "Why are my tokens pending?",
          content: (
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                Pending transactions typically require <strong>30+ days</strong> to complete due to
                the redemption gap - a verification period that protects all parties.
              </div>
              <div>During this time, merchants verify that:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Your order wasn&apos;t cancelled or returned</li>
                <li>Payment was successfully processed</li>
                <li>No fraudulent activity occurred</li>
                <li>All terms and conditions were met</li>
              </ul>
              <div>
                This multi-step verification process moves through:{" "}
                <strong>Pending → Completed</strong>, ensuring accurate and legitimate tokens back.
              </div>
              <div className="text-sm text-muted-foreground">
                Some purchases have extended verification periods and require actual completion of
                the service:
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Hotels: Must complete your stay (not just book)</li>
                <li>Flights: Must complete travel without cancellation</li>
                <li>Subscriptions: Must maintain active service beyond trial periods</li>
                <li>Large purchases: May require extended fraud verification</li>
              </ul>
            </div>
          ),
        };
      // case "CONFIRMED":
      // case "READY":
      // return {
      //   label: "Processing",
      //   variant: "blue" as const,
      //   title: "Cashback Processing",
      //   content: (
      //     <div className="space-y-3 text-sm text-muted-foreground">
      //       <div>
      //         Your cashback has been confirmed by the merchant and is being processed for payout.
      //       </div>
      //       <div className="font-medium text-sm">What&apos;s happening:</div>
      //       <ul className="list-disc list-inside space-y-1 text-sm">
      //         <li>Tokens are being minted or transferred to your wallet</li>
      //         <li>Transactions are being recorded on the Solana blockchain</li>
      //         <li>You&apos;ll receive your tokens once processing completes</li>
      //       </ul>
      //       <div className="text-sm text-muted-foreground mt-2">
      //         This usually takes a few minutes to complete.
      //       </div>
      //     </div>
      //   ),
      // };
      case "CONFIRMED":
      case "READY":
      case "PAID":
        return {
          label: "Paid",
          variant: "green" as const,
          title: "Cashback Successfully Paid Out",
          content: (
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                🎉 <strong>Congratulations!</strong> Your tokens have been successfully processed
                and paid out to your wallet.
              </div>
              <div>
                This transaction has completed the full verification process and your tokens have
                been transferred to your connected wallet address.
              </div>
              <div className="font-medium text-sm">What happened:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Merchant confirmed your purchase was valid</li>
                <li>All verification checks passed successfully</li>
                <li>Tokens were transferred to your wallet</li>
                <li>Transaction was recorded on the Solana blockchain</li>
              </ul>
            </div>
          ),
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          variant: "destructive" as const,
          title: "Transaction Cancelled",
          content: (
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                This transaction has been cancelled or reversed, typically due to an order return or
                cancellation.
              </div>
              <div className="font-medium text-sm">Common reasons for cancellation:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Order was returned to the merchant</li>
                <li>Purchase was cancelled before completion</li>
                <li>Payment was refunded or reversed</li>
                <li>Order didn&apos;t meet terms and conditions</li>
              </ul>
              <div className="text-sm">
                Any previously pending tokens for this transaction will not be paid out.
              </div>
            </div>
          ),
        };
      case "help":
        return {
          label: "Help",
          variant: "gray" as const,
          title: title || "Help",
          content: <div className="space-y-3 text-sm text-muted-foreground">{children}</div>,
        };
      default:
        console.log("Unknown transaction status encountered:", {
          status,
          statusType: typeof status,
          statusValue: status,
        });
        return {
          label: "Unknown",
          variant: "gray" as const,
          title: "Unknown Status",
          content: (
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>This transaction status is being processed.</div>
            </div>
          ),
        };
    }
  };

  const config = getStatusConfig(status);

  if (!showInfo) {
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Badge variant={config.variant} className="cursor-pointer">
          <Info className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-4">
          <DialogTitle className="mb-3">{config.title}</DialogTitle>
          {config.content}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
