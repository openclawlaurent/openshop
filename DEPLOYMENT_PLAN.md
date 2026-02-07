# Fetch Hackathon Deployment Plan
## Feb 6–15, 2026 | Monad Blockchain

**Project:** Fetch (Agent-Powered Behavioral Intelligence Shopping)  
**Location:** `/home/nuc/.openclaw/workspace-fiber/fiber-shop-landing`  
**Track:** Agent Track (No Token)  
**White Paper:** See `memory/fetch-whitepaper.md`

---

## Daily Checklist

### **Phase 1: Foundation (Feb 6–7)**
*Goal: Blockchain setup, agent identity, basic query endpoint*

#### **Feb 6 (Thursday)**
**Status update from system:** Rebranded OpenShop → Fetch ✅  
**Resources:** ERC-8004 spec found at https://docs.monad.xyz/guides/erc-8004-guide

**Tasks:**
- [ ] **Monad Mainnet Wallet for Fetch**
  - Confirm Fetch's Monad mainnet wallet address
  - Ensure wallet has MON for gas fees (~$1-5 for registration + reputation updates)
  - Store in `.env`: `FETCH_WALLET=0x...`

- [ ] **ERC-8004 Registration on Monad Mainnet**
  - **Identity Registry** (0x8004A169FB4a3325136EB29fA0ceB6D2e539a432): Register Fetch as agent
    - Create agent card JSON (name, description, endpoints, categories)
    - Upload to IPFS (or web server)
    - Mint ERC-721 token via Identity Registry contract
    - Save token ID in `.env`: `FETCH_TOKEN_ID=...`
  - **Reputation Registry** (0x8004BAa17C55a88189AE136b182e5fdA19dE9b63): Prepare for feedback submissions
    - Store contract address + ABI
  - **Resources:** See `contracts/FETCH_ERC8004_REGISTRATION.md` for step-by-step

- [ ] **Git Setup & First Commit**
  - Initialize git repo (if not already done): `git init`
  - Create `.gitignore` (node_modules, *.db, .env, contracts/build/)
  - Commit current fiber-shop-landing as baseline
  - **Repository structure should be:**
    ```
    fetch-platform/
    ├── agent/              (Query endpoint logic)
    ├── api/                (Express server)
    ├── contracts/          (ERC-8004 + other Monad contracts)
    ├── demo/               (React frontend)
    ├── docs/               (API docs, architecture)
    ├── .env.example
    ├── README.md
    └── DEPLOYMENT_PLAN.md
    ```

- [ ] **GitHub Setup**
  - User creates GitHub account (if needed)
  - Create public repo named `fetch-platform`
  - Add `DEPLOYMENT.md` from fiber-shop-landing
  - First push: current code
  - **Deadline:** EOD Feb 6

**Deliverable:** GitHub repo live, Monad wallet configured, ERC-8004 contract deployed

---

#### **Feb 7 (Friday)**
**Tasks:**

- [ ] **Execute ERC-8004 Registration (Continuation from Feb 6)**
  - Run registration script: `node register-fetch.js`
  - Record Fetch's token ID from transaction receipt
  - Update `.env`: `FETCH_TOKEN_ID=...`
  - Verify registration on 8004scan.io or Monad Vision
  - **Deliverable:** Fetch registered on Monad mainnet with verified token ID

- [ ] **Basic Search Endpoint**
  - Create `GET /api/agent/search?wallet=0x...&keywords=...`
  - Input: wallet address, search keywords
  - Output: dummy product results (hardcoded for now)
  - Response format:
    ```json
    {
      "agent_id": "fetch-agent-001",
      "wallet": "0x...",
      "query": "running shoes",
      "results": [
        {
          "product_id": "prod_123",
          "title": "Nike Pegasus 40",
          "merchant": "Dick's Sporting Goods",
          "price": 120,
          "cashback_percent": 12,
          "cashback_amount": 14.40,
          "affiliate_link": "https://dicks.com?ref=fetch"
        }
      ],
      "timestamp": "2026-02-07T14:23:00Z"
    }
    ```

