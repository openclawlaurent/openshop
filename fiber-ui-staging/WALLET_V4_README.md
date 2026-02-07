# Wallet V4 Implementation - Reown AppKit

This document describes the new wallet-v4 implementation using Reown AppKit for seamless Solana wallet connection across desktop and mobile devices.

## Overview

Wallet V4 solves the mobile wallet authentication problem by using a session token flow that works across different browser contexts (main browser → wallet app → back to app).

## Key Features

- ✅ **Reown AppKit Integration**: Modern wallet connection modal with excellent UX
- ✅ **Phantom & Solflare Support**: Only supports these two trusted wallets
- ✅ **Desktop & Mobile**: Works seamlessly on browser extensions and mobile deep-linking
- ✅ **Session Token Flow**: Solves authentication issues when redirecting from wallet apps
- ✅ **Security**: One-time tokens with 10-minute expiry, server-side validation
- ✅ **Mainnet Only**: Configured for production use (mainnet-beta by default)

## Architecture

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks "Connect Wallet" in /settings                │
│    (User is authenticated via Supabase)                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Generate one-time session token                          │
│    POST /api/wallet/generate-token                          │
│    Returns: { token, redirectUrl, expiresAt }               │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Redirect to /wallet?token=xyz (public page)              │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Validate token                                            │
│    POST /api/wallet/validate-token                          │
│    Returns: { valid: true, userId }                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. User connects wallet (Reown AppKit modal)                │
│    - Desktop: Browser extension opens                       │
│    - Mobile: Deep-links to wallet app                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. User signs verification message                          │
│    Message includes wallet address + timestamp              │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Verify signature and save wallet                         │
│    POST /api/wallet/verify                                  │
│    Updates user_profiles.solana_address                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Redirect back to /settings                               │
│    Wallet is now connected! ✅                               │
└─────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Get Reown Project ID

