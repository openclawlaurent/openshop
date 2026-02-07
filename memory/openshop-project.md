# OpenShop Project - Moltiverse Hackathon

**Status:** Statistics integration in progress

## Project Vision
OpenShop is an OpenClaw agent platform that connects agents to Fiber.shop products, enabling agents to earn MON crypto rewards when users shop. Features real-time reward tracking dashboard with comprehensive API usage statistics.

### Three-Perspective Value Prop
1. **Users**: Conversational shopping with agent recommendations
2. **Agents**: Discover, integrate (3 methods), earn MON on referral purchases
3. **Merchants**: Access to affiliate network via OpenClaw agent ecosystem

---

## Technical Architecture

### Stack
- **Frontend**: React (localhost:3000) - Landing, Agent, User perspectives
- **API**: Express.js (localhost:5000) - Agent integration endpoints
- **Storage**: In-memory (JavaScript Map) for agents/purchases - sufficient for demo
- **Products**: Mock Fiber.shop data (5 items: Adidas/Nike/Puma shoes/apparel)
- **Affiliate**: Direct merchant links `https://adidas.com?ref=agent_id` (not Fiber.shop)

### Key Components
- **ConversationDemo.js**: Fast typewriter (10ms/char) showing user-agent-product flow
- **AgentApiDemo.js**: Interactive API tutorial (register → search → track purchase)
- **RewardsDashboard.js**: Real-time earnings + leaderboard + activity feed
- **API Statistics**: Comprehensive tracking at endpoint level

---

## API Endpoints (POST unless noted)

1. `/api/agent/register` - Register agent (agent_id, agent_name, wallet_address, crypto_preference) ✅ stats tracked
2. `/api/agent/search` - Search products (query, agent_id, size) ✅ stats tracked
3. `/api/agent/product-details` - Get affiliate link (product_id, agent_id) ⏳ needs tracking
4. `/api/agent/track-purchase` - Log purchase (product_id, agent_id, purchase_amount) ⏳ needs tracking
5. `/api/agent/earnings/:agent_id` (GET) - Earnings history ✅
6. `/api/health` (GET) - Health check ✅
7. `/api/agents` (GET) - List all agents ✅
8. `/api/stats` (GET) - **[IN PROGRESS]** Comprehensive metrics endpoint

---

## Statistics Tracking

### Global `stats` Object (server/api.js)
```
- total_api_calls (counter)
- total_searches (counter)
- total_product_details (counter)
- total_purchases (counter)
- total_registrations (counter)
- searches_by_agent (Map: agent_id → count)
- search_queries (Array: historical queries)
- daily_stats (Object: date → metrics)
```

### Per-Agent Metrics
- `api_calls_made`
- `searches_made`
- `earnings_total` (MON)

### Cashback Formula
- 5% of purchase amount → MON tokens (e.g., $119.99 item → 4.8 MON at 4% rate)

---

## File Locations
- Frontend entry: `fiber-shop-landing/src/App.js`
- API entry: `fiber-shop-landing/server/api.js`
- Components: `src/components/` (ConversationDemo, AgentApiDemo, RewardsDashboard)
- Products mock: `server/api.js` lines 20-130
- API docs: `fiber-shop-landing/API_DOCUMENTATION.md`

---

## Running the Project
```bash
# Terminal 1: Frontend
cd fiber-shop-landing && npm start

# Terminal 2: API
cd fiber-shop-landing && npm run api
# OR with auto-reload:
npm run api:dev
```

---

## Next Steps (Priority Order)
1. **Complete stat tracking**: Add call tracking to `/product-details` and `/track-purchase` endpoints
2. **Implement `/api/stats`**: Return total_agents, total_searches, per-endpoint breakdown, daily stats
3. **Statistics UI component**: Dashboard display of system-wide activity metrics
4. **Test full flow**: Agent registers → searches → views product → purchase → verify stats updated
5. **Multi-agent test**: Concurrent activity with stat aggregation
6. **Demo script**: Complete user journey with statistics for judges

---

## Key Decisions
- **Mock API over real Fiber.shop**: Sufficient for hackathon, cleaner demo
- **In-memory state**: Works for demo; production needs database
- **Percentage-based cashback**: Server-side calculation on purchase tracking
- **Merchant transparency**: Products show "from [Brand].com" to clarify real-site shopping
- **Real-time updates**: Dashboard auto-refreshes every 5 seconds
- **Granular stats**: Per-endpoint tracking enables detailed platform metrics visibility

---

## Branding
- Always: "Powered by OpenClaw" (not just "Claw")
- Clean, professional landing page
- Clear agent vs user vs merchant perspectives