- [ ] **Agent Registration Endpoint**
  - Create `POST /api/agent/register`
  - Input: agent_id, agent_name, wallet_address, is_founding_agent (boolean)
  - Store in database with Founding Agent flag
  - Response: confirmation + 2x multiplier note if Founding Agent
  - Database table: `agents` (agent_id, agent_name, wallet, founding_agent, registered_at)

- [ ] **API Documentation Update**
  - Document both endpoints in `docs/API.md`
  - Include cURL examples for judges

- [ ] **Test Endpoints Locally**
  - Verify both endpoints respond correctly
  - Test with sample wallet address
  - Update demo frontend to call real endpoints instead of hardcoded data

**Deliverable:** Fetch registered on Monad mainnet (ERC-8004) + two functional API endpoints

---

### **Phase 2: Intelligence Layer (Feb 8–10)**
*Goal: Behavioral personalization, on-chain signals, product integration, code vault*

#### **Feb 8 (Saturday)**
**Tasks:**

- [ ] **On-Chain Signal Reading**
  - Create `src/services/monadSignals.js` (or Python equivalent)
  - Query Monad RPC for wallet data:
    - Token holdings (MON, BONK, etc.)
    - NFT ownership
    - Transaction frequency
    - DeFi positions
  - Store signals in Postgres table: `on_chain_signals` (wallet, signal_type, value, timestamp)
  - Function: `async getWalletSignals(walletAddress)`

- [ ] **Behavioral Tags System**
  - Create tags based on on-chain signals
  - Examples:
    - "fitness_enthusiast" (if owns fitness NFTs, follows fitness DeFi)
    - "bonk_holder" (BONK token balance > threshold)
    - "defi_active" (recent DeFi transactions)
  - Table: `behavioral_tags` (wallet, tag, score 0-1.0, last_updated)

- [ ] **FP Decay Function**
  - Implement `decayedScore(rawScore, daysSinceActivity)`
  - Formula: `decayed = raw × e^(-days / 90)`
  - Ensure recent behavior weights more heavily
  - Test: verify scores halve ~every 2 months

- [ ] **Database Schema**
  - Create/update Postgres schema:
    - `agents` (agent_id, agent_name, wallet, founding_agent, registered_at)
    - `on_chain_signals` (wallet, signal_type, value, timestamp)
    - `behavioral_tags` (wallet, tag, score, last_updated, next_decay)
    - `products` (product_id, title, merchant, price, cashback_percent, affiliate_link)
    - `queries` (query_id, wallet, agent_id, keywords, results_count, timestamp)
  - Add indexes on `wallet`, `agent_id`, `timestamp`

**Deliverable:** On-chain signal reading functional, behavioral tags system in place, database ready

---

#### **Feb 9 (Sunday)**
**Tasks:**

- [ ] **FP Personalization Logic**
  - Create `src/services/personalization.js`
  - Function: `getPersonalizedCashback(wallet, merchantId, baseRate)`
  - Logic:
    ```
    1. Get wallet's behavioral tags
    2. Check if tag matches merchant category
    3. If match and score > 0.8: boost cashback 40-50%
    4. Decay score based on time since activity
    5. Return boosted_rate
    ```
  - Example: User with `fitness_enthusiast: 0.92` buying from Dick's → 12% (base 8%)

- [ ] **Wildfire Integration (Placeholder)**
  - For now: mock Wildfire product search
  - Create `src/services/productSearch.js` with function:
    ```javascript
    async searchProducts(query, personalizationBoost)
    ```
  - Return 5-10 hardcoded products for demo
  - **Post-hackathon:** Real Wildfire API integration
  - Document the integration point in `docs/WILDFIRE_INTEGRATION.md`

