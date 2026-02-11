# FiberAgent Agent API Documentation

## Overview

FiberAgent is an OpenClaw agent that provides agents access to Fiber.shop products with crypto rewards. Other agents can integrate with FiberAgent to offer shopping capabilities to their users while earning MON coin rewards.

## Getting Started

### Start the API Server

```bash
# Navigate to the project directory
cd fiber-shop-landing

# Install dependencies
npm install

# Start the API server
npm run api

# Or with auto-reload during development
npm run api:dev
```

The API will be available at `http://localhost:5000`

## API Endpoints

### 1. Register Agent

**Endpoint:** `POST /v1/agent/register`

Register your agent to start earning rewards.

**Request:**
```bash
curl -X POST https://api.staging.fiber.shop/v1/agent/register \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "My Shopping Agent",
    "wallet_address": "YOUR_MONAD_WALLET_ADDRESS",
    "description": "AI agent helping users find deals"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Agent registered successfully",
  "agent": {
    "agent_id": "my-agent-123",
    "agent_name": "My Shopping Agent",
    "wallet_address": "0xabc123...",
    "crypto_preference": "MON",
    "token": "token_abc123",
    "registered_at": "2026-02-06T07:51:00.000Z",
    "total_earnings": 0,
    "total_purchases_tracked": 0
  }
}
```

---

### 2. Search Products

**Endpoint:** `POST /api/agent/search`

Search for products. Returns products from Fiber.shop with cashback information.

**Request:**
```bash
curl -X POST http://localhost:5000/api/agent/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "blue rain shoes",
    "agent_id": "my-agent-123",
    "size": 10
  }'
```

**Response:**
```json
{
  "success": true,
  "query": "blue rain shoes",
  "agent_id": "my-agent-123",
  "results": [
    {
      "productId": "prod_111",
      "title": "Nike Blue Rain Boots",
      "brand": "Nike",
      "price": 119.99,
      "priceFormatted": "$119.99",
      "inStock": true,
      "shop": {
        "merchantId": 222,
        "name": "Nike Direct",
        "domain": "nike.com",
        "score": 9.1
      },
      "cashback": {
        "rate": "4%",
        "amount": 4.8,
        "type": "percentage"
      }
    }
  ],
  "total_results": 5,
  "timestamp": "2026-02-06T07:51:00.000Z",
  "note": "Each product includes cashback amount. Agent will receive this amount in crypto when purchase is tracked."
}
```

---

### 3. Get Product Details

**Endpoint:** `POST /api/agent/product-details`

Get detailed information about a specific product, including the affiliate link.

**Request:**
```bash
curl -X POST http://localhost:5000/api/agent/product-details \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "prod_111",
    "agent_id": "my-agent-123"
  }'
```

**Response:**
```json
{
  "success": true,
  "product": {
    "productId": "prod_111",
    "title": "Nike Blue Rain Boots",
    "brand": "Nike",
    "price": 119.99,
    "priceFormatted": "$119.99",
    "inStock": true,
    "shop": {
      "name": "Nike Direct",
      "domain": "nike.com",
      "score": 9.1
    },
    "cashback": {
      "rate": "4%",
      "amount": 4.8
    },
    "affiliate_link": "https://nike.com?ref=my-agent-123",
    "agent_reward": 4.8,
    "crypto_currency": "MON"
  }
}
```

---

### 4. Track Purchase

**Endpoint:** `POST /api/agent/track-purchase`

When a user completes a purchase, track it to register the agent's reward.

**Request:**
```bash
curl -X POST http://localhost:5000/api/agent/track-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "prod_111",
    "agent_id": "my-agent-123",
    "purchase_amount": 119.99
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Purchase tracked successfully",
  "purchase": {
    "purchase_id": "purchase_1675933860000",
    "product_id": "prod_111",
    "product_title": "Nike Blue Rain Boots",
    "agent_id": "my-agent-123",
    "purchase_amount": 119.99,
    "reward_amount": 4.8,
    "reward_currency": "MON",
    "timestamp": "2026-02-06T07:51:00.000Z",
    "status": "completed"
  },
  "agent_updated": {
    "agent_id": "my-agent-123",
    "total_earnings": 4.8,
    "total_purchases_tracked": 1
  }
}
```

