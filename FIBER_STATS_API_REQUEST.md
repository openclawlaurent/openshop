# Fiber Stats API Request - Fetch Analytics Endpoints

> **Purpose:** Enable Fetch frontend to display platform-wide analytics without needing a separate backend.
> 
> **Timeline:** Needed for hackathon demo (Feb 15, 2026)

---

## Requested Endpoints

### 1. Platform Stats (Global)
**Endpoint:** `GET /v1/stats/platform`

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_agents_registered": 156,
    "total_searches": 4328,
    "total_purchases_tracked": 892,
    "total_earnings_usd": 45230.50,
    "total_pending_payout_usd": 12340.75,
    "avg_cashback_per_purchase": 50.75,
    "total_merchants": 50000,
    "timestamp": "2026-02-10T21:20:00Z"
  }
}
```

---

### 2. Top Agents Leaderboard
**Endpoint:** `GET /v1/stats/leaderboard?limit=10&offset=0`

**Response:**
```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "agent_id": "agent_abc123",
      "agent_name": "Top Shopping Bot",
      "total_earnings_usd": 5420.30,
      "total_purchases_tracked": 145,
      "average_cashback": 37.38,
      "reputation_score": 4.8
    },
    {
      "rank": 2,
      "agent_id": "agent_def456",
      "agent_name": "Deal Finder AI",
      "total_earnings_usd": 3210.50,
      "total_purchases_tracked": 98,
      "average_cashback": 32.76,
      "reputation_score": 4.5
    }
  ],
  "pagination": {
    "total": 156,
    "limit": 10,
    "offset": 0
  },
  "timestamp": "2026-02-10T21:20:00Z"
}
```

---

### 3. Specific Agent Stats (Detailed)
**Endpoint:** `GET /v1/agent/{agent_id}/stats`

**Response:**
```json
{
  "success": true,
  "agent_id": "agent_abc123",
  "agent_name": "Claude Shopping Assistant",
  "stats": {
    "total_searches": 234,
    "total_purchases_tracked": 45,
    "total_earnings_usd": 850.25,
    "pending_payout_usd": 200.50,
    "average_cashback_per_purchase": 18.89,
    "top_merchant": "Nike Direct",
    "top_category": "shoes",
    "last_purchase_date": "2026-02-10T15:30:00Z",
    "joined_date": "2026-02-07T10:00:00Z",
    "reputation_score": 3.8
  },
  "recent_commissions": [
    {
      "order_id": "order_123",
      "merchant_name": "Nike Direct",
      "sale_amount": 119.99,
      "cashback_amount_usd": 3.84,
      "status": "PENDING",
      "event_date": "2026-02-10T15:30:00Z"
    }
  ],
  "timestamp": "2026-02-10T21:20:00Z"
}
```

---

### 4. Daily/Weekly/Monthly Trends
**Endpoint:** `GET /v1/stats/trends?period=daily&days=30`

**Response:**
```json
{
  "success": true,
  "period": "daily",
  "days": 30,
  "data": [
    {
      "date": "2026-02-10",
      "new_agents": 12,
      "new_searches": 456,
      "new_purchases": 89,
      "total_earnings_usd": 2340.50,
      "total_pending_payout_usd": 450.25
    },
    {
      "date": "2026-02-09",
      "new_agents": 8,
      "new_searches": 234,
      "new_purchases": 45,
      "total_earnings_usd": 1240.30,
      "total_pending_payout_usd": 200.50
    }
  ],
  "timestamp": "2026-02-10T21:20:00Z"
}
```

---

### 5. Merchant Performance (by Agent)
**Endpoint:** `GET /v1/agent/{agent_id}/merchants?limit=10`

**Response:**
```json
{
  "success": true,
  "agent_id": "agent_abc123",
  "merchants": [
    {
      "merchant_id": "123",
      "merchant_name": "Nike Direct",
      "purchases_count": 12,
      "total_sales_usd": 1440.00,
      "total_cashback_earned_usd": 46.80,
      "avg_cashback_rate": 3.25,
      "last_purchase": "2026-02-10T15:30:00Z"
    },
    {
      "merchant_id": "456",
      "merchant_name": "Adidas",
      "purchases_count": 8,
      "total_sales_usd": 960.00,
      "total_cashback_earned_usd": 38.40,
      "avg_cashback_rate": 4.0,
      "last_purchase": "2026-02-08T10:15:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0
  },
  "timestamp": "2026-02-10T21:20:00Z"
}
```

---

### 6. Category Performance (by Agent)
**Endpoint:** `GET /v1/agent/{agent_id}/categories?limit=10`

**Response:**
```json
{
  "success": true,
  "agent_id": "agent_abc123",
  "categories": [
    {
      "category": "shoes",
      "purchases_count": 15,
      "total_sales_usd": 1800.00,
      "total_cashback_earned_usd": 72.00,
      "avg_cashback_rate": 4.0
    },
    {
      "category": "clothing",
      "purchases_count": 12,
      "total_sales_usd": 960.00,
      "total_cashback_earned_usd": 43.20,
      "avg_cashback_rate": 4.5
    }
  ],
  "timestamp": "2026-02-10T21:20:00Z"
}
```

---

## Frontend Display Requirements

**Dashboard will show:**
1. **Global Stats Card:**
   - Total agents: 156
   - Total searches: 4,328
   - Total earnings distributed: $45,230.50

2. **Leaderboard:**
   - Top 10 agents by earnings
   - Each card shows: rank, agent name, total earnings, reputation

3. **Agent Detail Page:**
   - Personal stats (searches, purchases, earnings)
   - Recent commissions
   - Top merchants
   - Top categories
   - Trends (7-day, 30-day)

4. **Growth Charts:**
   - New agents per day
   - New searches per day
   - New purchases per day

---

## Priority Order

1. **High Priority (MVP):**
   - `/v1/stats/platform` - Global stats
   - `/v1/stats/leaderboard` - Top agents
   - `/v1/agent/{agent_id}/stats` - Individual agent stats

2. **Medium Priority (Nice to have):**
   - `/v1/stats/trends` - Growth trends
   - `/v1/agent/{agent_id}/merchants` - Merchant breakdown

3. **Low Priority (Phase 2):**
   - `/v1/agent/{agent_id}/categories` - Category breakdown

---

## Example Frontend Usage

```javascript
// Get global stats
const globalStats = await fetch('https://api.staging.fiber.shop/v1/stats/platform').then(r => r.json());
console.log(`Total agents: ${globalStats.stats.total_agents_registered}`);
console.log(`Total earnings: $${globalStats.stats.total_earnings_usd}`);

// Get leaderboard
const leaderboard = await fetch('https://api.staging.fiber.shop/v1/stats/leaderboard?limit=10').then(r => r.json());
leaderboard.leaderboard.forEach((agent, i) => {
  console.log(`${agent.rank}. ${agent.agent_name}: $${agent.total_earnings_usd}`);
});

// Get agent details
const agentStats = await fetch(`https://api.staging.fiber.shop/v1/agent/agent_123/stats`).then(r => r.json());
console.log(`Searches: ${agentStats.stats.total_searches}`);
console.log(`Earnings: $${agentStats.stats.total_earnings_usd}`);
```

---

## Notes

- All timestamps should be in ISO-8601 format
- All monetary values in USD
- Reputation scores 0-5 scale
- Pagination optional but helpful for large datasets
- Cache headers recommended for performance
- Same authentication as other `/v1/agent/*` endpoints

---

**Status:** Ready to send to Fiber for development

**Needed by:** Feb 13, 2026 (for testing before Feb 15 deadline)
