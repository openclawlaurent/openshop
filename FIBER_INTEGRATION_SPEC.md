# Fiber.shop Integration Spec for AI Agents

**For:** Fiber Engineering Team  
**Purpose:** Enable AI agents to query Fiber.shop products and earn cashback rewards  
**Date:** Feb 7, 2026  
**Status:** Required Implementation for Fetch MVP

---

## Executive Summary

Fetch is an AI agent that other agents query to find personalized product deals and earn MON crypto rewards. For Fetch to work, **Fiber.shop must expose three new API endpoints** that enable:

1. **Product Search** — Agents query for products by keyword, receive results with cashback rates
2. **Affiliate Link Generation** — Agents get merchant affiliate links with referral tracking
3. **Purchase Tracking** — Agents notify Fiber when a purchase completes, Fiber calculates and pays cashback

This spec defines exactly what each endpoint should accept and return.

---

## Architecture Overview

```
Agent A (Claude, GPT, etc.)
  ↓
  calls: POST /api/fiber/agent/search
  ├─ agent_id: "agent_claude"
  ├─ wallet: "0xABC123..." (wallet to receive rewards)
  └─ keywords: "running shoes"
  ↓
Fiber.shop Backend
  ├─ Search product catalog
  ├─ Look up affiliate commission rates
  ├─ Calculate default cashback rates
  └─ Return products with cashback
  ↓
Agent A receives results
  ├─ Product: Nike Pegasus 40
  ├─ Price: $119.99
  ├─ Cashback: 4% ($4.80)
  └─ Affiliate Link: https://nike.com?ref=agent_claude
  ↓
User buys through link
  ↓
Fiber receives affiliate commission from merchant
  ↓
Agent calls: POST /api/fiber/agent/track-purchase
  ├─ agent_id: "agent_claude"
  ├─ product_id: "prod_nike_123"
  ├─ purchase_amount: 119.99
  └─ wallet: "0xABC123..."
  ↓
Fiber calculates & pays cashback in MON
  ↓
Agent A's wallet receives MON reward
```

---

## Required API Endpoints

### 1. Agent Registration (Optional but Recommended)

**Endpoint:** `POST /api/fiber/agent/register`

**Purpose:** Register an agent so Fiber can track it, apply reputation scoring, and enable features like Founding Agent bonuses.

**Request:**
```json
{
  "agent_id": "agent_claude",
  "agent_name": "Claude Shopping Assistant",
  "wallet_address": "0xABC123...",
  "api_endpoint": "https://fetch-api.example.com/api/agent/search",
  "description": "AI shopping assistant for personalized deals"
}
```

**Response:**
```json
{
  "success": true,
  "agent_id": "agent_claude",
  "registered_at": "2026-02-07T10:00:00Z",
  "status": "active",
  "cashback_multiplier": 1.0,
  "founding_agent": false
}
```

**Notes:**
- `agent_id` must be unique
- `wallet_address` is where MON rewards go
- `api_endpoint` allows Fiber to discover agents (future feature)
- Store in database for reputation tracking

---

### 2. Product Search (REQUIRED)

**Endpoint:** `GET /api/fiber/agent/search`

**Purpose:** Search Fiber's product catalog and return results with cashback rates calculated for agents.

**Request Parameters:**
```
GET /api/fiber/agent/search?keywords=running+shoes&agent_id=agent_claude&wallet=0xABC123&limit=10
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keywords` | string | ✅ Yes | Search query (e.g., "shoes", "nike", "running shoes") |
| `agent_id` | string | ✅ Yes | ID of the agent making the request (for tracking) |
| `wallet` | string | ✅ Yes | Wallet address of the agent (for future reputation/payouts) |
| `limit` | integer | ❌ No | Max results to return (default: 10) |
| `category` | string | ❌ No | Filter by category (e.g., "shoes", "apparel") |

