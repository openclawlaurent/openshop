import { CashbackTransactionUI } from "@/types/cashback-transaction";

/**
 * Demo data for testing the activity page
 * Shows various transaction states, crypto types, and blockchain transaction flows
 *
 * To use this demo data, uncomment the return statement in the activity page:
 * app/(authenticated)/tokens/page.tsx
 */

export const DEMO_ACTIVITY_TRANSACTIONS: CashbackTransactionUI[] = [
  // Completed transaction - FP + BONK
  {
    id: "1",
    merchant: "Amazon",
    saleAmount: "$125.00",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    walletAddress: "7xKXt...9zQp2",
    fullWalletAddress: "7xKXtGjP4mPaCkLVkSfzYN9zQp2",
    orderId: "TXN-123456",
    status: "PAID",
    displayAmounts: ["8.19 FP", "850,000 BONK"],
    blockchainTransactions: [
      {
        id: "mint-1",
        type: "MINT",
        amount: "8.19 FP",
        token: "FP",
        tokenMint: "FPxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        status: "CONFIRMED",
        transactionHash: "3KqZ8xJ2M8N9YhBvP4xR7WqL4tG8nS2jV1uA6kD3eF9h",
        solscanUrl: "https://solscan.io/tx/3KqZ8xJ2M8N9YhBvP4xR7WqL4tG8nS2jV1uA6kD3eF9h",
        errorMessage: null,
      },
      {
        id: "transfer-1-fp",
        type: "TRANSFER",
        amount: "8.19 FP",
        token: "FP",
        tokenMint: "FPxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        status: "CONFIRMED",
        transactionHash: "6OtC1aM5P1Q2BkEyS7aU0ZtO7wJ1qV5mY4xD9nG6hI2k",
        solscanUrl: "https://solscan.io/tx/6OtC1aM5P1Q2BkEyS7aU0ZtO7wJ1qV5mY4xD9nG6hI2k",
        errorMessage: null,
      },
      {
        id: "transfer-1-bonk",
        type: "TRANSFER",
        amount: "850,000 BONK",
        token: "BONK",
        tokenMint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        status: "CONFIRMED",
        transactionHash: "7PuD2bN6Q2R3ClFzT8bV1AuP8xK2rW6nZ5yE0oH7iJ3l",
        solscanUrl: "https://solscan.io/tx/7PuD2bN6Q2R3ClFzT8bV1AuP8xK2rW6nZ5yE0oH7iJ3l",
        errorMessage: null,
      },
    ],
  },

  // Completed transaction - FP + USDC
  {
    id: "2",
    merchant: "Sony",
    saleAmount: "$75.50",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    walletAddress: "9aLYv...3bRq4",
    fullWalletAddress: "9aLYvHkQ5nQbDmMwLwTgZo3bRq4",
    orderId: "TXN-789012",
    status: "PAID",
    displayAmounts: ["4.95 FP", "3.78 USDC"],
    blockchainTransactions: [
      {
        id: "mint-2",
        type: "MINT",
        amount: "4.95 FP",
        token: "FP",
        tokenMint: "FPxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        status: "CONFIRMED",
        transactionHash: "8QvE3cO7R3S4DmGaU9cW2BvQ9yL3sX7oA6zF1pH8jK4m",
        solscanUrl: "https://solscan.io/tx/8QvE3cO7R3S4DmGaU9cW2BvQ9yL3sX7oA6zF1pH8jK4m",
        errorMessage: null,
      },
      {
        id: "transfer-2-fp",
        type: "TRANSFER",
        amount: "4.95 FP",
        token: "FP",
        tokenMint: "FPxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        status: "CONFIRMED",
        transactionHash: "1TyH6fR0U6V7GpJdX2fZ5EyT2cO6vA0rD9cI4sK1mN7p",
        solscanUrl: "https://solscan.io/tx/1TyH6fR0U6V7GpJdX2fZ5EyT2cO6vA0rD9cI4sK1mN7p",
        errorMessage: null,
      },
      {
        id: "transfer-2-usdc",
        type: "TRANSFER",
        amount: "3.78 USDC",
        token: "USDC",
        tokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        status: "CONFIRMED",
        transactionHash: "2UzI7gS1V7W8HqKeY3gA6FzU3dP7wB1sE0dJ5tL2nO8q",
        solscanUrl: "https://solscan.io/tx/2UzI7gS1V7W8HqKeY3gA6FzU3dP7wB1sE0dJ5tL2nO8q",
        errorMessage: null,
      },
    ],
  },

  // Pending transaction - FP + BONK (swap in progress)
  {
    id: "3",
    merchant: "AT&T",
    saleAmount: "$200.00",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    walletAddress: "5cMZw...7dSt6",
    fullWalletAddress: "5cMZwIlR6oRcEnOxMzUhAp7dSt6",
    orderId: "TXN-345678",
    status: "PENDING",
    displayAmounts: ["13.12 FP", "1,350,000 BONK"],
    blockchainTransactions: [
      {
        id: "mint-3",
        type: "MINT",
        amount: "13.12 FP",
        token: "FP",
        tokenMint: "FPxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        status: "CONFIRMED",
        transactionHash: "3VaJ8hT2W8X9IrLfZ4hB7GaV4eQ8xC2tF1eK6uM3oP9r",
        solscanUrl: "https://solscan.io/tx/3VaJ8hT2W8X9IrLfZ4hB7GaV4eQ8xC2tF1eK6uM3oP9r",
        errorMessage: null,
      },
      {
        id: "swap-3",
        type: "SWAP",
        amount: "6.56 USDC → 1,350,000 BONK",
        token: "BONK",
        tokenMint: "",
        status: "CONFIRMED",
        transactionHash: "4WbK9iU3X9Y0JsMgA5iC8HbW5fR9yD3uG2fL7vN4pQ0s",
        solscanUrl: "https://solscan.io/tx/4WbK9iU3X9Y0JsMgA5iC8HbW5fR9yD3uG2fL7vN4pQ0s",
        errorMessage: null,
      },
    ],
  },

  // Pending transaction - FP only, swap in progress
  {
    id: "4",
    merchant: "Verizon",
    saleAmount: "$499.99",
    date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    walletAddress: "8eOAx...9fUv8",
    fullWalletAddress: "8eOAxJmS7pSdFoPyNaViCq9fUv8",
    orderId: "TXN-901234",
    status: "PENDING",
    displayAmounts: ["32.81 FP"],
    blockchainTransactions: [
      {
        id: "mint-4",
        type: "MINT",
        amount: "32.81 FP",
        token: "FP",
        tokenMint: "FPxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        status: "CONFIRMED",
        transactionHash: "5XcL0jV4Y0Z1KtNhB6jD9IcX6gS0zE4vH3gM8wO5qR1t",
        solscanUrl: "https://solscan.io/tx/5XcL0jV4Y0Z1KtNhB6jD9IcX6gS0zE4vH3gM8wO5qR1t",
        errorMessage: null,
      },
      {
        id: "swap-4",
        type: "SWAP",
        amount: "16.40 USDC → 0 BONK",
        token: "BONK",
        tokenMint: "",
        status: "SENT",
        transactionHash: null,
        solscanUrl: null,
        errorMessage: null,
      },
    ],
  },

  // Pending - no blockchain transactions yet
  {
    id: "5",
    merchant: "Home Depot",
    saleAmount: "$999.00",
    date: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    walletAddress: "4fPCz...3iYz2",
    fullWalletAddress: "4fPCzLoU9rUgGrQaObXkEs3iYz2",
    orderId: "TXN-112233",
    status: "PENDING",
    displayAmounts: ["65.56 FP"],
    blockchainTransactions: [],
  },

  // Completed with 3 different cryptos
  {
    id: "6",
    merchant: "Lowe's",
    saleAmount: "$85.00",
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    walletAddress: "6hRDa...5kAb4",
    fullWalletAddress: "6hRDaMpV0sVhHsSbPcYlFt5kAb4",
    orderId: "TXN-445566",
    status: "PAID",
    displayAmounts: ["5.58 FP", "4.25 USDC", "0.025 SOL"],
    blockchainTransactions: [
      {
        id: "mint-6",
        type: "MINT",
        amount: "5.58 FP",
        token: "FP",
        tokenMint: "FPxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        status: "CONFIRMED",
        transactionHash: "8AfO3mY7B3C4NwQkE9mG2LfA0jV3cH7yK6jP1aR8tU4w",
        solscanUrl: "https://solscan.io/tx/8AfO3mY7B3C4NwQkE9mG2LfA0jV3cH7yK6jP1aR8tU4w",
        errorMessage: null,
      },
      {
        id: "transfer-6-fp",
        type: "TRANSFER",
        amount: "5.58 FP",
        token: "FP",
        tokenMint: "FPxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        status: "CONFIRMED",
        transactionHash: "1DiR6pB0E6F7QzTnH2pJ5OiD3mY6fK0bN9mS4dU1wX7z",
        solscanUrl: "https://solscan.io/tx/1DiR6pB0E6F7QzTnH2pJ5OiD3mY6fK0bN9mS4dU1wX7z",
        errorMessage: null,
      },
      {
        id: "transfer-6-usdc",
        type: "TRANSFER",
        amount: "4.25 USDC",
        token: "USDC",
        tokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        status: "CONFIRMED",
        transactionHash: "2EjS7qC1F7G8RaUoI3qK6PjE4nZ7gL1cO0nT5eV2xY8a",
        solscanUrl: "https://solscan.io/tx/2EjS7qC1F7G8RaUoI3qK6PjE4nZ7gL1cO0nT5eV2xY8a",
        errorMessage: null,
      },
      {
        id: "transfer-6-sol",
        type: "TRANSFER",
        amount: "0.025 SOL",
        token: "SOL",
        tokenMint: "So11111111111111111111111111111111111111112",
        status: "CONFIRMED",
        transactionHash: "3FkT8rD2G8H9SbVpJ4rL7QkF5oA8hM2dP1oU6fW3yZ9b",
        solscanUrl: "https://solscan.io/tx/3FkT8rD2G8H9SbVpJ4rL7QkF5oA8hM2dP1oU6fW3yZ9b",
        errorMessage: null,
      },
    ],
  },

  // Pending with failed blockchain tx
  {
    id: "7",
    merchant: "Macy's",
    saleAmount: "$350.00",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    walletAddress: "1gSEb...7lCd6",
    fullWalletAddress: "1gSEbNqW1tWiItTcQdZmGu7lCd6",
    orderId: "TXN-778899",
    status: "PENDING",
    displayAmounts: [],
    blockchainTransactions: [
      {
        id: "mint-7",
        type: "MINT",
        amount: "22.94 FP",
        token: "FP",
        tokenMint: "FPxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        status: "FAILED",
        transactionHash: null,
        solscanUrl: null,
        errorMessage: "Insufficient SOL for transaction fees",
      },
    ],
  },

  // Completed - FP only
  {
    id: "8",
    merchant: "Gap",
    saleAmount: "$65.00",
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    walletAddress: "3hTFc...8mDe7",
    fullWalletAddress: "3hTFcPrX2uXjJuUdRfAmHv8mDe7",
    orderId: "TXN-998877",
    status: "PAID",
    displayAmounts: ["4.26 FP"],
    blockchainTransactions: [
      {
        id: "mint-8",
        type: "MINT",
        amount: "4.26 FP",
        token: "FP",
        tokenMint: "FPxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        status: "CONFIRMED",
        transactionHash: "4GlU9sE3I9J0RyVoK5sM6RgG6pC9hN3eQ2pV7gX4aA8c",
        solscanUrl: "https://solscan.io/tx/4GlU9sE3I9J0RyVoK5sM6RgG6pC9hN3eQ2pV7gX4aA8c",
        errorMessage: null,
      },
      {
        id: "transfer-8-fp",
        type: "TRANSFER",
        amount: "4.26 FP",
        token: "FP",
        tokenMint: "FPxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        status: "CONFIRMED",
        transactionHash: "7JoX2vH6L2M3UbYrN8vP9UjJ9sF2kQ6hT5sY0jA7dD1f",
        solscanUrl: "https://solscan.io/tx/7JoX2vH6L2M3UbYrN8vP9UjJ9sF2kQ6hT5sY0jA7dD1f",
        errorMessage: null,
      },
    ],
  },
];

/**
 * Demo stats that would be calculated from the demo transactions above
 */
export const DEMO_ACTIVITY_STATS = {
  completed: {
    items: [
      { token: "FP", amount: 27.96, formatted: "27.96 FP" },
      { token: "BONK", amount: 850000, formatted: "850,000 BONK" },
      { token: "USDC", amount: 12.31, formatted: "12.31 USDC" },
      { token: "SOL", amount: 0.025, formatted: "0.025 SOL" },
    ],
    count: 4,
  },
  pending: {
    items: [
      { token: "FP", amount: 111.49, formatted: "111.49 FP" },
      { token: "BONK", amount: 1350000, formatted: "1,350,000 BONK" },
    ],
    count: 4,
  },
};
