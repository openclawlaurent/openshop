// ============================================================================
// ENUMS
// ============================================================================

export type CommissionStatus = "PENDING" | "CONFIRMED" | "READY" | "PAID";

export type CashbackTransactionStatus = "PENDING" | "CONFIRMED" | "READY" | "PAID" | "CANCELLED"; // CANCELLED is computed (when cashbackAmount < 0)

export type BlockchainTransactionStatus =
  | "INITIALIZED"
  | "QUEUED"
  | "SENT"
  | "CONFIRMED"
  | "FAILED";

// ============================================================================
// DATABASE TYPES (from Supabase views)
// ============================================================================

export interface CommissionActivitySummaryDB {
  id: number;
  wildfireCommissionId: number;
  saleAmount: number;
  saleCurrency: string;
  cashbackAmount: number;
  cashbackCurrency: string;
  eventDate: string; // ISO timestamp
  commissionStatus: CommissionStatus;
  cashbackExactAmount: number | null;
  wildfireModifiedAt: string | null;
  orderId: number | null;
  createdAt: string;
  updatedAt: string;

  // From orders
  merchantId: number | null;
  merchantName: string | null;
  userId: string | null;
  wildfireDeviceId: number;
  merchantOrderId: string | null;
  walletAddress: string | null;
  payoutPartnerTokenId: string | null;

  // Computed display fields
  displayStatus: CashbackTransactionStatus;
  truncatedWallet: string;
  formattedSaleAmount: string;
  formattedCashbackAmount: string;
  displayOrderId: string;

  // Expected transfer amounts
  expectedFinAmount: number;
  expectedPartnerTokenAmount: number | null;
  partnerTokenSwapStatus: BlockchainTransactionStatus | null;

  // Transaction existence flags
  hasMintTransactions: boolean;
  hasSwapTransactions: boolean;
  hasBurnTransactions: boolean;
  hasTransferTransactions: boolean;
  hasCompletedTransfers: boolean;
}

export interface CommissionBlockchainTransactionDB {
  transactionId: number;
  orderId: number | null;
  commissionId: number;
  commissionStatus: CommissionStatus;
  transactionType: "MINT" | "SWAP" | "BURN" | "TRANSFER";
  transactionStatus: BlockchainTransactionStatus;
  transactionHash: string | null;
  amount: number;
  tokenMint: string | null;
  tokenSymbol: string;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  formattedAmount: string;
  solscanUrl: string | null;
}

// ============================================================================
// UI TYPES (what React components consume)
// ============================================================================

export interface BlockchainTransactionUI {
  id: string;
  type: "MINT" | "SWAP" | "BURN" | "TRANSFER";
  amount: string;
  token: string;
  tokenMint: string;
  status: BlockchainTransactionStatus;
  transactionHash: string | null;
  solscanUrl: string | null;
  errorMessage: string | null;
}

export interface CashbackTransactionUI {
  id: string;
  merchant: string;
  saleAmount: string;
  date: string;
  walletAddress: string;
  fullWalletAddress: string;
  orderId: string;
  status: CashbackTransactionStatus;
  // Token amounts to display (already formatted and ready to show)
  displayAmounts: string[]; // e.g., ["8.19 FP", "0.18 BONK"]
  // Blockchain transactions for expandable details
  blockchainTransactions: BlockchainTransactionUI[];
}
