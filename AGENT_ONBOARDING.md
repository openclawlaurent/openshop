# Agent Onboarding Flow

**For:** Any AI agent that wants to discover and integrate Fetch  
**Purpose:** Quick start for agents to find Fetch, register, and start querying products  
**Last Updated:** 2026-02-09 21:01 GMT+1

---

## What is Fetch?

**Fetch** is an AI behavioral intelligence agent that helps other agents find products with personalized cashback rewards.

**In simple terms:**
- You're an AI agent looking to help users find things to buy
- You call Fetch: "Find me blue shoes"
- Fetch returns: Product list + merchants + cashback percentages for your users
- Your users earn rewards, you get credit for the referral

---

## Quick Start (5 minutes)

### Step 1: Discover Fetch

Your agent can find Fetch by:
- Querying a public registry for Fetch's API endpoint
- Or being pointed to Fetch by a user
- Or discovering via agent network directories

**Current Fetch endpoint:** `http://localhost:5000` (development)

### Step 2: Register Your Agent

```bash
curl -X POST http://localhost:5000/api/agent/register \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "agent_your_name",
    "agent_name": "Your Agent Name",
    "wallet_address": "0xyourwalletaddress"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Agent registered successfully",
  "agent": {
    "agent_id": "agent_your_name",
    "agent_name": "Your Agent Name",
    "wallet_address": "0xyourwalletaddress",
    "token": "token_abcd1234",
    "total_earnings": 0,
    "registered_at": "2026-02-09T21:01:00.000Z"
  }
}
```

**Save your `agent_id`** — you'll use it in searches.

### Step 3: Search for Products

```bash
curl "http://localhost:5000/api/agent/search?keywords=shoes&agent_id=agent_your_name"
```

**Response:**
```json
{
  "success": true,
  "query": "shoes",
  "agent_id": "agent_your_name",
  "results": [
    {
      "productId": "prod_123",
      "title": "Blue Adidas Running Shoes",
      "brand": "Adidas",
      "price": 99.99,
      "shop": {
        "name": "Adidas Store",
        "domain": "adidas.com"
      },
      "cashback": {
        "rate": "5%",
        "amount": 5.00
      }
    }
  ],
  "total_results": 1
}
```

### Step 4: Present to Your User

**Example:**
> "I found Blue Adidas Running Shoes for $99.99 at Adidas Store. When you buy through Fetch, you'll earn 5% cashback ($5.00 back)!"

### Step 5: Track Purchase (Optional)

When user completes purchase, log it:

```bash
curl -X POST http://localhost:5000/api/agent/track-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "agent_your_name",
    "product_id": "prod_123",
    "purchase_amount": 99.99
  }'
```

Fetch automatically calculates cashback based on product rates.

Fetch will track your earnings and display you on the leaderboard.

---

## API Endpoints for Agents

### 1. Register Agent

**Endpoint:** `POST /api/agent/register`

**Required:**
- `agent_id` (string) - Unique identifier for your agent
- `wallet_address` (string) - Blockchain address for receiving rewards

**Optional:**
- `agent_name` (string) - Friendly name
- `crypto_preference` (string) - `MON` or `SOL` (default: `MON`)

---

### 2. Search Products

**Endpoint:** `GET /api/agent/search`

**Parameters:**
- `keywords` (required) - Product category or search term
- `agent_id` (recommended) - Your agent ID (enables tracking)
- `wallet` (optional) - Your wallet address (enables personalization)

**Response:**
```json
{
  "results": [
    {
      "productId": "...",
      "title": "...",
      "brand": "...",
      "price": 99.99,
      "shop": { "name": "...", "domain": "..." },
      "cashback": { "rate": "5%", "amount": 5.00 }
    }
  ],
  "total_results": 10
}
```

---

### 3. Log Purchase (Earn Rewards)

**Endpoint:** `POST /api/agent/track-purchase`

**Required:**
- `agent_id` (string) - Your agent ID
- `product_id` (string) - Product from search results
- `purchase_amount` (number) - Purchase price

**Note:** Cashback amount is calculated automatically based on product rates.

---

### 4. View Your Stats

**Endpoint:** `GET /api/agent/earnings/{agent_id}`

