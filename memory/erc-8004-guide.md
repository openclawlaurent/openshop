# ERC-8004 Guide - Trustless Agents on Monad

**Source:** https://docs.monad.xyz/guides/erc-8004-guide  
**Saved:** Feb 6, 2026

## What is ERC-8004?

Standard for **Trustless Agents** providing three on-chain registries:
1. **Identity Registry** — Agent registers with ERC-721 NFT + agent card
2. **Reputation Registry** — Immutable feedback system for agent interactions
3. **Validation Registry** — Third-party verification (coming soon)

## Key Benefits

- **Portable Identity:** Persistent, transferable identities via ERC-721 tokens
- **Verifiable Reputation:** Immutable on-chain feedback creates auditable track records
- **Trust Without Intermediaries:** Cryptographic validation enables trustless A2A interactions
- **Economic Interoperability:** Agents discover, verify, pay each other autonomously

---

## How It Works (3 Steps)

### 1. Identity Registry — Register Fetch

**Contract:** `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`  
**Action:** Mint ERC-721 NFT

Each agent mints an ERC-721 token with:
- **Token ID** = Agent's unique identifier
- **Token URI** = Points to "agent card" with metadata:
  - Name and description
  - API endpoints (HTTP, MCP, A2A, etc.)
  - Supported trust models
  - DID/ENS identifiers
  - Agent wallet address (for payments)

**For Fetch:**
```json
{
  "name": "Fetch",
  "description": "Behavioral intelligence agent for personalized commerce deals",
  "api_endpoints": {
    "search": "https://fetch-api.example.com/api/agent/search",
    "reputation": "https://fetch-api.example.com/api/agent/reputation"
  },
  "wallet": "0xFetch...Wallet",
  "categories": ["commerce", "intelligence", "rewards"]
}
```

### 2. Reputation Registry — Track Performance

**Contract:** `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63`  
**Action:** Submit feedback after interactions

After each purchase/interaction, submit:
- **Values:** conversion_rate, response_time, accuracy, etc. (0-100 scale)
- **Tags:** e.g., "fast", "accurate", "DeFi", "commerce"
- **FeedbackURI:** Optional link to detailed off-chain review
- **Content Hash:** For data integrity

**Feedback is permanent and immutable** → auditable track record

**For Fetch Example:**
```json
{
  "agent_id": "0xFetchTokenID",
  "values": {
    "conversion_rate": 87,
    "response_time_ms": 45,
    "uptime": 100
  },
  "tags": ["fast", "accurate", "behavioral-intelligence"],
  "feedbackURI": "ipfs://QmXxxx...",
  "timestamp": "2026-02-10T14:00:00Z"
}
```

### 3. Validation Registry (Coming Soon)

For high-stakes tasks, third-party validators verify agent work on-chain.

---

## Registration Steps for Fetch

### Step 1: Create Agent Card (JSON)
```json
{
  "name": "Fetch",
  "description": "AI shopping agent providing behavioral intelligence and personalized deals",
  "image": "https://fetch-api.example.com/logo.png",
  "version": "1.0.0",
  "endpoints": [
    {
      "type": "HTTP",
      "url": "https://fetch-api.example.com/api/agent/search",
      "method": "GET",
      "description": "Search for personalized products"
    },
    {
      "type": "HTTP",
      "url": "https://fetch-api.example.com/api/agent/register",
      "method": "POST",
      "description": "Register calling agent"
    },
    {
      "type": "HTTP",
      "url": "https://fetch-api.example.com/api/agent/reputation",
      "method": "GET",
      "description": "Check Fetch's reputation"
    }
  ],
  "categories": ["commerce", "intelligence", "rewards"],
  "wallet": "0xFetchWalletAddress",
  "verifiable": true,
  "trustModels": ["on-chain-reputation"]
}
```

### Step 2: Upload Agent Card to IPFS or Web
- Store JSON at persistent URL (IPFS preferred)
- Or host on web server

### Step 3: Mint ERC-721 Token (Identity Registry)
```solidity
// Call Identity Registry contract
// 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432

bytes memory tokenURI = bytes("ipfs://QmXxxx..." or "https://fetch.../card.json");
registry.registerAgent(tokenURI, fetchWallet);
// Returns: token_id = agent's unique ID on-chain
```

### Step 4: Submit Reputation (After Each Interaction)
```solidity
// Call Reputation Registry contract
// 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63

reputation.submitFeedback(
  tokenId,                    // Fetch's token ID
  [87, 45, 100],             // values: [conversion_rate, response_time, uptime]
  ["fast", "accurate"],      // tags
  "ipfs://QmDetailedReview", // feedbackURI (optional)
  contentHash                // keccak256(feedback data)
);
```

---

## Key Contract Addresses (Monad Mainnet)

| Registry | Address | Purpose |
|----------|---------|---------|
| **Identity** | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` | Register agent with ERC-721 NFT |
| **Reputation** | `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` | Submit immutable feedback |
| **Validation** | Coming soon | Third-party verification |

---

## Discovery

Once Fetch is registered, other agents can find it:

1. **On-chain lookup:**
   - Query Identity Registry for Fetch's token ID
   - Read token URI → get agent card JSON
   - Extract API endpoints

2. **Browsers:**
   - [8004scan.io](https://8004scan.io) — Browse all agents + reputation
   - [Agentscan.info](http://Agentscan.info) — Agent directory
   - [8004agents.ai](http://8004agents.ai) — Agent marketplace

3. **SDK (agent0):**
   - TypeScript / Python SDKs available
   - Auto-discover agents via ERC-8004

---

## Best Practices

### Registration
- ✅ Use descriptive names and thorough documentation
- ✅ Provide multiple endpoint types for flexibility
- ✅ Keep agent cards updated as capabilities change
- ✅ Use ENS names for easier discovery

### Reputation Management
- ✅ Submit honest feedback after **every interaction**
- ✅ Use consistent tag taxonomies (e.g., "fast", "accurate", "reliable")
- ✅ Include detailed reviews for significant interactions
- ✅ Respond to feedback

### Security
- ✅ Verify agent signatures before payments
- ✅ Check reputation before high-value transactions
- ✅ Monitor feedback on your agents

---

## Resources

- **ERC-8004 Spec:** https://www.8004.org/learn
- **GitHub:** https://github.com/erc-8004
- **agent0 SDK:** https://sdk.ag0.xyz/ (TypeScript + Python)
- **Monad Dev Discord:** https://discord.gg/monaddev
- **Support:** team@8004.org

---

## For Fetch Implementation

1. **Feb 6-7:** Mint ERC-721 for Fetch on Identity Registry
2. **Feb 8-15:** Auto-submit reputation feedback after each purchase
3. **Feb 15:** Judges can verify Fetch's on-chain reputation at 8004scan.io
4. **Post-hackathon:** Other agents discover Fetch via ERC-8004 registries

This gives Fetch a **permanent, verifiable identity** on Monad mainnet. 🚀
