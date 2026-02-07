# Wallet V4 Setup Checklist

## ✅ Completed

- [x] Installed Reown AppKit packages
- [x] Created JWT-based session token authentication (no database required!)
- [x] Implemented wallet-v4 provider with Phantom & Solflare support
- [x] Created wallet connection hook (useWalletV4)
- [x] Built public /wallet connection page
- [x] Created new wallet connection UI component (v4)
- [x] Added session token API endpoints
- [x] Added provider to app layout
- [x] Updated payouts page to use v4
- [x] All TypeScript checks pass ✅
- [x] All ESLint checks pass ✅
- [x] Code formatted with Prettier ✅

## 🔧 Required Setup Steps

### 1. Get Reown Project ID (Required)

1. Go to [cloud.reown.com](https://cloud.reown.com)
2. Create a new project
3. Copy your Project ID
4. Add to Doppler or `.env.local`:

```bash
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here
```

### 2. Update Environment Variables (Required)

Ensure these are set in your environment:

```bash
# Required for Reown AppKit
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id

# Already set, but verify
NEXT_PUBLIC_SOLANA_ENVIRONMENT=mainnet-beta
NEXT_PUBLIC_APP_URL=https://your-app.com
```

### 3. That's It! ✅

The implementation is ready to use. The payouts page already uses wallet v4!

## 🧪 Testing

### Desktop Testing

1. Start dev server: `pnpm run dev`
2. Navigate to `/settings`
3. Click "Connect Wallet"
4. Should redirect to `/wallet?token=...`
5. Click "Connect Wallet" button
6. Reown modal should appear with Phantom & Solflare
7. Connect via browser extension
8. Sign the verification message
9. Should redirect to `/settings` with wallet connected ✅

### Mobile Testing

1. Open app on mobile device
2. Navigate to `/settings`
3. Click "Connect Wallet"
4. Should redirect to `/wallet?token=...` (works in any browser context)
5. Click "Connect Wallet"
6. Select Phantom or Solflare
7. Should deep-link to wallet app
8. Approve connection
9. Sign message
10. Returns to app with wallet connected ✅

## 📁 New Files Created

```
components/
├── providers/
│   └── solana-wallet-v4-provider.tsx          ✅
└── feature/
    └── wallet/
        └── wallet-connection-content-v4.tsx   ✅

lib/
├── hooks/
│   └── use-wallet-v4.ts                       ✅
└── utils/
    └── wallet-session-token.ts                ✅

app/
├── wallet/
│   └── page.tsx                               ✅ (public page)
└── api/
    └── wallet/
        ├── generate-token/route.ts            ✅
        └── validate-token/route.ts            ✅

Documentation:
├── WALLET_V4_README.md                        ✅ (full docs)
└── WALLET_V4_SETUP.md                         ✅ (this file)
```

## 🔐 Security Features

- ✅ JWT-based signed tokens (no database needed!)
- ✅ 10-minute token expiry
- ✅ Server-side signature verification
- ✅ Cryptographically signed with HMAC-SHA256
- ✅ Timestamp in signed messages (replay protection)
- ✅ No sensitive data in localStorage

## 🎯 How It Works

The session token flow solves the mobile wallet authentication problem:

1. **User is authenticated** in your app (Supabase session)
2. **Generate JWT**: Click "Connect Wallet" → generates signed JWT token with userId
3. **Redirect to /wallet**: Public page that works in any browser context
4. **Token validation**: Page validates JWT signature, extracts user ID
5. **Connect wallet**: User connects via Reown AppKit (Phantom/Solflare)
6. **Sign message**: Cryptographic proof of wallet ownership
7. **Save to profile**: Backend verifies signature, saves wallet address
8. **Done!**: Redirects back to payouts/settings, wallet is connected ✅

Works seamlessly whether user is on:

- Desktop with browser extension ✅
- Mobile browser that redirects to wallet app ✅
- In-app browser inside wallet app ✅

## 🆚 Comparison with Old Implementation

| Feature             | Old (V1/V2)           | New (V4)                |
| ------------------- | --------------------- | ----------------------- |
| Mobile deep-linking | ❌ Loses auth session | ✅ Session token flow   |
| Desktop             | ✅ Works              | ✅ Works                |
| UI/UX               | Basic modal           | ✨ Modern Reown modal   |
| Wallets             | Multiple              | Phantom & Solflare only |
| Security            | Signature only        | Signature + JWT tokens  |

## 📞 Support

For questions or issues:

1. Check [WALLET_V4_README.md](./WALLET_V4_README.md) for detailed docs
2. Review the Reown docs: https://docs.reown.com/appkit/overview
3. Check the implementation in the new files listed above

## ⚡ Quick Start

```bash
# 1. Get Reown Project ID from cloud.reown.com
# 2. Add to environment
echo "NEXT_PUBLIC_REOWN_PROJECT_ID=your_id" >> .env.local

# 3. Start dev server
pnpm run dev

# 4. Test wallet connection at /payouts
```

That's it! The wallet v4 implementation is ready to use. 🎉