**Response:**
```json
{
  "success": true,
  "query": "running shoes",
  "agent_id": "agent_claude",
  "wallet": "0xABC123...",
  "results_count": 2,
  "results": [
    {
      "product_id": "prod_nike_pegasus_40",
      "title": "Nike Pegasus 40 Running Shoes",
      "brand": "Nike",
      "price": 119.99,
      "currency": "USD",
      "merchant_id": "nike_direct",
      "merchant_name": "Nike Direct",
      "merchant_domain": "nike.com",
      "description": "Lightweight running shoes for all distances",
      "image_url": "https://nike.com/images/pegasus.jpg",
      "in_stock": true,
      "cashback": {
        "rate_percent": 4.0,
        "amount_usd": 4.80,
        "currency": "MON",
        "note": "Agent receives this amount in MON when purchase completes"
      },
      "affiliate_link": "https://nike.com/pegasus-40?ref=agent_claude&affiliate_id=fiber_0x123",
      "tracking_id": "track_123xyz"
    },
    {
      "product_id": "prod_adidas_ultra_boost",
      "title": "Adidas Ultraboost 22 Running Shoes",
      "brand": "Adidas",
      "price": 179.99,
      "currency": "USD",
      "merchant_id": "adidas_store",
      "merchant_name": "Adidas Store",
      "merchant_domain": "adidas.com",
      "cashback": {
        "rate_percent": 5.0,
        "amount_usd": 9.00,
        "currency": "MON"
      },
      "affiliate_link": "https://adidas.com/ultraboost-22?ref=agent_claude&affiliate_id=fiber_0x123",
      "tracking_id": "track_456xyz"
    }
  ],
  "timestamp": "2026-02-07T10:05:00Z"
}
```

**Response Field Details:**

| Field | Type | Description |
|-------|------|-------------|
| `product_id` | string | Unique product identifier in Fiber's catalog |
| `title` | string | Product name |
| `brand` | string | Brand name |
| `price` | float | Price in USD |
| `merchant_id` | string | Unique merchant identifier |
| `merchant_name` | string | Display name of the merchant |
| `merchant_domain` | string | Domain for affiliate link (e.g., nike.com) |
| `cashback.rate_percent` | float | Cashback percentage (4.0 = 4%) |
| `cashback.amount_usd` | float | Calculated cashback amount in USD |
| `cashback.currency` | string | "MON" - always pay in MON |
| `affiliate_link` | string | **CRITICAL:** Full URL with `?ref=agent_id&affiliate_id=...` for tracking |
| `tracking_id` | string | Fiber's internal ID to match purchase confirmation later |

**Key Implementation Notes:**

1. **Affiliate Links MUST Include:**
   - `ref={agent_id}` — Identifies which agent sent the user
   - `affiliate_id=fiber_...` — Fiber's tracking ID
   - These enable purchase attribution and payment

2. **Cashback Calculation:**
   - `cashback.rate_percent` = Fiber's affiliate commission rate from merchant
   - Example: If Nike pays Fiber 4% commission, return 4% to agent
   - Can vary per merchant (some offer 2%, others 8%)

3. **Tracking:**
   - Each product must include a unique `tracking_id`
   - Agent will reference this when confirming purchase (see endpoint 3)

4. **Performance:**
   - Must be fast (<500ms) — agents call this synchronously in conversations
   - Cache merchant commission rates if possible

---

### 3. Purchase Confirmation & Cashback Payment (REQUIRED)

**Endpoint:** `POST /api/fiber/agent/track-purchase`

**Purpose:** Agents notify Fiber when a user completes a purchase. Fiber calculates cashback and pays the agent in MON.

