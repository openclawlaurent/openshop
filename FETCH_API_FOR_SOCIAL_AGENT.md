# Fetch API Documentation for Social Media Agent

**For:** Social Media Colleague  
**Purpose:** Integrate Fetch offer selection into @fiber_shop Twitter bot  
**Last Updated:** 2026-02-09 21:58 GMT+1  
**Status:** MVP Ready (Phase 1: Waitlist) | Phase 2 (Live App) ready for deployment

---

## Quick Start

Fetch is the **offer intelligence layer** for Fiber. Your Twitter bot queries Fetch to:
1. Search for merchant offers by context (category, token community, ecosystem)
2. Get top cashback rates ranked by percentage
3. Build contextual CTAs with @mentions

---

## Base URL

```
http://192.168.1.39:5000
```

(Or production URL when deployed — will be provided)

---

## Core Endpoints

### 1. Search Offers by Category & Context

**Endpoint:** `GET /api/agent/search`

**Purpose:** Find merchant offers matching category, token community, or ecosystem context.

**Query Parameters:**

| Param | Type | Required | Example | Notes |
|-------|------|----------|---------|-------|
| `keywords` | string | Yes | `blue+shoes` or `fitness` | Product category or search term |
| `agent_id` | string | No | `@fiber_shop` | Bot identifier for analytics |
| `wallet` | string | No | `0x1234...` | Token holder address (enables behavioral boost) |
| `token` | string | No | `SOL` or `BONK` | Force token context (overrides random) |
| `ecosystem` | string | No | `solana` or `monad` | Blockchain context filter |

**Response:**

```json
{
  "results": [
    {
      "product_id": "bestbuy_5pct",
      "merchant": "Best Buy",
      "merchant_handle": "@BestBuy",
      "category": "electronics",
      "cashback_rate": 0.05,
      "cashback_amount": 5,
      "offer_url": "fiber.shop/offer/bestbuy",
      "chain": "solana",
      "recommended_token": "SOL",
      "recommended_token_handle": "@solana",
      "behavioral_boost": 0.15,
      "final_cashback": 0.058,
      "explanation": "5% base + 15% behavioral boost for electronics interest"
    },
    {
      "product_id": "nike_3pct",
      "merchant": "Nike",
      "merchant_handle": "@Nike",
      "category": "fitness",
      "cashback_rate": 0.03,
      "cashback_amount": 3,
      "offer_url": "fiber.shop/offer/nike",
      "chain": "solana",
      "recommended_token": "BONK",
      "recommended_token_handle": "@bonaborado",
      "behavioral_boost": 0.40,
      "final_cashback": 0.042,
      "explanation": "3% base + 40% boost (fitness enthusiast detected)"
    }
  ],
  "top_offer": {
    "product_id": "bestbuy_5pct",
    "merchant": "Best Buy",
    "merchant_handle": "@BestBuy",
    "cashback_rate": 0.05,
    "recommended_token": "SOL",
    "recommended_token_handle": "@solana",
    "offer_url": "fiber.shop/offer/bestbuy"
  },
  "context_detected": {
    "category": "electronics",
    "token_community": "solana",
    "ecosystem": "solana",
    "behavioral_tags": ["tech_enthusiast", "defi_active"]
  },
  "metadata": {
    "total_results": 12,
    "timestamp": 1707096135,
    "agent_id": "@fiber_shop",
    "searches_made": 42
  }
}
```

**Example Requests:**

```bash
# Simple: Electronics offers in Solana ecosystem
curl "http://192.168.1.39:5000/api/agent/search?keywords=electronics&agent_id=@fiber_shop"

# With token context (force BONK token in response)
curl "http://192.168.1.39:5000/api/agent/search?keywords=fitness&token=BONK&agent_id=@fiber_shop"

# With wallet (enables behavioral personalization)
curl "http://192.168.1.39:5000/api/agent/search?keywords=defi&wallet=0x1234567890&agent_id=@fiber_shop"

# Monad ecosystem
curl "http://192.168.1.39:5000/api/agent/search?keywords=gaming&ecosystem=monad&agent_id=@fiber_shop"
```

