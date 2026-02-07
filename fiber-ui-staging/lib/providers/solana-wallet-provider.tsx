"use client";

import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solana, solanaTestnet, solanaDevnet } from "@reown/appkit/networks";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useMemo } from "react";

// Get project ID from environment (you'll need to get this from dashboard.reown.com)
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "";

if (!projectId) {
  console.warn(
    "NEXT_PUBLIC_REOWN_PROJECT_ID is not set. Please get your project ID from https://cloud.reown.com",
  );
}

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  // Configure Solana adapter with MetaMask, Phantom, and Solflare
  useMemo(() => {
    // Determine network based on environment
    const env = process.env.NEXT_PUBLIC_SOLANA_ENVIRONMENT?.toLowerCase();
    let networks: [typeof solana] | [typeof solanaDevnet] | [typeof solanaTestnet];

    switch (env) {
      case "devnet":
        networks = [solanaDevnet];
        break;
      case "testnet":
        networks = [solanaTestnet];
        break;
      case "mainnet":
      case "mainnet-beta":
      case "production":
      default:
        networks = [solana]; // Mainnet only by default
    }

    const solanaWeb3JsAdapter = new SolanaAdapter({
      wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    });

    const metadata = {
      name: "Fiber",
      description: "Fiber - Connect your Solana wallet",
      url: typeof window !== "undefined" ? window.location.origin : "https://fiber.shop",
      icons: [
        typeof window !== "undefined"
          ? `${window.location.origin}/icon.png`
          : "https://fiber.shop/icon.png",
      ],
    };

    createAppKit({
      adapters: [solanaWeb3JsAdapter],
      networks: networks,
      metadata: metadata,
      projectId,
      features: {
        analytics: false, // Disable analytics
        socials: false, // Disable social logins
        email: false, // Disable email login
        onramp: false, // Disable on-ramp features
      },
      // Allow "All Wallets" button to show on all devices
      allWallets: "SHOW",
      // Customize modal appearance
      themeMode: "light",
      themeVariables: {
        "--w3m-accent": "#000000",
      },
      // includeWalletIds restricts to ONLY these wallets (overrides all defaults)
      includeWalletIds: [
        "a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393", // Phantom
        "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // MetaMask
        "1ca0bdd4747578705b1939af023d120677c64fe6ca76add81fda36e350605e79", // Solflare (official Reown ID)
      ],
      // Also feature these wallets (shows them first in the list)
      featuredWalletIds: [
        "a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393", // Phantom
        "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // MetaMask
        "1ca0bdd4747578705b1939af023d120677c64fe6ca76add81fda36e350605e79", // Solflare (official Reown ID)
      ],
      // Explicitly exclude hardware wallets and others
      // excludeWalletIds: [
      //   "19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927", // Ledger
      //   "09f0b41c9d89f6c3cf05c27285b35a365f5c26afd4515f8c64a1d3f84a8e0b98", // Trezor
      // ],
      // Not using SIWE
      siweConfig: undefined,
    });
  }, []);

  return <>{children}</>;
}
