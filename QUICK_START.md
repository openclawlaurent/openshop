# Fetch MVP - Quick Start (Feb 7, 2026)

## Status: ✅ WORKING (Frontend + API)

An agent can register, search for products, and see results with cashback rates.

---

## Option 1: Run Full Demo (Easiest)

```bash
cd fiber-shop-landing
chmod +x run-demo.sh
./run-demo.sh
```

Then open: **http://localhost:3000/demo**

---

## Option 2: Run Separately

### Terminal 1: Start API
```bash
cd fiber-shop-landing
npm run api
```

Output:
```
🚀 Fetch Agent API running on http://localhost:5000

📡 AGENT ENDPOINTS:
   GET  http://localhost:5000/api/agent/search?keywords=shoes&agent_id=my_agent&wallet=0x...
   POST http://localhost:5000/api/agent/search
   GET  http://localhost:5000/api/agent/earnings/:agent_id

📊 NETWORK ENDPOINTS:
   GET  http://localhost:5000/api/stats
   GET  http://localhost:5000/api/leaderboard
   GET  http://localhost:5000/api/agents
   GET  http://localhost:5000/api/health
```

### Terminal 2: Start React Frontend
```bash
cd fiber-shop-landing
npm start
```

Output:
```
Compiled successfully!
You can now view fetch-agent in the browser.
  Local:            http://localhost:3000
```

---

## Interactive Demo: http://localhost:3000/demo

**Step-by-step:**
1. ✏️ **Register Agent** — Enter agent ID, name, wallet
2. 🔍 **Search Products** — Type keywords (shoes, nike, adidas, etc.)
3. 📦 **See Results** — View products with:
   - Product title, brand, merchant
   - Price in USD
   - Cashback rate (%) and amount ($)
   - Direct link to merchant
4. 📊 **View Stats** — See agent earnings & activity

---

## What the Demo Shows

### 📋 Agent Registration
- Agent provides ID, name, wallet address (Monad)
- System auto-assigns token
- Agent stats tracked: searches, API calls, earnings

### 🔍 Product Search
- Agent searches for products (keywords: shoes, nike, boots, etc.)
- Returns matching products with:
  - **Product details:** Title, brand, price, merchant
  - **Cashback:** Rate (%) and amount ($) agent earns
  - **Affiliate link:** Direct to merchant with tracking

### 📊 Agent Statistics
- Total earnings in MON
- Purchases tracked
- API calls made
- Search queries

### 🎯 How Earnings Work (Demo)
```
Product: Nike Blue Rain Boots
Merchant: Nike Direct  
Price: $119.99
Cashback Rate: 4%
Agent Earns: $4.80 (in MON)
```

---

## What Works Now (MVP)

### ✅ Agent Registration
```javascript
POST /api/agent/register
{
  "agent_id": "my_agent",
  "agent_name": "My Shopping Agent",
  "wallet_address": "0x...",
  "crypto_preference": "MON"
}
```

### ✅ Product Search
```javascript
GET /api/agent/search?keywords=shoes&agent_id=my_agent&wallet=0x...
```
Returns products with cashback rates

### ✅ Agent Statistics
```javascript
GET /api/agent/earnings/:agent_id
```
Returns earnings, purchases, API calls, searches

### ✅ Network Stats
```javascript
GET /api/stats       // Network overview
GET /api/leaderboard // Top agents by earnings
GET /api/agents      // All registered agents
GET /api/health      // API health check
```

---

## Next: What to Build

Once this demo is working and you're happy:

1. **Behavioral Personalization** (Feb 8-9)
   - Read wallet on-chain signals (holdings, DeFi activity)
   - Boost cashback 40-50% for matching behavioral tags
   - Example: "fitness enthusiast" wallet → higher cashback on Nike shoes

2. **Discount Code Vault** (Feb 9)
   - Fallback when no affiliate link available
   - Agent submits verified codes
   - Fetch uses best code + pays contributor

3. **Purchase Tracking** (Feb 10)
   - Agent reports purchase completed
   - Fetch calculates kickback (5% base, 10% for Founding Agents)
   - Updates agent earnings in MON

4. **ERC-8004 Registration** (Feb 11-12, once you give domain)
   - Register Fetch on Identity Registry
   - Auto-submit reputation after purchases
   - Judges can verify on 8004scan.io

---

## Files

- **API code:** `fiber-shop-landing/server/api.js`
- **Mock products:** Lines 135-228
- **Search endpoint:** Lines 265-320 (GET) and 322-380 (POST)
- **Database:** `fiber-shop-landing/server/fetch.db` (SQLite)

---

## Questions for Laurent

1. Are you happy with the response format for products?
2. Should we customize the mock product list?
3. Ready to move to behavioral personalization next?

---

**Status:** MVP complete, ready for Phase 2 🚀
