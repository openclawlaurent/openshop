"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/ui/layout/card";
import { Button } from "@/lib/ui/data-display/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/lib/ui/layout/collapsible";
import { Badge } from "@/lib/ui/data-display/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/ui/overlay/dialog";
import { ChevronDown, ChevronRight, ExternalLink, Copy, Check, HelpCircle } from "lucide-react";
import { CashbackTransactionUI, BlockchainTransactionUI } from "@/types/cashback-transaction";
import { trackEvent } from "@/lib/analytics/posthog";
import { formatCryptoAmount } from "@/lib/utils/crypto-formatter";
import { StatusBadge } from "@/lib/offers/ui/status-badge";

export interface CashbackTransactionsProps {
  completedTransactions: CashbackTransactionUI[];
  pendingTransactions: CashbackTransactionUI[];
}

function BlockchainTransactionRow({ tx }: { tx: BlockchainTransactionUI }) {
  const statusColors: Record<string, string> = {
    INITIALIZED: "text-gray-500",
    QUEUED: "text-blue-500",
    SENT: "text-yellow-500",
    CONFIRMED: "text-emerald-600",
    FAILED: "text-red-500",
  };

  const typeLabels: Record<string, string> = {
    MINT: "Mint",
    SWAP: "Swap",
    BURN: "Burn",
    TRANSFER: "Transfer",
  };

  const statusLabels: Record<string, string> = {
    INITIALIZED: "Awaiting Merchant Confirmation",
    QUEUED: "Awaiting Merchant Confirmation",
    SENT: "Awaiting Merchant Confirmation",
    CONFIRMED: "Confirmed",
    FAILED: "Failed",
  };

  // Reformat the amount using our formatter for consistency
  const formattedAmount = (() => {
    // Handle SWAP transactions with "X USDC → Y BONK" format
    if (tx.type === "SWAP") {
      const swapMatch = tx.amount.match(/([\d,]+\.?\d*)\s*(\w+)\s*→\s*([\d,]+\.?\d*)\s*(\w+)/);
      if (swapMatch) {
        const fromAmount = parseFloat(swapMatch[1].replace(/,/g, ""));
        const fromToken = swapMatch[2];
        const toAmount = parseFloat(swapMatch[3].replace(/,/g, ""));
        const toToken = swapMatch[4];
        return `${formatCryptoAmount(fromAmount, fromToken)} → ${formatCryptoAmount(toAmount, toToken)}`;
      }
    }

    // Extract numeric value from the formatted string (e.g., "123.45 USDC" -> 123.45)
    const match = tx.amount.match(/^([\d,]+\.?\d*)/);
    if (match) {
      const numericValue = parseFloat(match[1].replace(/,/g, ""));
      return formatCryptoAmount(numericValue, tx.token);
    }
    // Fallback to original if parsing fails
    return tx.amount;
  })();

  const isPending = ["INITIALIZED", "QUEUED", "SENT"].includes(tx.status);

  return (
    <div className="overflow-x-auto -mx-3 px-3">
      <div
        className={`flex items-center justify-between py-2 px-3 bg-muted/30 rounded-md min-w-max ${isPending ? "opacity-50" : ""}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground min-w-[60px]">
            {typeLabels[tx.type]}
          </span>
          <span
            className={`text-sm font-medium ${isPending ? "text-muted-foreground" : statusColors[tx.status]}`}
          >
            {formattedAmount}
          </span>
          {tx.transactionHash && tx.solscanUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => window.open(tx.solscanUrl!, "_blank")}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              <span className="text-xs">View on Solscan</span>
            </Button>
          )}
        </div>
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {statusLabels[tx.status]}
        </div>
      </div>
    </div>
  );
}

export function CashbackTransactions({
  completedTransactions,
  pendingTransactions,
}: CashbackTransactionsProps) {
  const [openTransactions, setOpenTransactions] = useState<Set<string>>(new Set());
  const [copiedAddresses, setCopiedAddresses] = useState<Set<string>>(new Set());

  const copyToClipboard = async (text: string, transactionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddresses((prev) => new Set(prev).add(transactionId));

      setTimeout(() => {
        setCopiedAddresses((prev) => {
          const newSet = new Set(prev);
          newSet.delete(transactionId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const getRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return date.toLocaleDateString();
  };

  const getFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const toggleTransaction = (id: string) => {
    const newOpenTransactions = new Set(openTransactions);
    if (newOpenTransactions.has(id)) {
      newOpenTransactions.delete(id);
    } else {
      newOpenTransactions.add(id);
    }
    setOpenTransactions(newOpenTransactions);
  };

  // Combine all transactions for display with pending flag and sort by date descending
  const allTransactions = [
    ...completedTransactions.map((t) => ({ ...t, isPending: false })),
    ...pendingTransactions.map((t) => ({ ...t, isPending: true })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card data-testid="cashback-transactions-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transactions</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Badge variant="gray" className="cursor-pointer hover:bg-gray-400/15">
              <HelpCircle className="h-3.5 w-3.5 mr-1" />
              Help
            </Badge>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="pb-4">
              <DialogTitle className="mb-3">Token Earning Processing Information</DialogTitle>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Your token earning transactions may take up to <strong>10 days</strong> to appear
                  here after completing an offer.
                </p>
                <p>
                  We rely on merchants to notify us when purchases are completed and verified. This
                  process can vary by merchant and may include:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Order confirmation and payment processing</li>
                  <li>Merchant verification of purchase completion</li>
                  <li>Anti-fraud checks and validation</li>
                  <li>Return period considerations</li>
                </ul>
                <p>
                  If you don&apos;t see a transaction after 10 days, please contact our support
                  team.
                </p>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {allTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions yet. Complete an offer to start earning tokens!
          </div>
        ) : (
          <div className="space-y-2">
            {allTransactions.map((transaction) => (
              <Collapsible
                key={transaction.id}
                open={openTransactions.has(transaction.id)}
                onOpenChange={() => toggleTransaction(transaction.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full h-auto py-3 px-4 hover:bg-accent/50 transition-colors justify-between"
                    onClick={() => {
                      trackEvent.activityItemExpanded({
                        transaction_id: transaction.id,
                        merchant_name: transaction.merchant,
                      });
                    }}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex items-center">
                        {openTransactions.has(transaction.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-emerald-600">
                          {transaction.displayAmounts.length > 0 ? (
                            transaction.displayAmounts.join(" + ")
                          ) : (
                            <Badge variant="yellow">Pending</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {transaction.merchant}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {getRelativeDate(transaction.date)}
                        </div>
                        {transaction.isPending && (
                          <Badge variant="yellow" className="text-xs mt-1">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 pt-2">
                  <div className="border-t border-border pt-4 space-y-4">
                    {/* Transaction Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="min-w-0">
                        <span className="text-muted-foreground">Merchant:</span>
                        <p className="font-medium truncate">{transaction.merchant}</p>
                      </div>
                      <div className="min-w-0">
                        <span className="text-muted-foreground">Order ID:</span>
                        <p className="font-medium break-all">{transaction.orderId}</p>
                      </div>
                      <div className="min-w-0">
                        <span className="text-muted-foreground">Purchase Amount:</span>
                        <p className="font-medium">{transaction.saleAmount}</p>
                      </div>
                      <div className="min-w-0">
                        <span className="text-muted-foreground">Transaction Date:</span>
                        <p className="font-medium">{getFullDate(transaction.date)}</p>
                      </div>
                      <div className="min-w-0">
                        <span className="text-muted-foreground">Payout Address:</span>
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="font-medium font-mono truncate">
                            {transaction.walletAddress}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 shrink-0"
                            onClick={() =>
                              copyToClipboard(transaction.fullWalletAddress, transaction.id)
                            }
                          >
                            {copiedAddresses.has(transaction.id) ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <span className="text-muted-foreground">Status:</span>
                        <div className="mt-1">
                          <StatusBadge status={transaction.status} />
                        </div>
                      </div>
                    </div>

                    {/* Blockchain Transactions */}
                    {transaction.blockchainTransactions.length > 0 && (
                      <div className="space-y-2">
                        {/* <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Blockchain Transactions
                        </h4> */}
                        {transaction.blockchainTransactions.map((tx) => (
                          <BlockchainTransactionRow key={tx.id} tx={tx} />
                        ))}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