**Rate Limits:** 100 requests/minute per agent_id

---

### 2. Register Your Bot as an Agent

**Endpoint:** `POST /api/agent/register`

**Purpose:** Register your Twitter bot as a Fetch agent, get analytics tracking, enable on-chain reputation.

**Request Body:**

```json
{
  "agent_name": "@fiber_shop",
  "agent_description": "Fiber Protocol Twitter bot - offer discovery & engagement",
  "agent_wallet": "0x790b405d466f7fddcee4be90d504eb56e3fedcae",
  "metadata": {
    "twitter_handle": "@fiber_shop",
    "platform": "twitter",
    "phase": "1"
  }
}
```

**Response:**

```json
{
  "agent_id": "agent_fiber_shop_001",
  "wallet_address": "0x790b405d466f7fddcee4be90d504eb56e3fedcae",
  "api_key": "fk_live_abcd1234efgh5678ijkl9012",
  "status": "active",
  "created_at": "2026-02-09T21:58:00Z",
  "erc8004_identity": {
    "chain": "monad",
    "registry_address": "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
    "registration_status": "pending"
  }
}
```

**Usage:** Include `api_key` in future requests via header:

```bash
curl -H "Authorization: Bearer fk_live_abcd1234efgh5678ijkl9012" \
     "http://192.168.1.39:5000/api/agent/search?keywords=shoes"
```

---

### 3. Track Offers Promoted

**Endpoint:** `POST /api/agent/offer-promoted`

**Purpose:** Log when your bot mentions an offer (enables deduplication, tracking, earnings).

**Request Body:**

```json
{
  "agent_id": "agent_fiber_shop_001",
  "offer_id": "bestbuy_5pct",
  "merchant": "Best Buy",
  "cashback_rate": 0.05,
  "token_promoted": "SOL",
  "tweet_id": "1234567890",
  "tweet_url": "https://twitter.com/fiber_shop/status/1234567890",
  "context": {
    "category": "electronics",
    "cta_type": "offer_promotion",
    "mention_count": 2
  }
}
```

**Response:**

```json
{
  "logged": true,
  "offer_id": "bestbuy_5pct",
  "dedup_status": "allowed",
  "last_promoted": "2026-02-08T18:42:00Z",
  "hours_since_last": 27,
  "analytics_id": "analytics_12345"
}
```

---

### 4. Get Analytics Dashboard

**Endpoint:** `GET /api/agent/earnings/:agent_id`

**Purpose:** View your agent's stats (searches, offers promoted, impressions, link clicks).

**Response:**

```json
{
  "agent_id": "agent_fiber_shop_001",
  "total_searches": 156,
  "total_offers_promoted": 89,
  "estimated_earnings": 12.5,
  "stats": {
    "searches_by_category": {
      "electronics": 42,
      "fitness": 28,
      "defi": 33,
      "gaming": 16,
      "fashion": 37
    },
    "top_merchants": [
      {
        "merchant": "Best Buy",
        "promotions": 18,
        "clicks": 142
      },
      {
        "merchant": "Nike",
        "promotions": 15,
        "clicks": 98
      }
    ],
    "token_rotation_stats": {
      "SOL": 45,
      "BONK": 32,
      "PENGU": 12
    }
  },
  "last_24h": {
    "searches": 24,
    "offers_promoted": 18,
    "link_clicks": 127,
    "impressions": 2840
  }
}
```

---

### 5. Health & Status

**Endpoint:** `GET /api/health`

**Response:**

```json
{
  "status": "healthy",
  "api": "running",
  "database": "connected",
  "agents_registered": 7,
  "total_searches": 142,
  "uptime_seconds": 86400
}
```

---

## Token Rotation Integration

Fetch maintains the canonical token list. When you query an offer, the response includes:

