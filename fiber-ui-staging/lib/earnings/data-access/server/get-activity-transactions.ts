import { createClient } from "@/lib/supabase/server";
import {
  CommissionActivitySummaryDB,
  CommissionBlockchainTransactionDB,
  CashbackTransactionUI,
  BlockchainTransactionUI,
} from "@/types/cashback-transaction";
import type { ActivityStatsData, CryptoAmount } from "../../content/types";
import { formatCryptoAmount } from "@/lib/utils/crypto-formatter";

/**
 * Fetch activity transactions and calculate stats for a user
 * Server-side only - uses Supabase client with RLS
 */
export async function getActivityTransactions(userId: string): Promise<{
  completedTransactions: CashbackTransactionUI[];
  pendingTransactions: CashbackTransactionUI[];
  stats: ActivityStatsData;
}> {
  const supabase = await createClient();

  // Feature flag to disable FIN token transactions
  const finEnabled = false;

  // Query 1: Get commission summaries for this user
  const { data: summaries, error: summariesError } = await supabase
    .from("commission_activity_summary")
    .select("*")
    .eq("userId", userId)
    .order("eventDate", { ascending: false })
    .limit(50);

  if (summariesError) {
    console.error("Error fetching commission summaries:", summariesError);
    return {
      completedTransactions: [],
      pendingTransactions: [],
      stats: { completed: { items: [], count: 0 }, pending: { items: [], count: 0 } },
    };
  }

  if (!summaries || summaries.length === 0) {
    return {
      completedTransactions: [],
      pendingTransactions: [],
      stats: { completed: { items: [], count: 0 }, pending: { items: [], count: 0 } },
    };
  }

  // Query 2: Get all blockchain transactions for these commissions
  const commissionIds = summaries.map((s) => s.id);
  const { data: transactions, error: transactionsError } = await supabase
    .from("commission_blockchain_transactions")
    .select("*")
    .in("commissionId", commissionIds)
    .order("createdAt", { ascending: true });

  if (transactionsError) {
    console.error("Error fetching blockchain transactions:", transactionsError);
    return {
      completedTransactions: [],
      pendingTransactions: [],
      stats: { completed: { items: [], count: 0 }, pending: { items: [], count: 0 } },
    };
  }

  // Group transactions by commission ID
  const transactionsByCommissionId = new Map<number, CommissionBlockchainTransactionDB[]>();
  transactions?.forEach((tx) => {
    const existing = transactionsByCommissionId.get(tx.commissionId) || [];
    transactionsByCommissionId.set(tx.commissionId, [...existing, tx]);
  });

  // Helper function to format blockchain transactions
  const formatBlockchainTx = (tx: CommissionBlockchainTransactionDB): BlockchainTransactionUI => ({
    id: tx.transactionId.toString(),
    type: tx.transactionType,
    amount: tx.formattedAmount,
    token: tx.tokenSymbol,
    tokenMint: tx.tokenMint || "",
    status: tx.transactionStatus,
    transactionHash: tx.transactionHash,
    solscanUrl: tx.solscanUrl,
    errorMessage: tx.errorMessage,
  });

  // Separate completed and pending transactions
  const completedTransactions: CashbackTransactionUI[] = [];
  const pendingTransactions: CashbackTransactionUI[] = [];

  // For stats aggregation
  const completedEarningsMap = new Map<string, number>();
  const pendingEarningsMap = new Map<string, number>();

  summaries.forEach((summary: CommissionActivitySummaryDB) => {
    const commissionTxs = transactionsByCommissionId.get(summary.id) || [];

    // Filter blockchain transactions (remove FIN if disabled)
    const filteredTxs = commissionTxs
      .filter((tx) => finEnabled || tx.tokenSymbol !== "FIN")
      .map(formatBlockchainTx);

    const isCompleted =
      summary.displayStatus === "CONFIRMED" ||
      summary.displayStatus === "READY" ||
      summary.displayStatus === "PAID";

    if (isCompleted) {
      // COMPLETED: Get amounts from MINT (FP) and TRANSFER (partner token) transactions
      const displayAmounts: string[] = [];

      // Add FP from MINT
      filteredTxs
        .filter((tx) => tx.type === "MINT" && tx.status === "CONFIRMED")
        .forEach((tx) => {
          const match = tx.amount.match(/^([\d,]+\.?\d*)\s*(\w+)/);
          if (match) {
            const amount = parseFloat(match[1].replace(/,/g, ""));
            const token = match[2];
            displayAmounts.push(formatCryptoAmount(amount, token));

            // Aggregate for stats
            const current = completedEarningsMap.get(token) || 0;
            completedEarningsMap.set(token, current + amount);
          }
        });

      // Add partner tokens from TRANSFER
      filteredTxs
        .filter((tx) => tx.type === "TRANSFER" && tx.status === "CONFIRMED")
        .forEach((tx) => {
          const match = tx.amount.match(/^([\d,]+\.?\d*)\s*(\w+)/);
          if (match) {
            const amount = parseFloat(match[1].replace(/,/g, ""));
            const token = match[2];
            displayAmounts.push(formatCryptoAmount(amount, token));

            // Aggregate for stats
            const current = completedEarningsMap.get(token) || 0;
            completedEarningsMap.set(token, current + amount);
          }
        });

      completedTransactions.push({
        id: summary.id.toString(),
        merchant: summary.merchantName || "Unknown Merchant",
        saleAmount: summary.formattedSaleAmount,
        date: summary.eventDate,
        walletAddress: summary.truncatedWallet,
        fullWalletAddress: summary.walletAddress || "",
        orderId: summary.displayOrderId,
        status: summary.displayStatus,
        displayAmounts,
        blockchainTransactions: filteredTxs,
      });
    } else {
      // PENDING: Get amounts from MINT (FP) and create placeholder TRANSFER for partner token
      const displayAmounts: string[] = [];
      const pendingBlockchainTxs: BlockchainTransactionUI[] = [];

      // Add FP from MINT
      filteredTxs
        .filter((tx) => tx.type === "MINT")
        .forEach((tx) => {
          const match = tx.amount.match(/^([\d,]+\.?\d*)\s*(\w+)/);
          if (match) {
            const amount = parseFloat(match[1].replace(/,/g, ""));
            const token = match[2];
            displayAmounts.push(formatCryptoAmount(amount, token));

            // Aggregate for stats
            const current = pendingEarningsMap.get(token) || 0;
            pendingEarningsMap.set(token, current + amount);
          }
          // Include MINT in blockchain transactions
          pendingBlockchainTxs.push(tx);
        });

      // Get partner token info from SWAP (for display amounts and stats)
      // But create a placeholder TRANSFER transaction instead of showing SWAP
      filteredTxs
        .filter((tx) => tx.type === "SWAP")
        .forEach((tx) => {
          // Extract toAmount from "X USDC → Y BONK" format
          const match = tx.amount.match(/→\s*([\d.,]+)\s*(\w+)/);
          if (match) {
            const amount = parseFloat(match[1].replace(/,/g, ""));
            const token = match[2];
            displayAmounts.push(formatCryptoAmount(amount, token));

            // Aggregate for stats
            const current = pendingEarningsMap.get(token) || 0;
            pendingEarningsMap.set(token, current + amount);

            // Create placeholder TRANSFER transaction
            pendingBlockchainTxs.push({
              id: `${tx.id}-transfer`,
              type: "TRANSFER",
              amount: formatCryptoAmount(amount, token),
              token: token,
              tokenMint: tx.tokenMint,
              status: "INITIALIZED",
              transactionHash: null,
              solscanUrl: null,
              errorMessage: null,
            });
          }
        });

      // If no blockchain transactions yet, use expected amounts
      if (displayAmounts.length === 0) {
        if (summary.expectedFinAmount !== null && summary.expectedFinAmount !== undefined) {
          displayAmounts.push(formatCryptoAmount(summary.expectedFinAmount, "FP"));
          const current = pendingEarningsMap.get("FP") || 0;
          pendingEarningsMap.set("FP", current + summary.expectedFinAmount);
        }
        if (summary.expectedPartnerTokenAmount !== null) {
          // We don't have token symbol here, but it should be in the partner token
          displayAmounts.push(formatCryptoAmount(summary.expectedPartnerTokenAmount, "Token"));
        }
      }

      pendingTransactions.push({
        id: summary.id.toString(),
        merchant: summary.merchantName || "Unknown Merchant",
        saleAmount: summary.formattedSaleAmount,
        date: summary.eventDate,
        walletAddress: summary.truncatedWallet,
        fullWalletAddress: summary.walletAddress || "",
        orderId: summary.displayOrderId,
        status: summary.displayStatus,
        displayAmounts,
        blockchainTransactions: pendingBlockchainTxs,
      });
    }
  });

  // Format stats
  const completedItems: CryptoAmount[] = Array.from(completedEarningsMap.entries())
    .map(([token, amount]) => ({
      token,
      amount,
      formatted: formatCryptoAmount(amount, token),
    }))
    .sort((a, b) => b.amount - a.amount);

  const pendingItems: CryptoAmount[] = Array.from(pendingEarningsMap.entries())
    .map(([token, amount]) => ({
      token,
      amount,
      formatted: formatCryptoAmount(amount, token),
    }))
    .sort((a, b) => b.amount - a.amount);

  // Transactions are already sorted by eventDate from the database query
  return {
    completedTransactions,
    pendingTransactions,
    stats: {
      completed: {
        items: completedItems,
        count: completedTransactions.length,
      },
      pending: {
        items: pendingItems,
        count: pendingTransactions.length,
      },
    },
  };
}