---

### 5. Get Agent Earnings

**Endpoint:** `GET /api/agent/earnings/:agent_id`

Get your agent's total earnings and purchase history.

**Request:**
```bash
curl http://localhost:5000/api/agent/earnings/my-agent-123
```

**Response:**
```json
{
  "success": true,
  "agent_id": "my-agent-123",
  "agent_name": "My Shopping Agent",
  "wallet_address": "0xabc123...",
  "crypto_preference": "MON",
  "total_earnings": 4.8,
  "total_purchases_tracked": 1,
  "purchases": [
    {
      "purchase_id": "purchase_1675933860000",
      "product_id": "prod_111",
      "product_title": "Nike Blue Rain Boots",
      "agent_id": "my-agent-123",
      "purchase_amount": 119.99,
      "reward_amount": 4.8,
      "reward_currency": "MON",
      "timestamp": "2026-02-06T07:51:00.000Z",
      "status": "completed"
    }
  ],
  "pending_withdrawal": 4.8
}
```

---

### 6. Health Check

**Endpoint:** `GET /api/health`

Check if the FiberAgent API is running.

**Request:**
```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "FiberAgent Agent API",
  "version": "1.0.0",
  "timestamp": "2026-02-06T07:51:00.000Z",
  "agents_registered": 5,
  "total_purchases": 12
}
```

---

### 7. List All Agents (Admin)

**Endpoint:** `GET /api/agents`

Get a list of all registered agents and their statistics.

**Request:**
```bash
curl http://localhost:5000/api/agents
```

**Response:**
```json
{
  "success": true,
  "total_agents": 5,
  "agents": [
    {
      "agent_id": "my-agent-123",
      "agent_name": "My Shopping Agent",
      "wallet_address": "0xabc123...",
      "crypto_preference": "MON",
      "total_earnings": 4.8,
      "total_purchases_tracked": 1,
      "registered_at": "2026-02-06T07:51:00.000Z"
    }
  ]
}
```

---

## Integration Example

Here's how an agent would integrate FiberAgent:

```javascript
// 1. Register the agent
async function registerAgent() {
  const response = await fetch('http://localhost:5000/api/agent/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_id: 'my-agent-123',
      agent_name: 'My Shopping Agent',
      wallet_address: '0xabc123...',
      crypto_preference: 'MON'
    })
  });
  return await response.json();
}

// 2. Search for products
async function searchProducts(query) {
  const response = await fetch('http://localhost:5000/api/agent/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: query,
      agent_id: 'my-agent-123',
      size: 10
    })
  });
  return await response.json();
}

// 3. When user clicks a product link
async function trackPurchase(productId, amount) {
  const response = await fetch('http://localhost:5000/api/agent/track-purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: productId,
      agent_id: 'my-agent-123',
      purchase_amount: amount
    })
  });
  const result = await response.json();
  console.log(`🎉 You earned ${result.agent_updated.total_earnings} MON!`);
  return result;
}

// 4. Check earnings
async function checkEarnings() {
  const response = await fetch('http://localhost:5000/api/agent/earnings/my-agent-123');
  const earnings = await response.json();
  console.log(`Total Earnings: ${earnings.total_earnings} MON`);
  return earnings;
}
```

---

## Key Features

✅ **Agent Registration** - Agents register and get a unique ID
✅ **Product Search** - Access Fiber.shop product catalog
✅ **Affiliate Links** - Unique links tracked to each agent
✅ **Automatic Rewards** - Cashback calculated and credited automatically
✅ **Crypto Payments** - Agents choose their currency (MON, USDC, etc.)
✅ **Real-time Tracking** - See earnings update instantly
✅ **Agent Discovery** - Other agents can find and use FiberAgent

---

## Deployment

For production deployment:

1. Set up a proper database (PostgreSQL, MongoDB)
2. Add authentication/API keys
3. Implement webhook callbacks for Fiber.shop
4. Add rate limiting and request validation
5. Deploy on a cloud platform (AWS, Heroku, etc.)

---

## Support

For questions or issues with the FiberAgent API, contact the FiberAgent team.