1. Visit [cloud.reown.com](https://cloud.reown.com)
2. Create a new project
3. Copy your Project ID
4. Add to your environment variables:

```bash
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here
```

### 2. Run Database Migration

Execute the migration to create the `wallet_session_tokens` table:

```bash
# If using Supabase CLI
supabase db push migrations/001_wallet_session_tokens.sql

# Or run the SQL directly in Supabase Dashboard > SQL Editor
```

### 3. Update Environment Variables

Ensure these are set:

```bash
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id
NEXT_PUBLIC_SOLANA_ENVIRONMENT=mainnet-beta  # or devnet, testnet
NEXT_PUBLIC_APP_URL=https://your-app.com     # for generating redirect URLs
```

## File Structure

```
components/
├── providers/
│   └── solana-wallet-v4-provider.tsx       # Reown AppKit setup
└── feature/
    └── wallet/
        └── wallet-connection-content-v4.tsx # UI component

lib/
├── hooks/
│   └── use-wallet-v4.ts                     # React hook for wallet operations
└── utils/
    └── wallet-session-token.ts              # Token generation/validation

app/
├── wallet/
│   └── page.tsx                             # Public wallet connection page
└── api/
    └── wallet/
        ├── generate-token/
        │   └── route.ts                     # Generate session token
        ├── validate-token/
        │   └── route.ts                     # Validate session token
        └── verify/
            └── route.ts                     # Verify wallet signature

migrations/
└── 001_wallet_session_tokens.sql           # Database schema
```

## Usage

### In a Component

```tsx
import { WalletConnectionContentV4 } from "@/components/feature/wallet/wallet-connection-content-v4";

export default function SettingsPage() {
  return (
    <div>
      <WalletConnectionContentV4 />
    </div>
  );
}
```

### Using the Hook

```tsx
import { useWalletV4 } from "@/lib/hooks/use-wallet-v4";

export default function MyComponent() {
  const { connected, publicKey, connect, signMessage } = useWalletV4();

  const handleConnect = async () => {
    connect(); // Opens Reown modal
  };

  const handleSign = async () => {
    if (!connected) return;
    const signature = await signMessage("Hello, Solana!");
    console.log(signature);
  };

  return (
    <div>
      {connected ? (
        <p>Connected: {publicKey}</p>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

## Security Considerations

### Session Tokens

- **One-time use**: Tokens are marked as used after validation
- **Short-lived**: 10-minute expiry to minimize attack window
- **Secure storage**: Stored in database, never in localStorage/cookies
- **User-bound**: Each token is tied to a specific user ID

### Wallet Verification

- **Signature verification**: All wallet connections require signing a message
- **Timestamp included**: Prevents replay attacks
- **Server-side validation**: All verification happens on the backend

### Database Security

- **RLS enabled**: Row-level security policies protect token access
- **User isolation**: Users can only read their own tokens
- **Auto-cleanup**: Expired tokens are automatically removed

## Mobile Considerations

### iOS

- Deep-linking to Phantom: `phantom://`
- Deep-linking to Solflare: `solflare://`
- Works in Safari and in-app browsers

### Android

- Deep-linking works via intent URLs
- Tested with Chrome and in-app browsers

### Common Issues

**Issue**: User gets stuck in wallet app browser
**Solution**: Session token flow handles this automatically - the /wallet page works without auth

**Issue**: Wallet connection times out
**Solution**: Tokens expire after 10 minutes. User needs to generate a new token.

## Testing

### Desktop Flow

1. Navigate to `/settings`
2. Click "Connect Wallet"
3. Should redirect to `/wallet?token=...`
4. Click "Connect Wallet" button
5. Reown modal appears with Phantom & Solflare options
6. Connect via browser extension
7. Sign the verification message
8. Should redirect back to `/settings` with wallet connected

### Mobile Flow

1. Open `/settings` on mobile device
2. Click "Connect Wallet"
3. Should redirect to `/wallet?token=...`
4. Click "Connect Wallet" button
5. Reown modal appears
6. Select Phantom or Solflare
7. Deep-links to wallet app
8. Approve connection in wallet app
9. Returns to `/wallet` page (works even if browser context changed)
10. Sign verification message
11. Redirects to `/settings` with wallet connected

## API Reference

### `POST /api/wallet/generate-token`

Generate a one-time session token for wallet connection.

**Auth Required**: Yes (Supabase session)

**Response**:

```json
{
  "token": "secure-random-token",
  "redirectUrl": "https://app.com/wallet?token=...",
  "expiresAt": "2024-01-01T12:00:00Z"
}
```

### `POST /api/wallet/validate-token`

Validate a session token and return associated user ID.

**Auth Required**: No

**Request**:

```json
{
  "token": "secure-random-token"
}
```

**Response**:

```json
{
  "valid": true,
  "userId": "user-uuid",
  "message": "Token validated successfully"
}
```

### `POST /api/wallet/verify`

Verify wallet signature and save to user profile.

**Auth Required**: Yes (Supabase session) OR valid session token

**Request**:

```json
{
  "walletAddress": "GjW8X...",
  "signature": "123,45,67,...",
  "network": "mainnet-beta",
  "userId": "user-uuid"
}
```

**Response**:

```json
{
  "success": true
}
```

## Comparison with Previous Versions

| Feature     | V1 (Old)                         | V4 (New)                         |
| ----------- | -------------------------------- | -------------------------------- |
| Library     | @solana/wallet-adapter           | Reown AppKit                     |
| Wallets     | Phantom, Solflare, Torus, Mobile | Phantom, Solflare only           |
| Mobile Auth | ❌ Browser context issues        | ✅ Session token flow            |
| Desktop     | ✅ Works                         | ✅ Works                         |
| UX          | Basic modal                      | ✨ Modern modal with better UX   |
| Security    | Message signing                  | Message signing + session tokens |

## Troubleshooting

### "No project ID" warning

Add `NEXT_PUBLIC_REOWN_PROJECT_ID` to your environment variables.

### "Invalid token" error

- Token may have expired (10 min limit)
- Token may have been used already (one-time use)
- Generate a new token by clicking "Connect Wallet" again

### Wallet not appearing in modal

- Only Phantom and Solflare are supported
- On mobile, ensure wallet app is installed
- On desktop, ensure browser extension is installed

### Signature verification fails

- Ensure network matches (mainnet vs devnet)
- Check that wallet signature is properly formatted
- Verify timestamp is recent (within a few minutes)

## Future Improvements

- [ ] Add support for hardware wallets (Ledger)
- [ ] Add support for more wallets (Backpack, Glow)
- [ ] Implement wallet switching (change connected wallet)
- [ ] Add transaction signing capabilities
- [ ] Enhanced mobile detection and redirects
- [ ] Rate limiting on token generation

## Support

For issues or questions:

1. Check this README
2. Review the Reown AppKit docs: https://docs.reown.com/appkit/overview
3. Open an issue in the repo