```json
{
  "recommended_token": "SOL",
  "recommended_token_handle": "@solana",
  "alternative_tokens": [
    { "symbol": "BONK", "handle": "@bonaborado" },
    { "symbol": "PENGU", "handle": "@pudaborado" }
  ]
}
```

**How to use in your bot:**

1. Query Fetch for category (e.g., `fitness`)
2. Receive top offer with `recommended_token`
3. If conversation context matches a token, use that instead
4. Otherwise, randomly select from `alternative_tokens`
5. Build CTA: `"Earn {cashback}% at @{merchant} in ${token} → {offer_url}"`

---

## CTA Template Examples

**Phase 1 (Current - Waitlist):**

```
"Join 10k+ agents trading smarter. Build your Fiber profile → fiber.shop"

"Early access to agent-powered offers: fiber.shop/monad"

"Only on Monad: Sub-second finality. Agents + merchants + you = aligned incentives → fiber.shop"
```

**Phase 2 (When App Launches - Offer-Specific):**

```
"Earn 5% back at @BestBuy in $SOL @solana → fiber.shop/offer/bestbuy"

"Nike lovers: 3% cashback for fitness enthusiasts in $BONK → fiber.shop/offer/nike"

"DeFi trading? Best rates at @1inch in $MON @monadlabs → fiber.shop/offer/1inch"
```

---

## Deduplication & Rate Limiting

**Deduplication Window:** 24 hours per offer  
**Max Mentions Per Offer:** 1 per 24h window (tracked by `offer_id`)

**Fetch automatically applies penalties:**
- Same offer within 24h → dedup_penalty applied to ranking
- Same token within 1h → suggest alternative token
- Max 5 same-merchant offers in rotation

---

## Behavioral Boost Logic

When you include a `wallet` parameter, Fetch analyzes on-chain signals:

```
GET /api/agent/search?keywords=fitness&wallet=0x123...

Response includes:
{
  "behavioral_boost": 0.40,
  "explanation": "40% boost: fitness enthusiast detected (MuscleFi holder, Audius music listener, USDC stablecoin preference)"
}
```

This boost applies automatically to matching offers. Example:
- Base Nike offer: 3%
- Behavioral boost: +40%
- Final: 4.2% cashback

---

## Error Handling

**400 Bad Request:**
```json
{
  "error": "invalid_keywords",
  "message": "keywords parameter required"
}
```

**401 Unauthorized:**
```json
{
  "error": "invalid_api_key",
  "message": "API key expired or invalid. Re-register agent."
}
```

**429 Too Many Requests:**
```json
{
  "error": "rate_limit_exceeded",
  "retry_after": 45
}
```

---

## Implementation Checklist for Your Bot

- [ ] Register your bot with `/api/agent/register`, store `api_key`
- [ ] On engagement cycle, query `/api/agent/search?keywords={category}`
- [ ] Parse response, extract `top_offer` and `recommended_token`
- [ ] Log promotion with `/api/agent/offer-promoted` (for dedup + earnings)
- [ ] Build CTA: `Earn {%} at @{merchant} in ${token} → {url}`
- [ ] Respect 24h dedup window (Fetch enforces, but good to track locally)
- [ ] Weekly: Check `/api/agent/earnings/{agent_id}` for analytics

---

## Questions for Laurent

**Before your colleague starts implementation:**

1. **Auth method:** Should I create individual API keys per agent, or use a master key?
2. **Offer feed:** Should offers be:
   - Hardcoded merchant list (current MVP)?
   - Dynamic API from Fiber's backend?
   - CSV import daily?
3. **Webhook support:** Does the bot need real-time offer updates, or is polling okay?
4. **Analytics destination:** Where should impressions/clicks be sent? Slack? Firebase? Email?

---

## Next Steps

1. **Your colleague:** Register bot via `/api/agent/register`, start querying `/api/agent/search`
2. **You:** Once he's ready, I'll add webhook support + offer feed automation
3. **Phase 2:** When app launches, update CTA templates and enable offer selection logic

---

**Ready?** Colleague can start with Step 1 above. I'm here for questions, but he should be able to integrate with just this doc.