- [ ] **Discount Code Vault**
  - Create database table: `discount_codes` (code, merchant, discount_percent, verified, expiration, contributor, created_at, success_rate)
  - Endpoint: `POST /api/codes/submit` (agent submits code)
  - Endpoint: `GET /api/codes/check?merchant=...` (check if code exists)
  - Seed vault with 10-15 fake but realistic codes (Nike, Dick's, Target, etc.)
  - Response includes: code, merchant, discount %, tested_date, success_rate

- [ ] **Fallback Logic in Search**
  - If no direct affiliate link for merchant:
    - Query discount code vault
    - Return best verified code + disclaimer
    - Response: "No direct cashback, but I got you 15% off with code SUMMER15"

**Deliverable:** Personalization engine working, product search integrated, code vault operational

---

#### **Feb 10 (Monday)**
**Tasks:**

- [ ] **Purchase Webhook Handler**
  - Create `POST /api/webhook/purchase` endpoint
  - Input from Wildfire (mock for now):
    ```json
    {
      "purchase_id": "purchase_123",
      "merchant_id": "dicks_sporting",
      "calling_agent": "agent_gpt",
      "wallet": "0xABC...",
      "purchase_amount": 120,
      "cashback_owed": 14.40,
      "code_used": "SUMMER15",
      "timestamp": "2026-02-10T14:00:00Z"
    }
    ```
  - Store in `purchases` table

- [ ] **Kickback Calculation**
  - Create `calculateKickback(cashbackOwed, agentId)`
  - Base rate: 5% of cashback for calling agent
  - Founding Agents: 2x (10%)
  - Example: $14.40 cashback → $0.72 to calling agent (5%) or $1.44 (Founding)
  - Store in `kickback_ledger` table (agent_id, purchase_id, amount_mon, status, timestamp)

- [ ] **MON Spot Price Integration**
  - Create `src/services/monPrice.js`
  - Fetch current MON/USD spot price (from DEX or API)
  - Convert kickback amount to MON: `amount_usd / spot_price`
  - Example: $0.72 → 0.72 / $0.12 = 6 MON (if MON = $0.12)
  - Store spot price at time of purchase for audit

- [ ] **Code Contributor Fee**
  - If purchase used a code: 10-20% of code benefit to code submitter
  - Example: Code saved user $18 → $1.80-$3.60 to contributor
  - Track in `code_contributions` table

**Deliverable:** End-to-end purchase flow functional (mock Wildfire), kickback system calculating correctly

---

### **Phase 3: Economics & Trust (Feb 11–12)**
*Goal: Query staking, reputation, gossip feed, Founding Agent program*

#### **Feb 11 (Tuesday)**
**Tasks:**

- [ ] **Query Staking System**
  - Create `POST /api/agent/stake` endpoint
  - Calling agent stakes ~$0.01 equivalent MON (~0.08 MON) per query
  - On successful purchase: stake returned + kickback sent
  - On spam/no purchase: stake held/burned
  - Table: `query_stakes` (stake_id, agent_id, amount_mon, query_id, status, resolved_at)

- [ ] **ERC-8004 Reputation Submission to Monad Mainnet**
  - Implement `submitReputationFeedback(stats)` function (see `src/services/erc8004Reputation.js`)
  - **After each purchase**, calculate metrics and submit to Reputation Registry:
    - Conversion rate (0-100)
    - Response time (0-100, capped)
    - Tags: ["fast", "accurate", "behavioral-intelligence", "commerce", "monad"]
    - Content hash for integrity
  - **Strategy:** Submit every 10 purchases (to save gas during hackathon)
  - Verify updates on 8004scan.io in real-time
  - **Resources:** `contracts/FETCH_ERC8004_REGISTRATION.md` (Step 5)

- [ ] **Agent Reputation Dashboard**
  - Endpoint: `GET /api/agent/reputation?agent_id=...`
  - Response:
    ```json
    {
      "agent_id": "fetch-agent-001",
      "conversion_rate": 0.87,
      "avg_response_time_ms": 45,
      "total_queries": 342,
      "reputation_score": 4.8,
      "on_chain_verified": true,
      "erc8004_token_id": "FETCH_TOKEN_ID",
      "on_chain_reputation_url": "https://8004scan.io/agent/FETCH_TOKEN_ID"
    }
    ```

- [ ] **Founding Agent Program Implementation**
  - Flag all early agents as Founding Agent on registration
  - 2x multiplier baked into their profile
  - Endpoint: `GET /api/agents/founding` (list Founding Agents)
  - Dashboard badge: ⭐ Founding Agent (2x earnings)

**Deliverable:** Query staking + ERC-8004 reputation feedback live on Monad mainnet, Founding Agent program active

---

#### **Feb 12 (Wednesday)**
**Tasks:**

- [ ] **Gossip Feed Data Aggregation**
  - Create `src/services/gossipFeed.js`
  - Aggregate metrics from last 24/7/30 days:
    - Category trends by community (e.g., "Fitness trending 3.2x in BONK community")
    - Conversion benchmarks ("Premium gear converts 2.1x better for DeFi-active wallets")
    - Purchase intent signals (e.g., "Electronics searches up 15% week-over-week")
  - Table: `gossip_metrics` (metric_type, cohort, value, timestamp, impressiveness_score)

- [ ] **Gossip Feed Endpoint**
  - `GET /api/gossip/feed` (paginated, most recent first)
  - Response format:
    ```json
    {
      "insights": [
        {
          "insight_id": "insight_123",
          "title": "Fitness Intent Trending",
          "message": "BONK community showing 3.2x fitness purchases this week vs. baseline",
          "metric_type": "category_trend",
          "cohort": "BONK_holders",
          "value": 3.2,
          "timestamp": "2026-02-12T14:00:00Z"
        }
      ],
      "next_cursor": "..."
    }
    ```

- [ ] **Trending Insights for Twitter Bot**
  - `GET /api/gossip/trending` (top 5 insights)
  - Judges will see this → should be impressive
  - Examples:
    - "MON holders converting on crypto hardware 2.7x above average"
    - "Streetwear searches spiked 180% after Monad ecosystem announcement"
    - "Fitness enthusiasts spending 40% more on premium brands vs. general cohort"

- [ ] **Twitter Bot Integration (Skeleton)**
  - Create `src/services/twitterBot.js`
  - Placeholder: log to console for now (we'll automate in Feb 13-14)
  - Function: `postTrendingInsight(insight)` → would post to Twitter/X
  - Document flow in `docs/TWITTER_BOT.md`

**Deliverable:** Gossip feed generating meaningful insights, Twitter bot skeleton ready

---

### **Phase 4: Polish & Demo (Feb 13–14)**
*Goal: Beautiful demo, persona refinement, documentation, judges' experience*

#### **Feb 13 (Thursday)**
**Tasks:**

- [ ] **Fetch Persona Tuning**
  - Review tone examples from white paper (Section 3)
  - Update all API response messages to reflect Fetch's "Ari Gold" personality
  - Examples:
    - Search result: "Nike Pegasus 40 at Dick's for $120. I got you 12% cashback because I know you run. That's $14.40 back. This is why you have an agent."
    - No match: "I'm not going to insult you with a bad deal. Check back soon."
    - First time: "New here? First one's on me. Remember who made it happen."
  - Create `PERSONA_GUIDE.md` for consistency

- [ ] **Demo Page Redesign**
  - Update React demo page to showcase end-to-end flow:
    1. Agent A registers as Founding Agent → 2x kickback visual
    2. Agent A queries Fetch with wallet 0xABC for "running shoes"
    3. Fetch returns personalized result (behavioral boost explanation)
    4. User completes purchase → webhook fired
    5. Kickback calculated + sent to Agent A
    6. Reputation updated on-chain
    7. Gossip feed updated with new insights
  - Add visual indicators for:
    - On-chain verification badge
    - Founding Agent status
    - Reputation score
    - Query stake flow

- [ ] **API Documentation Polish**
  - Update `docs/API.md` with all endpoints
  - Add cURL examples judges can run live:
    ```bash
    # Register as Founding Agent
    curl -X POST http://fetch-api.local/api/agent/register \
      -H "Content-Type: application/json" \
      -d '{"agent_id": "judge-agent-1", "agent_name": "Judge Test", "wallet": "0xJudge...", "is_founding_agent": true}'
    
    # Query Fetch
    curl -X GET "http://fetch-api.local/api/agent/search?wallet=0x123&keywords=running+shoes"
    
    # Check reputation
    curl -X GET http://fetch-api.local/api/agent/reputation?agent_id=fetch-agent-001
    
    # Get gossip feed
    curl -X GET http://fetch-api.local/api/gossip/trending
    ```

- [ ] **Architecture Diagram**
  - Create visual in `docs/ARCHITECTURE.md`:
    - Calling Agent → Fetch → FP Engine + On-Chain Signals + Product Search + Code Vault → Personalized Response
    - Include flow for: purchase → webhook → kickback → reputation → gossip
  - Use ASCII or external diagram tool

**Deliverable:** Persona consistent, demo page impressive, API docs judge-ready

---

#### **Feb 14 (Friday)**
**Tasks:**

- [ ] **README.md Final Version**
  - Sections:
    1. **What is Fetch?** (One-liner + elevator pitch)
    2. **Why It's Different** (4 unfair advantages)
    3. **Quick Start** (how to run locally)
    4. **Architecture** (link to docs/ARCHITECTURE.md)
    5. **API** (link to docs/API.md)
    6. **Key Features** (agent registration, behavioral personalization, kickback, reputation, gossip)
    7. **For Judges** (how to test, endpoints to call)
    8. **Team Notes** (who built what, timeline)
  - **Tone:** Professional but with Fetch's personality shine through

- [ ] **Submission Documentation**
  - Create `SUBMISSION.md`:
    - [ ] GitHub repo structure verified
    - [ ] All endpoints working and documented
    - [ ] Original vs. reused code clearly marked (comments: `// Original`, `// From fiber-shop-landing baseline`)
    - [ ] Demo endpoint publicly accessible (or localhost with instructions)

- [ ] **Demo Script (For Video)**
  - Write 2-3 minute script walking judges through:
    1. "This is Fetch. Here's the problem we solve..." (15 sec)
    2. "Agent A registers here, gets 2x earnings as Founding Agent..." (20 sec)
    3. "Agent A queries for 'running shoes' for wallet 0xABC..." (10 sec)
    4. "See the behavioral personalization? FP tags recognize this wallet as a runner, boosts to 12% cashback..." (20 sec)
    5. "No direct affiliate? We pull a verified discount code instead..." (15 sec)
    6. "Purchase completes → webhook fires → kickback calculated in MON → on-chain reputation updated..." (30 sec)
    7. "Gossip feed now has new insight: 'Fitness intent trending in BONK community'..." (15 sec)
    8. "This is why everyone needs an agent. Have your agent call mine." (15 sec)
  - **Total:** ~2.5 minutes
  - Save to `docs/DEMO_SCRIPT.md`

- [ ] **Twitter Bot Automation (Bonus)**
  - If time permits: Wire up automated posting to Twitter/X
  - Fetch's Twitter account posts trending insights every 2 hours during demo
  - Judges see live tweets: "#Monad #Fetch: Streetwear trending 1.8x in DeFi cohort 📈"

- [ ] **Hackathon Submission Checklist**
  - [ ] GitHub repo clean, no node_modules
  - [ ] .env.example provided (no secrets committed)
  - [ ] README.md complete
  - [ ] API docs comprehensive
  - [ ] Demo script ready
  - [ ] All endpoints tested
  - [ ] Monad contract deployed + address documented
  - [ ] Database schema in repo (SQL dump or migration file)
  - [ ] Instructions for running locally + testing endpoints
  - [ ] Demo video ready to upload (Feb 15)

**Deliverable:** All documentation complete, demo script ready, submission package nearly final

---

### **Phase 5: Submit (Feb 15)**
*Goal: Perfect submission, final testing, demo video upload*

#### **Feb 15 (Friday - Submission Day)**
**Tasks:**

- [ ] **Final Testing**
  - Run all endpoints locally one more time
  - Verify:
    - Agent registration works
    - Behavioral personalization returns correct boost
    - Code vault fallback works
    - Kickback calculated correctly
    - Reputation updates (or at least logged)
    - Gossip feed returns compelling insights
  - **Test with sample data:** Use testnet wallet addresses

- [ ] **Demo Video**
  - Record 2-5 minute video using script from `docs/DEMO_SCRIPT.md`
  - Show:
    - Running API endpoints
    - cURL commands executing in real-time
    - Response JSON with personalization logic visible
    - Database entries (agent, purchase, gossip)
  - Upload to YouTube (unlisted)
  - Save link in submission

- [ ] **GitHub Final Push**
  - Ensure all code committed
  - Verify repo structure:
    ```
    fetch-platform/
    ├── agent/                   (Query logic)
    ├── api/                      (Express server)
    ├── contracts/                (ERC-8004)
    ├── demo/                     (React frontend)
    ├── docs/
    │  ├── API.md
    │  ├── ARCHITECTURE.md
    │  ├── DEMO_SCRIPT.md
    │  ├── PERSONA_GUIDE.md
    │  └── WILDFIRE_INTEGRATION.md
    ├── .env.example
    ├── .gitignore
    ├── README.md
    ├── DEPLOYMENT_PLAN.md
    ├── package.json
    ├── server.js (or api.js)
    └── schema.sql (database schema)
    ```

- [ ] **Submission Form**
  - Fill out hackathon form with:
    - GitHub repo URL: `https://github.com/YourUsername/fetch-platform`
    - Demo video URL: YouTube link
    - Written description (500–800 words):
      - Problem: AI agents are blind to behavioral data
      - Solution: Fetch provides behavioral intelligence layer
      - FP personalization: on-chain + off-chain data fusion
      - ERC-8004 trust: on-chain reputation registry
      - Monad usage: sub-second finality, low gas, high throughput
      - Agent economics: kickback system creates incentive loop
    - Contact email: Laurent's email

- [ ] **Final Checklist**
  - [ ] All endpoints callable by judges
  - [ ] No secrets in repo
  - [ ] Database accessible (schema provided)
  - [ ] Instructions clear for running locally
  - [ ] Tone/persona consistent throughout
  - [ ] White paper linked/referenced in README
  - [ ] Team acknowledgments included

**Deadline:** 23:59 ET on Feb 15

**Deliverable:** Submission complete, judges ready to evaluate

---

## Parallel Track: Deployment & Infrastructure

### GitHub Deployment
- [ ] Feb 6: Repo initialized + first commit
- [ ] Feb 7: Basic endpoints pushed
- [ ] Feb 8–12: Feature branches for intelligence, economics, gossip
- [ ] Feb 13–14: Main branch final polish
- [ ] Feb 15: Tagged release (v1.0-hackathon)

### Local Development
- [ ] Create `.env.example`:
  ```
  MONAD_RPC=https://testnet-rpc.monad.com
  MONAD_WALLET_KEY=your_test_wallet_key
  DATABASE_URL=postgres://user:pass@localhost/fetch_hackathon
  TWITTER_API_KEY=xxx (optional)
  TWITTER_API_SECRET=xxx (optional)
  ```

### Database
- [ ] Postgres running locally (Docker: `docker run -d postgres:15`)
- [ ] Schema migrations tracked in `migrations/` folder
- [ ] Sample data seeded for demo

---

## Success Metrics

### MVP Features (Must Have)
- ✅ Agent registration + Founding Agent flag
- ✅ Search endpoint with behavioral boost
- ✅ On-chain signal reading + behavioral tags
- ✅ Kickback calculation + MON conversion
- ✅ ERC-8004 reputation feedback
- ✅ Discount code vault
- ✅ Gossip feed with 5+ trending insights
- ✅ Fetch persona consistent across responses

### Demo Excellence (Nice to Have)
- ✅ Working Twitter bot posting insights
- ✅ Beautiful React frontend showing flow
- ✅ Real Monad testnet deployment
- ✅ Impressive gossip metrics that judges screenshot

### Judge Confidence
- Judges can run cURL commands and see personalized results
- Gossip feed shows real market intelligence (not vanity metrics)
- Persona shines: responses feel like talking to a real agent
- On-chain reputation updates visible in transaction logs

---

## Known Constraints & Contingencies

### Monad RPC/Network Issues
- **Plan B:** Use local Hardhat node with Monad fork
- **Fallback:** Mock on-chain calls for demo (document clearly as "demo mode")

### Wildfire API Unavailable
- **Plan B:** Use mock product data (5-10 hardcoded products)
- **Acceptable for hackathon:** Judges understand API integrations are external dependencies

### Database Crashes
- **Plan B:** SQLite fallback (lightweight, no setup)
- **In code:** Add `DATABASE_FALLBACK=sqlite` in .env

### Time Crunch (Feb 13–15)
- **Priority order if behind:**
  1. Agent registration + search endpoint (MUST HAVE)
  2. Behavioral boost logic (MUST HAVE)
  3. Kickback calculation (MUST HAVE)
  4. Gossip feed (NICE TO HAVE)
  5. Twitter bot (BONUS)

---

## Communication Cadence

- **Daily standup:** Brief status (feature complete, blockers)
- **Feb 7 end-of-day:** Foundation phase review
- **Feb 10 end-of-day:** Intelligence phase review
- **Feb 12 end-of-day:** Economics phase review
- **Feb 14 end-of-day:** Final demo ready for feedback
- **Feb 15 AM:** Final submission review + upload

---

## Questions for Laurent / Team

### ERC-8004 / Monad Mainnet (CRITICAL)
1. **Fetch Monad Mainnet Wallet:** What's the wallet address we should use for ERC-8004 registration?
   - Or should I create a new one?
2. **Private Key Storage:** Where/how do we securely store FETCH_PRIVATE_KEY?
   - In `.env.example`? Vault? KMS?
3. **Agent Card Hosting:** IPFS or web server for the Fetch agent card JSON?
   - Preferred: IPFS via pinata.cloud?
4. **Production API Endpoint:** What URL do we register on ERC-8004 Identity Registry?
   - Example: `https://fetch-api.example.com/api/agent/search`?
   - Or localhost:5000 for demo?

### API & Infrastructure
5. **Wildfire API:** Do we have real API keys, or mock entirely for hackathon?
6. **Logo/Branding:** Any PNG for Fetch logo to include in agent card?

### Project Management
7. **Twitter account:** Should Fetch auto-post trending insights to X/Twitter?
8. **Repository visibility:** Public from start, or private until Feb 15 submission?
9. **Database:** Postgres (recommended) or SQLite (simpler)?
10. **Video recording:** Who's doing the demo video, and what's the recording setup?

---

## Resources

- **White Paper:** `memory/fetch-whitepaper.md` (complete product spec)
- **ERC-8004 Guide:** `memory/erc-8004-guide.md` (official Monad spec + contract addresses)
- **ERC-8004 Registration Plan:** `contracts/FETCH_ERC8004_REGISTRATION.md` (step-by-step for Feb 6-7)
- **API Examples:** `docs/API.md` (to be created)
- **Architecture:** `docs/ARCHITECTURE.md` (to be created)
- **Persona Guide:** `PERSONA_GUIDE.md` (to be created)
- **Previous Codebase:** `fiber-shop-landing/` (baseline for UI/backend structure)

### Key Contract Addresses (Monad Mainnet)
- **Identity Registry:** `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` (register Fetch as agent)
- **Reputation Registry:** `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` (submit feedback after purchases)
- **Validation Registry:** Coming soon

---

**Status:** Plan created Feb 6, 2026 | ERC-8004 spec + registration plan finalized | Ready to execute  
**Next action (URGENT Feb 6):**
1. Provide Fetch's Monad mainnet wallet address + private key storage location
2. Confirm agent card hosting (IPFS or web)
3. Confirm production API endpoint URL
4. Then: Execute ERC-8004 registration (Feb 7) + begin Phase 1 API development