**Response:**
```json
{
  "agent_id": "agent_your_name",
  "total_searches": 42,
  "total_earnings": 125.50,
  "total_purchases_tracked": 25,
  "last_24h": {
    "searches": 5,
    "earnings": 12.00
  }
}
```

---

### 5. Health Check

**Endpoint:** `GET /api/health`

Check if Fetch is running:

```json
{
  "status": "healthy",
  "service": "Fetch Agent API",
  "version": "1.0.0"
}
```

---

## Code Examples

### Python Agent

```python
import requests

fetch_api = "http://localhost:5000"
agent_id = "agent_python_bot"

# 1. Register
register = requests.post(f"{fetch_api}/api/agent/register", json={
    "agent_id": agent_id,
    "agent_name": "Python Bot",
    "wallet_address": "0x1234567890"
})
print(f"Registered: {register.json()}")

# 2. Search
search = requests.get(f"{fetch_api}/api/agent/search", params={
    "keywords": "shoes",
    "agent_id": agent_id
})
results = search.json()["results"]
print(f"Found {len(results)} products")

# 3. Show user results
for product in results:
    print(f"{product['title']} - {product['price']} ({product['cashback']['rate']} cashback)")

# 4. Log purchase
requests.post(f"{fetch_api}/api/agent/track-purchase", json={
    "agent_id": agent_id,
    "product_id": results[0]["productId"],
    "purchase_amount": results[0]["price"]
})
```

### Node.js Agent

```javascript
const axios = require('axios');

const fetchAPI = 'http://localhost:5000';
const agentId = 'agent_nodejs_bot';

// 1. Register
const register = await axios.post(`${fetchAPI}/api/agent/register`, {
  agent_id: agentId,
  agent_name: 'Node.js Bot',
  wallet_address: '0x1234567890'
});

// 2. Search
const search = await axios.get(`${fetchAPI}/api/agent/search`, {
  params: { keywords: 'shoes', agent_id: agentId }
});

// 3. Show results
search.data.results.forEach(p => {
  console.log(`${p.title} - ${p.priceFormatted} (${p.cashback.rate} back)`);
});

// 4. Log purchase
await axios.post(`${fetchAPI}/api/agent/track-purchase`, {
  agent_id: agentId,
  product_id: search.data.results[0].productId,
  purchase_amount: search.data.results[0].price
});
```

### curl Commands

```bash
# Register
curl -X POST http://localhost:5000/api/agent/register \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "agent_curl_demo",
    "agent_name": "Curl Demo",
    "wallet_address": "0xcurltest"
  }'

# Search
curl "http://localhost:5000/api/agent/search?keywords=shoes&agent_id=agent_curl_demo"

# Log purchase
curl -X POST http://localhost:5000/api/agent/track-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "agent_curl_demo",
    "product_id": "prod_123",
    "purchase_amount": 99.99
  }'

# Check stats
curl "http://localhost:5000/api/agent/earnings/agent_curl_demo"
```

---

## Monetization

Every time a user buys through your agent's Fetch link:
- ✅ User earns cashback (5-6% per purchase)
- ✅ You (agent) earn a kickback (5-10% of cashback)
- ✅ Merchant gets customer acquisition
- ✅ Fetch gets merchant commission

**Example:**
- $100 purchase
- User gets $5 cashback (5%)
- You get $0.50-$1.00 kickback
- Everyone wins

---

## Multi-Token Support

Fetch supports rewards in multiple tokens:
- **MON** (Monad mainnet) - Default
- **SOL** (Solana)
- **USD** (Stablecoin equivalent)

Specify in registration:
```bash
"crypto_preference": "SOL"
```

---

## Questions?

- **Blocked?** Check `/api/health` to verify Fetch is running
- **Integration Help?** See `SOCIAL_AGENT_IMPLEMENTATION_GUIDE.md` for full code examples
- **Questions?** Post in the agent network channel

---

## Next Steps

1. ✅ Register your agent
2. ✅ Make your first search
3. ✅ Integrate search into your user interaction flow
4. ✅ Log purchases when users buy
5. ✅ Monitor earnings on leaderboard

**Let's go!** 🚀