**Request:**
```json
{
  "agent_id": "agent_claude",
  "wallet": "0xABC123...",
  "product_id": "prod_nike_pegasus_40",
  "tracking_id": "track_123xyz",
  "merchant_id": "nike_direct",
  "purchase_amount": 119.99,
  "purchase_currency": "USD",
  "order_id": "order_user_12345",
  "timestamp": "2026-02-07T10:15:00Z"
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `agent_id` | string | ✅ Yes | Agent that facilitated the purchase |
| `wallet` | string | ✅ Yes | Wallet to receive MON reward |
| `product_id` | string | ✅ Yes | Product purchased |
| `tracking_id` | string | ✅ Yes | From search response, confirms affiliate tracking |
| `merchant_id` | string | ✅ Yes | Merchant from search response |
| `purchase_amount` | float | ✅ Yes | Total amount user paid in USD |
| `purchase_currency` | string | ✅ Yes | "USD" (or support other currencies if needed) |
| `order_id` | string | ✅ Yes | User's order ID (prevents duplicate claims) |
| `timestamp` | string | ✅ Yes | ISO 8601 timestamp when purchase completed |

**Response:**
```json
{
  "success": true,
  "purchase_confirmed": true,
  "agent_id": "agent_claude",
  "product_id": "prod_nike_pegasus_40",
  "purchase_amount": 119.99,
  "cashback": {
    "rate_percent": 4.0,
    "amount_usd": 4.80,
    "amount_mon": 40,
    "currency": "MON",
    "spot_price_usd": 0.12
  },
  "payout": {
    "wallet": "0xABC123...",
    "amount_mon": 40,
    "blockchain": "monad",
    "tx_hash": "0xabc123...",
    "status": "confirmed",
    "timestamp": "2026-02-07T10:15:30Z"
  },
  "tracking_id": "track_123xyz"
}
```

**Payout Field Details:**

| Field | Type | Description |
|-------|------|-------------|
| `amount_mon` | float | Cashback amount converted to MON (using spot price) |
| `spot_price_usd` | float | MON/USD rate used for conversion |
| `tx_hash` | string | Blockchain transaction hash (Monad mainnet) |
| `status` | string | "confirmed" = payment sent, "pending" = processing |

**Payment Flow:**

1. **Calculation:**
   - Cashback = `purchase_amount * (rate_percent / 100)`
   - Example: $119.99 * 0.04 = $4.80 USD

2. **Conversion to MON:**
   - Fetch spot price of MON/USD (e.g., $0.12)
   - MON amount = $4.80 / $0.12 = 40 MON
   - Send 40 MON to agent's wallet

3. **Blockchain Payment:**
   - Pay via Monad mainnet
   - Send to `wallet` address provided
   - Return `tx_hash` so agent can verify on-chain

4. **Validation:**
   - Check `order_id` isn't duplicate (prevent double-payment)
   - Verify `tracking_id` matches a recent search request
   - Validate `agent_id` is registered

---

### 4. Get Agent Earnings (OPTIONAL but Helpful)

**Endpoint:** `GET /api/fiber/agent/earnings/{agent_id}`

**Purpose:** Agents can check their total earnings, recent purchases, and pending payouts.

**Response:**
```json
{
  "agent_id": "agent_claude",
  "total_earnings_mon": 150.5,
  "total_purchases_tracked": 12,
  "pending_payout_mon": 0,
  "last_payout": {
    "amount_mon": 40,
    "timestamp": "2026-02-07T10:15:30Z",
    "tx_hash": "0xabc123..."
  },
  "recent_purchases": [
    {
      "product_id": "prod_nike_pegasus_40",
      "purchase_amount": 119.99,
      "cashback_mon": 40,
      "timestamp": "2026-02-07T10:15:00Z"
    }
  ]
}
```

---

## Data Model

### Agents Table
```sql
CREATE TABLE agents (
  agent_id VARCHAR(255) PRIMARY KEY,
  agent_name VARCHAR(255),
  wallet_address VARCHAR(255) NOT NULL,
  api_endpoint VARCHAR(500),
  description TEXT,
  registered_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  cashback_multiplier FLOAT DEFAULT 1.0,
  is_founding_agent BOOLEAN DEFAULT false,
  total_earnings_mon FLOAT DEFAULT 0,
  total_purchases_tracked INT DEFAULT 0,
  reputation_score FLOAT DEFAULT 1.0
);
```

### Products Search Log
```sql
CREATE TABLE search_logs (
  search_id VARCHAR(255) PRIMARY KEY,
  agent_id VARCHAR(255),
  keywords VARCHAR(500),
  results_count INT,
  timestamp TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(agent_id)
);
```

### Purchases / Earnings
```sql
CREATE TABLE agent_purchases (
  tracking_id VARCHAR(255) PRIMARY KEY,
  agent_id VARCHAR(255),
  product_id VARCHAR(255),
  merchant_id VARCHAR(255),
  order_id VARCHAR(255) UNIQUE,
  purchase_amount FLOAT,
  cashback_rate_percent FLOAT,
  cashback_amount_usd FLOAT,
  cashback_amount_mon FLOAT,
  mon_spot_price FLOAT,
  payout_tx_hash VARCHAR(255),
  payout_status VARCHAR(50),
  confirmed_at TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(agent_id)
);
```

---

## Error Handling

All endpoints should return appropriate HTTP status codes:

```json
// 400 Bad Request - Missing required parameters
{
  "success": false,
  "error": "Missing required parameter: keywords",
  "status": 400
}

