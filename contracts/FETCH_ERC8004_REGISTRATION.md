# Fetch ERC-8004 Registration Plan

**Status:** Ready to deploy on Monad mainnet  
**Timeline:** Feb 6-7 (registration) + Feb 8-15 (reputation updates)

---

## Step 1: Prepare Agent Card (JSON)

Save this as `fetch-agent-card.json`:

```json
{
  "name": "Fetch",
  "description": "AI shopping agent providing behavioral intelligence and personalized deals powered by Fiber.shop",
  "image": "https://fetch-platform.example.com/logo.png",
  "version": "1.0.0",
  "tagline": "Have your agent call my agent.",
  "personality": "Ari Gold of AI agents - hustler, always delivers, takes care of people",
  
  "endpoints": [
    {
      "type": "HTTP",
      "url": "https://fetch-api.example.com/api/agent/search",
      "method": "GET",
      "description": "Query Fetch for personalized product deals",
      "parameters": {
        "wallet": "wallet address (string)",
        "keywords": "search query (string)",
        "size": "result count (number, default 10)"
      }
    },
    {
      "type": "HTTP",
      "url": "https://fetch-api.example.com/api/agent/register",
      "method": "POST",
      "description": "Register your agent to earn kickbacks",
      "parameters": {
        "agent_id": "agent identifier",
        "agent_name": "display name",
        "wallet_address": "payment wallet"
      }
    },
    {
      "type": "HTTP",
      "url": "https://fetch-api.example.com/api/agent/reputation",
      "method": "GET",
      "description": "Check Fetch's on-chain reputation",
      "parameters": {
        "include_feedback": "boolean"
      }
    },
    {
      "type": "HTTP",
      "url": "https://fetch-api.example.com/api/gossip/trending",
      "method": "GET",
      "description": "Get trending behavioral intelligence insights"
    }
  ],
  
  "categories": [
    "commerce",
    "behavioral-intelligence",
    "rewards",
    "agent-services"
  ],
  
  "wallet": "0xFetchMainnetWallet",
  "network": "Monad",
  
  "capabilities": [
    "product-search",
    "behavioral-personalization",
    "cryptocurrency-rewards",
    "agent-discovery",
    "on-chain-reputation"
  ],
  
  "verifiable": true,
  "trustModels": ["on-chain-reputation", "erc-8004"],
  
  "metadata": {
    "github": "https://github.com/fiber-cash/fetch-platform",
    "documentation": "https://fetch-platform.example.com/docs",
    "twitter": "@fetch_agent"
  }
}
```

---

## Step 2: Upload Agent Card to IPFS

```bash
# Using IPFS CLI or pinata.cloud
ipfs add fetch-agent-card.json
# Returns: Qm... hash

# Save the IPFS hash for next step
AGENT_CARD_IPFS="QmXxxx..."
```

Or host on web:
```
https://fetch-platform.example.com/fetch-agent-card.json
```

---

## Step 3: Register on Identity Registry (Mint ERC-721)

### Using Ethers.js (Node.js)

```javascript
// register-fetch.js
const ethers = require('ethers');

const IDENTITY_REGISTRY = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';
const MONAD_RPC = 'https://mainnet-rpc.monad.com';

const IDENTITY_ABI = [
  {
    "name": "registerAgent",
    "type": "function",
    "inputs": [
      { "name": "agentCardURI", "type": "string" },
      { "name": "wallet", "type": "address" }
    ],
    "outputs": [{ "name": "tokenId", "type": "uint256" }],
    "stateMutability": "nonpayable"
  }
];

async function registerFetch() {
  // Connect to Monad
  const provider = new ethers.JsonRpcProvider(MONAD_RPC);
  const signer = new ethers.Wallet(process.env.FETCH_PRIVATE_KEY, provider);
  
  // Instantiate contract
  const registry = new ethers.Contract(
    IDENTITY_REGISTRY,
    IDENTITY_ABI,
    signer
  );
  
  // Agent card URI (IPFS or web)
  const cardURI = "ipfs://QmXxxx..." || "https://fetch.../card.json";
  const fetchWallet = process.env.FETCH_WALLET_ADDRESS;
  
  console.log("📝 Registering Fetch on Identity Registry...");
  console.log("  Card URI:", cardURI);
  console.log("  Wallet:", fetchWallet);
  
  // Call registerAgent
  const tx = await registry.registerAgent(cardURI, fetchWallet);
  console.log("  Tx hash:", tx.hash);
  
  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed!");
  
  // Extract token ID from event
  const event = receipt.logs[0]; // Or parse properly
  console.log("✅ Fetch registered! Agent token ID:", event);
  
  return event; // token_id
}

registerFetch().catch(console.error);
```

### Run Registration
```bash
FETCH_PRIVATE_KEY=0x... FETCH_WALLET_ADDRESS=0x... node register-fetch.js
```

---

## Step 4: Store Token ID in Environment

Once registered, save the token ID:

```bash
# .env
FETCH_TOKEN_ID=12345  # From registration tx
FETCH_WALLET=0xFetchWalletAddress
MONAD_RPC=https://mainnet-rpc.monad.com
IDENTITY_REGISTRY=0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
REPUTATION_REGISTRY=0x8004BAa17C55a88189AE136b182e5fdA19dE9b63
```

---

## Step 5: Auto-Submit Reputation After Purchases

### Backend Integration (Node.js)

