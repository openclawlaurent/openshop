# Fetch Wallet Setup - Monad Mainnet

**Created:** Feb 6, 2026 21:35 GMT+1  
**Status:** Awaiting Laurent to send MON for gas fees

## Wallet Address

```
0x790b405d466f7fddcee4be90d504eb56e3fedcae
```

**Share this address with Laurent to receive MON.**

---

## Stored Securely

- ✅ Private key stored in `.env` (not committed to git)
- ✅ `.env` added to `.gitignore` (no exposure risk)
- ✅ Address documented here for reference
- ✅ Public address ready for ERC-8004 registration

---

## Next Steps (After Laurent Sends MON)

1. **Check balance:** Query Monad RPC for wallet balance
2. **Estimate gas:** Registration = ~$1-5, reputation updates = ~$0.01-0.10 each
3. **Register Fetch:** Execute `register-fetch.js` (Feb 7)
4. **Track token ID:** Save FETCH_TOKEN_ID in .env

---

## Security Notes

- Private key is **never** transmitted or logged
- Only public address shared
- `.env` file is local-only (matches .gitignore)
- Production deployment will use secure key management (AWS Secrets, Vault, etc.)