// 404 Not Found - Agent or product not found
{
  "success": false,
  "error": "Agent not registered",
  "status": 404
}

// 409 Conflict - Duplicate order ID
{
  "success": false,
  "error": "Order already tracked",
  "status": 409
}

// 500 Server Error
{
  "success": false,
  "error": "Internal server error",
  "status": 500
}
```

---

## Security & Validation

### Required Checks:

1. **Agent Validation**
   - Verify `agent_id` format (alphanumeric, no spaces)
   - Verify `wallet` is valid Monad address format (0x + 40 hex chars)

2. **Purchase Tracking**
   - Check `order_id` hasn't been claimed before (prevent double-payment)
   - Verify `tracking_id` exists and is recent (<24 hours old)
   - Validate `product_id` exists in catalog
   - Verify `purchase_amount` is reasonable (>0, <$10k)

3. **Rate Limiting**
   - Limit searches per agent: 1000/day
   - Limit purchase claims per agent: 100/day
   - Prevent abuse from bulk registrations

### Blockchain Security:

1. **MON Wallet**
   - Fiber manages a dedicated MON wallet for paying agents
   - All payouts signed by Fiber's private key
   - Transactions go to agent's `wallet_address`

2. **Verification**
   - Return `tx_hash` in payout response
   - Agents can verify on Monad mainnet: `https://monadvision.com/tx/{tx_hash}`

---

## Implementation Timeline (Suggested)

| Phase | Timeline | What Fiber Builds |
|-------|----------|------------------|
| **Phase 1** | Feb 8-9 | Search endpoint + basic cashback calculation |
| **Phase 2** | Feb 10 | Purchase tracking endpoint + MON payouts |
| **Phase 3** | Feb 11-12 | Agent registration + earnings endpoint |
| **Phase 4** | Feb 13+ | Behavioral personalization (optional) |

---

## Testing Checklist

```bash
# 1. Test Search Endpoint
curl "http://fiber-api.com/api/fiber/agent/search?keywords=shoes&agent_id=test&wallet=0x123&limit=5"
# Expected: 200 OK with product results and affiliate links

# 2. Test Purchase Tracking
curl -X POST http://fiber-api.com/api/fiber/agent/track-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "test",
    "wallet": "0x123",
    "product_id": "prod_123",
    "tracking_id": "track_xyz",
    "merchant_id": "nike",
    "purchase_amount": 119.99,
    "order_id": "order_123"
  }'
# Expected: 200 OK with payout confirmation + tx_hash

# 3. Verify MON was sent
# Check Monad blockchain: https://monadvision.com/tx/{tx_hash}
# Expected: Transaction confirmed to agent wallet
```

---

## Questions for Fiber Team

1. **Affiliate Rates:** What commission does Fiber get from each merchant? How should cashback be distributed?
   - Option A: Fiber keeps 50%, agents get 50%
   - Option B: Agents get 100% of Fiber's commission
   - Other?

2. **MON Funding:** Does Fiber have a dedicated MON wallet for payouts? What's the balance/funding strategy?

3. **Merchant Tracking:** How does Fiber currently track affiliate sales? Do affiliates use UTM params, cookies, or direct API integration?

4. **KYC/Compliance:** Any agent registration restrictions, geographic limitations, or tax considerations?

5. **Merchant Support:** Will merchants accept affiliate traffic from agents? Any contracts to update?

---

## Success Criteria

✅ Agents can search Fiber products via REST API  
✅ Search results include accurate cashback amounts  
✅ Affiliate links properly track agent referrals  
✅ Fiber receives merchant commissions  
✅ Agents receive MON payouts on-chain within 1 hour  
✅ Search latency <500ms (for agent conversation speed)  
✅ >95% purchase tracking accuracy (no lost orders)

---

**Next Steps:**
1. Fiber team reviews this spec
2. Fiber implements the 3 required endpoints (search, track-purchase, register)
3. We integrate with their API
4. Live testing with real Fiber products

Questions? Contact Fetch team. 🚀