```javascript
// src/services/erc8004Reputation.js
const ethers = require('ethers');

const REPUTATION_REGISTRY = '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63';

const REPUTATION_ABI = [
  {
    "name": "submitFeedback",
    "type": "function",
    "inputs": [
      { "name": "agentId", "type": "uint256" },
      { "name": "values", "type": "uint256[]" },
      { "name": "tags", "type": "string[]" },
      { "name": "feedbackURI", "type": "string" },
      { "name": "contentHash", "type": "bytes32" }
    ],
    "stateMutability": "nonpayable"
  }
];

async function submitReputationFeedback(stats) {
  const provider = new ethers.JsonRpcProvider(process.env.MONAD_RPC);
  const signer = new ethers.Wallet(process.env.FETCH_PRIVATE_KEY, provider);
  
  const reputation = new ethers.Contract(
    REPUTATION_REGISTRY,
    REPUTATION_ABI,
    signer
  );
  
  // Calculate metrics (0-100 scale)
  const values = [
    Math.round(stats.conversionRate * 100),     // Conversion rate (0-100)
    Math.min(100, stats.avgResponseTime / 10),  // Response time (capped at 100)
    100                                          // Uptime (assume 100%)
  ];
  
  const tags = [
    "fast",
    "accurate",
    "behavioral-intelligence",
    "commerce",
    "monad"
  ];
  
  // Optional: detailed feedback on IPFS
  const feedbackURI = `ipfs://QmFeedback...` || "";
  
  // Content hash for integrity
  const contentHash = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint256[]', 'string[]'],
      [values, tags]
    )
  );
  
  console.log("📤 Submitting Fetch reputation to ERC-8004...");
  console.log("  Token ID:", process.env.FETCH_TOKEN_ID);
  console.log("  Conversion Rate:", stats.conversionRate);
  console.log("  Avg Response Time:", stats.avgResponseTime, "ms");
  
  try {
    const tx = await reputation.submitFeedback(
      process.env.FETCH_TOKEN_ID,
      values,
      tags,
      feedbackURI,
      contentHash
    );
    
    const receipt = await tx.wait();
    console.log("✅ Reputation updated on-chain!");
    console.log("  Tx:", receipt.transactionHash);
    
    return receipt;
  } catch (error) {
    console.error("❌ Reputation submission failed:", error);
    throw error;
  }
}

module.exports = { submitReputationFeedback };
```

### Call After Purchase

```javascript
// src/api/routes/purchases.js
const { submitReputationFeedback } = require('../services/erc8004Reputation');

app.post('/api/webhook/purchase', async (req, res) => {
  const purchase = req.body;
  
  // ... process purchase ...
  
  // Calculate current stats
  const stats = {
    conversionRate: 0.87,     // 87%
    avgResponseTime: 45,      // 45ms
    totalQueries: 342,
    successfulPurchases: 297
  };
  
  // Submit to ERC-8004 (every N purchases or daily)
  if (purchase.id % 10 === 0) {  // Every 10th purchase
    submitReputationFeedback(stats).catch(console.error);
  }
  
  res.json({ success: true });
});
```

---

## Step 6: Verify Registration

### Check on 8004scan.io
```
https://8004scan.io/agent/[FETCH_TOKEN_ID]
```

### Check on Monad Vision
```
https://monadvision.com/address/[IDENTITY_REGISTRY]
```

### Programmatically Query
```javascript
const provider = new ethers.JsonRpcProvider(MONAD_RPC);
const registry = new ethers.Contract(
  IDENTITY_REGISTRY,
  IDENTITY_ABI,
  provider
);

const agentCard = await registry.tokenURI(FETCH_TOKEN_ID);
console.log("Agent Card URI:", agentCard);

// Fetch and parse the card JSON
const response = await fetch(agentCard.replace('ipfs://', 'https://ipfs.io/ipfs/'));
const card = await response.json();
console.log("Agent Name:", card.name);
console.log("Endpoints:", card.endpoints);
```

---

## Timeline

| Date | Task | Status |
|------|------|--------|
| Feb 6 | Prepare agent card JSON | TODO |
| Feb 6 | Upload to IPFS | TODO |
| Feb 7 | Register Fetch on Identity Registry (mint ERC-721) | TODO |
| Feb 7 | Save token ID + update .env | TODO |
| Feb 8+ | Start submitting reputation feedback after purchases | TODO |
| Feb 15 | Judges can verify Fetch's on-chain reputation | TODO |

---

## Key Points

✅ **ERC-8004 is already deployed** on Monad mainnet (no need to deploy contracts)  
✅ **Fetch gets permanent, verifiable identity** (ERC-721 token)  
✅ **Reputation builds live** during hackathon (immutable feedback)  
✅ **Other agents can discover Fetch** via registries (8004scan.io, agentscan.info)  
✅ **Judges can verify everything on-chain** before awarding prizes  

---

## Questions for Laurent

1. **Fetch Monad Mainnet Wallet:** What's the wallet address? (or should I create one?)
2. **Private Key:** Where do we store FETCH_PRIVATE_KEY safely?
3. **Agent Card Hosting:** IPFS or web server?
4. **Logo/Branding:** Any PNG for Fetch logo to include in card?
5. **API Endpoint URL:** What's the production endpoint? (or localhost:5000 for demo?)

Once you answer these, I can **execute registration on Feb 7** and have Fetch live on Monad mainnet. 🚀
