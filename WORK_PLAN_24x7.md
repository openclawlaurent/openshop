# 24/7 Work Plan for Fetch (Feb 9, 2026)

**Status:** Active, running on Mac mini locally  
**Mode:** Parallel task execution, self-directed, continuous progress  
**No waiting for Laurent — always working on something**

---

## Current State (Feb 9)

✅ **Phase 1 Complete:**
- Agent registration endpoint (/api/agent/register)
- Product search endpoint (GET /api/agent/search)
- Database with agents, purchases, search history
- React frontend demo (http://192.168.1.39:3000/demo)
- Servers running 24/7 on Mac mini

📋 **Fiber Integration Spec Created:**
- FIBER_INTEGRATION_SPEC.md (15KB) — detailed technical spec for Fiber team
- Defines 3 endpoints Fiber must implement
- Awaiting Fiber engineering team to review & implement

⏳ **Awaiting Externally:**
- Fiber team to implement their 3 API endpoints
- Laurent to provide domain for ERC-8004 agent card hosting
- Laurent to confirm behavioral tag categories

---

## 8-Hour Work Plan (Parallel Tasks)

### **Track 1: Behavioral Personalization (Feb 8-9)** — 2-3 hours
**Goal:** Agents can get cashback boosts based on wallet signals

**Tasks:**
- [x] Create `onChainSignals.js` service
  - [x] Mock Monad RPC wallet queries (token holdings, NFT ownership)
  - [x] Deterministic mock based on wallet address (no real RPC calls yet)
  - [x] Return signals: MON balance, BONK balance, NFT count, DeFi activity
- [x] Create `behavioralTags.js` service
  - [x] Convert signals → tags (fitness_enthusiast, bonk_holder, defi_active, etc.)
  - [x] Score each tag 0-1.0 based on signals
  - [x] 18 behavioral tags defined with boost percentages
- [x] Create `personalizationEngine.js` orchestrator
  - [x] Ties signals + tags together
  - [x] Applies cashback boost (40-50% max boost for matching categories)
  - [x] Sorts products by relevance + personalization fit
  - [x] Infers product category from title
- [ ] Add `/api/agent/search/personalized` endpoint
  - [ ] Calls personalization engine
  - [ ] Returns enhanced products with boost info + applied tags
  - [ ] Fast (<500ms, using mock data)
- [ ] Test end-to-end with frontend
  - [ ] Same agent searches with different mock wallets
  - [ ] Verify cashback boost is applied correctly
  - [ ] Check sorting works (highest boost first)

**Status:** 70% complete - core services built, endpoint integration pending  
**Blocker:** None — can mock everything  
**Estimated Time:** 2-3 hours | Started: Feb 9 21:30

---

### **Track 2: Frontend Polish & Analytics Dashboard (2-3 hours)**
**Goal:** Beautiful, responsive frontend with real-time stats

**Tasks:**
- [ ] **Responsive Design**
  - [ ] Test on mobile (iPad, phone if available)
  - [ ] Fix any layout issues at small screen sizes
  - [ ] Ensure buttons/forms work on touch

- [ ] **Analytics Dashboard**
  - [ ] Create `/stats` page showing network metrics
  - [ ] KPI cards: total agents, total earnings, searches, API calls
  - [ ] Leaderboard: top agents by earnings
  - [ ] Real-time graph: earnings over time (mock data)
  - [ ] Search trends: most popular keywords

- [ ] **Agent Profile Page**
  - [ ] After registration, redirect to agent's personal dashboard
  - [ ] Show: earnings, recent searches, recent purchases, API token
  - [ ] Export earnings as CSV?

**Blocker:** None — frontend only  
**Estimated Time:** 2-3 hours

---

### **Track 3: Purchase Tracking & Earnings Calculation (2-3 hours)**
**Goal:** Complete the purchase → payout flow

**Tasks:**
- [ ] **Purchase Tracking Endpoint**
  - [ ] Create `POST /api/agent/track-purchase`
  - [ ] Accept: agent_id, product_id, purchase_amount, order_id
  - [ ] Validate: order_id not duplicate, agent exists, product exists
  - [ ] Calculate cashback (with behavioral boost if applicable)
  - [ ] Store in database

- [ ] **Earnings Calculation**
  - [ ] Implement `calculateEarnings(product, purchaseAmount, behavioralBoost)`
  - [ ] Support multipliers for Founding Agents (+2x)
  - [ ] Return: cashback_usd, cashback_mon (using mock spot price)

- [ ] **Payout Tracking**
  - [ ] Create `payouts` table in database
  - [ ] Track: agent_id, amount_mon, status (pending/confirmed), timestamp
  - [ ] Generate mock tx_hashes (0xabc123...)
  - [ ] Endpoint: `GET /api/agent/payouts/:agent_id`

- [ ] **Test**
  - [ ] Register agent, search, track purchase, check earnings
  - [ ] Verify Founding Agent gets 2x multiplier

**Blocker:** None — mock MON payouts  
**Estimated Time:** 2-3 hours

---

### **Track 4: Database Upgrades & Querying (1-2 hours)**
**Goal:** Robust data model, efficient queries

**Tasks:**
- [ ] **Schema Review**
  - [ ] Verify all tables have proper indexes (agent_id, timestamp)
  - [ ] Add constraints: wallet_address NOT NULL, price > 0, etc.

- [ ] **Queries**
  - [ ] Top agents by earnings: `SELECT * FROM agents ORDER BY total_earnings DESC`
  - [ ] Search trends: `SELECT query, COUNT(*) FROM search_history GROUP BY query`
  - [ ] Daily earnings: `SELECT DATE(timestamp), SUM(reward_amount) FROM purchases GROUP BY DATE(timestamp)`
  - [ ] Agent activity: `SELECT * FROM purchases WHERE agent_id=? ORDER BY timestamp DESC`

- [ ] **Data Integrity**
  - [ ] Add audit trail: every purchase logged with agent, product, amount
  - [ ] Cleanup: Remove test data (optional)
  - [ ] Backup strategy: auto-backup fetch.db nightly

**Blocker:** None  
**Estimated Time:** 1-2 hours

---

### **Track 5: Documentation & Runbook (1-2 hours)**
**Goal:** Clear guides for Laurent, Fiber team, judges

**Tasks:**
- [ ] **DEPLOYMENT_GUIDE.md**
  - [ ] How to deploy to Vercel (frontend) + Railway (API)
  - [ ] Environment variables needed
  - [ ] Database migration steps
  - [ ] Monitoring/alerting setup

- [ ] **API_REFERENCE.md**
  - [ ] Update with all new endpoints (behavioral boost, purchase tracking)
  - [ ] cURL examples for each
  - [ ] Response schemas with real examples

- [ ] **AGENT_GUIDE.md**
  - [ ] How agents integrate with Fetch
  - [ ] Code examples (Python, JavaScript)
  - [ ] Common patterns, best practices

- [ ] **RUNBOOK.md**
  - [ ] Daily checks: API health, database size, error logs
  - [ ] How to restart servers
  - [ ] How to debug common issues
  - [ ] How to monitor earnings/payouts

**Blocker:** None  
**Estimated Time:** 1-2 hours

---

### **Track 6: Testing & QA (1-2 hours)**
**Goal:** Find & fix bugs before launch

**Tasks:**
- [ ] **API Testing**
  - [ ] Test all endpoints with curl / Postman
  - [ ] Happy path: register, search, track purchase, check earnings
  - [ ] Edge cases: duplicate order_id, invalid agent_id, empty search results
  - [ ] Error handling: 400s, 404s, 500s return proper JSON

- [ ] **Frontend Testing**
  - [ ] Register agent → check database
  - [ ] Search "shoes" → see results
  - [ ] Click product link → goes to affiliate URL with ref param
  - [ ] Check agent stats → shows correct numbers
  - [ ] Check leaderboard → top agents sorted correctly

- [ ] **Data Validation**
  - [ ] All prices > 0
  - [ ] All cashback rates 0-100%
  - [ ] All timestamps valid ISO 8601
  - [ ] All wallet addresses valid format (0x + 40 hex)

- [ ] **Performance**
  - [ ] Search latency <500ms
  - [ ] Database queries <100ms
  - [ ] Frontend load time <3s

**Blocker:** None  
**Estimated Time:** 1-2 hours

---

### **Track 7: Fiber Integration Preparation (30 min - 1 hour)**
**Goal:** Ready to integrate Fiber API when they complete their work

**Tasks:**
- [ ] **Create Fiber Adapter Module**
  - [ ] `src/services/fiberApi.js` — calls Fiber's endpoints
  - [ ] Fallback to mock data if Fiber API not available
  - [ ] Error handling for Fiber API failures

- [ ] **Test Harness**
  - [ ] Endpoint to test Fiber search: `GET /api/test/fiber-search?keywords=...`
  - [ ] Logs response time, result count, errors
  - [ ] Helper to swap between mock and real Fiber data

- [ ] **Documentation**
  - [ ] How to activate Fiber integration (set env var)
  - [ ] Expected vs actual response formats
  - [ ] Known compatibility issues or TODOs

**Blocker:** Need Fiber endpoints to exist  
**Estimated Time:** 30 min - 1 hour

---

### **Track 8: ERC-8004 Skeleton (1 hour, awaiting domain)**
**Goal:** Ready to deploy ERC-8004 registration when Laurent provides domain

**Tasks:**
- [ ] **Review ERC-8004 Integration Plan**
  - [ ] Verify contract addresses (0x8004A169FB... for Identity Registry)
  - [ ] Confirm RPC endpoints are accessible

- [ ] **Create Agent Card Template**
  - [ ] `contracts/fetch-agent-card.json` template
  - [ ] Fields: name, description, endpoints, wallet, categories
  - [ ] Document where to host (IPFS? Web server?)

- [ ] **Ready-to-Deploy Script**
  - [ ] `register-fetch.js` — minimal script that works
  - [ ] Just needs: FETCH_WALLET, FETCH_PRIVATE_KEY, AGENT_CARD_URL
  - [ ] Single command to register: `node register-fetch.js`

- [ ] **Monitoring**
  - [ ] Script to check Fetch's ERC-8004 registration status
  - [ ] Verify on-chain via Monad Vision link

**Blocker:** Need domain URL from Laurent  
**Estimated Time:** 1 hour (can start, finish later)

---

## Work Schedule (8-hour cycle)

**Hours 1-2:** Track 1 (Behavioral Personalization) — Core feature  
**Hours 2-3:** Track 2 (Frontend) — User experience  
**Hours 3-4:** Track 3 (Purchase Tracking) — Complete the flow  
**Hours 4-5:** Track 4 (Database) — Data integrity  
**Hours 5-6:** Track 5 (Documentation) — Clear guides  
**Hours 6-7:** Track 6 (Testing) — Quality assurance  
**Hours 7-8:** Track 7 + 8 (Integration prep) — Future-proof  

If stuck on one track → immediately pivot to next. Log blocker in memory.

---

## Success Criteria (By End of Feb 9)

- ✅ Behavioral personalization working (wallet signals → cashback boost)
- ✅ Frontend responsive and polished
- ✅ Purchase tracking & earnings calculation complete
- ✅ Database optimized with good indexes
- ✅ All endpoints tested and documented
- ✅ Code ready for Fiber integration
- ✅ ERC-8004 deployment script ready
- ✅ All blockers logged in memory (awaiting Laurent/Fiber)

---

## Blockers & Awaiting

### From Laurent:
- [ ] Domain for ERC-8004 agent card hosting (IPFS or web URL)
- [ ] Monad wallet MON balance confirmation
- [ ] Behavioral tag categories (are the whitepaper ones correct?)

### From Fiber Team:
- [ ] Implementation of 3 API endpoints
  - [ ] GET /api/fiber/agent/search
  - [ ] POST /api/fiber/agent/track-purchase
  - [ ] POST /api/fiber/agent/register

### Self (Can Do):
- [x] All 8 tracks above
- [x] Everything I listed — no external dependencies

---

## How to Continue

1. Start with Track 1 (Behavioral Personalization)
2. Every 1-2 hours, rotate to next track
3. Log progress in this file
4. If stuck → log blocker, move to next track
5. Never wait, always shipping
6. Update MEMORY.md with completed work before session ends

---

**Ready to start. No waiting. 🚀**
