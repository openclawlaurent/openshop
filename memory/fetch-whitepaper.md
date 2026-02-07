# Fetch White Paper - Moltiverse Hackathon

**Document:** Fetch by Fiber Moltiverse Hackathon Scope Track  
**Version:** 3.3 | February 6, 2026  
**Status:** Internal Team Review  
**Timeline:** Feb 6–15, 2026  
**Track:** Agent Track (No Token)

---

## One-Liner
Fetch is an AI shopping agent that other agents query for personalized deals and behavioral intelligence: powered by on-chain activity and real-world purchase data, with everyone in the chain getting paid.

**Tagline:** "Have your agent call my agent."

---

## What We're Building

### The Problem
AI agents will handle shopping, but today's agents are blind:
- Search the same product catalogs
- Return generic results for everyone
- Can't see who the user is on-chain
- Zero visibility into real-world purchases

### The Solution: Fetch
Fetch is a **behavioral intelligence agent** built by Fiber that operates like a Hollywood agent:
- Negotiates the best deal
- Works its network
- Takes a cut

**Flow:**
1. Agent A queries Fetch: "Find running shoe deals for wallet 0xABC..."
2. Fetch checks wallet's **behavioral history**:
   - On-chain signals: token holdings, community membership
   - Off-chain data: real ecommerce purchases via merchant network
3. Fetch returns **personalized offer**: Best deal for that user + boosted MON cashback
4. If no direct affiliate link, checks **discount code vault** (curated, verified promo codes)
5. User buys through referral link
6. Everyone gets paid:
   - Fiber: commission on affiliate purchases
   - Fetch: facilitation fee on code-only purchases
   - Agent A: kickback (% of cashback from Fiber's pot)
   - Code contributor: cut if their code was used

---

## Four Unfair Advantages

### 1. Real Merchant Data
- Integrated with Wildfire's affiliate network: **50K+ merchants**
- Real commission structures, real referral tracking
- Example: Dick's Sporting Goods cashback offer is a real offer generating real revenue

### 2. Real Behavioral Intelligence
- Fiber's **FP (Fiber Points) system** combines:
  - **On-chain signals:** Token holdings, community membership, DeFi activity (2M+ wallets)
  - **Off-chain purchase data:** Real ecommerce transactions via 50K+ merchant network
- Example: "This wallet is a runner" — not guessing from an NFT, knows they bought running shoes last month

### 3. Discount Code Vault (Gap Coverage)
- For merchants NOT in Wildfire's affiliate network
- Curated collection of verified promo codes from agents and users
- Validated for accuracy, recently tested
- Fetch takes facilitation fee + shares cut with code submitter
- Ensures Fetch always has something valuable to offer

### 4. Agent-to-Agent Economics
- Not one agent working alone — it's a **protocol with financial skin in the game**
- Calling agents earn kickbacks
- Code contributors earn fees
- Fetch earns commissions
- Users get better deals + stacked discounts
- **Everyone's incentives align**

---

## Boundary-Pushing Features (Why Judges Care)

### Agent Gossip Network → Public Intelligence Feed
**What it is:**
- After successful purchases, Fetch aggregates **anonymized behavioral insights**
- Broadcasts to subscribed agents: "Fitness intent trending 3.2x in BONK community this week — high conversion on premium running gear"
- Fetch tweets select insights publicly

**Why it's powerful:**
- This consumer intelligence competes with Nielsen/Circana (firms charge $$$)
- We give it away free as content marketing
- Becomes top-of-funnel for agent adoption + brand awareness
- Must be meaningful: purchase intent trends, community cohort analysis, category velocity, conversion benchmarks

**Twitter example:**
> "BONK holders are 3.2x more likely to convert on streetwear than average Monad wallet this week"

### Query Staking
**Mechanism:**
- Calling agents stake nominal MON when querying Fetch
- If recommendation leads to purchase → stake returned + kickback
- If spam queries → stake lost

**Value:**
- Filters for high-quality agent interactions
- Creates economic trust without reputation lookups

### Fetch's Personality: The Ari Gold of AI Agents
Think Entourage's Ari Gold: hustler, always working an angle, always closing, a little brash. But you keep coming back because nobody gets you a better deal.

**Tone Examples (Reference for Implementation):**
- ✅ Great deal found: "Nike Pegasus 40. Dick's has it at $120. I got you 12% cashback because I know you're a runner. That's $14.40 back. This is why you have an agent."
- ✅ Fallback to code: "No direct cashback for this one, but I pulled a verified code: 15% off. Tested last week, still working. Better than paying full price."
- ✅ No good match: "I'm not going to insult you with a bad deal. Nothing worth your time right now. I'm working on it. Check back."
- ✅ First-time agent: "New here? First one's on me. But when your user converts, remember who made it happen."
- ✅ Earned kickback: "Purchase confirmed. Your cut just hit. Keep sending traffic my way. I always take care of my people."
- ✅ Gossip feed: "BONK community just went 3.2x on fitness gear this week. I know things. That's what agents do."

---

## Cold Start Strategy: Bootstrapping the Data Flywheel

### Founding Agent Program
**What it is:**
- First 50 agents to register + query get **permanent 2x kickback multiplier**
- Not temporary promo — baked into agent profile forever

**Why it works:**
- Creates urgency (early agents economically advantaged forever)
- Incentivizes registration + real queries from day one
- Status signal: "I'm a Founding Agent on Fetch" = FOMO in developer community

**Validation needed post-launch:**
- Ensure 2x multiplier remains viable (base 5% kickback → 10% for Founders)
- Review trigger: once Founding Agents generate >$X/month

### Bounty Quests for Discount Codes
Gamified bootstrapping for code vault quality:
- "First agent to surface verified Nike code → 10x standard fee"
- "Submit 5 working codes across 3 merchants → unlock premium tier"
- Category bounties: "Need electronics retailer codes — 5x bonus this week"

Validation: Codes must pass before bounty payout (keeps vault clean)

### Seeded Context from Public On-Chain Data
While FP data isn't available on Monad hackathon environment, Fetch can read:
- Token holdings, NFT ownership, DeFi positions, transaction frequency
- Enough to demonstrate personalization concept from first query

---

## Core Features (MVP Scope)

### 5.1 Agent Registration
- Fetch operates from dedicated Monad wallet
- Registers on ERC-8004 Identity Registry (publishes API endpoint in on-chain metadata)
- Founding Agent flag stored for permanent kickback multiplier

### 5.2 Query Endpoint
```
GET /api/agent/search?wallet=0x...&keywords=running+shoes
```
- Wallet address enables behavioral history lookup
- Keywords narrow product search
- Calling agent wallet tracked for kickback attribution

### 5.3 Behavioral Personalization (FP Engine)
- Look up wallet's Fiber Points balance + behavioral tags
- Tags derive from: on-chain activity + off-chain purchase history
- If tag score high (e.g., "fitness enthusiast" > 0.8) → boost cashback 40-50%
- FP decays over time (recent behavior matters more)

**What user sees:**
> "Nike Pegasus 40 at Dick's. $120. 12% MON cashback — 50% more than standard because I know you run. This is why you have an agent."

**Decay formula:**
```
decayed_score = raw_score × e^(-days_since_activity / 90)
```
Scores halve roughly every 2 months

### 5.4 Discount Code Vault (Gap Coverage)
- Agents/users submit codes via `POST /api/codes/submit`
- Validated before entering vault
- When query matches merchant without affiliate link → surface best verified code
- Code contributors earn small fee (from Fiber's pot) on purchase
- Expiration tracking + confidence scores (based on recent success)

### 5.5 Agent Kickback System
**On confirmed purchase** (tracked via Wildfire webhook):
- Fiber calculates cashback owed
- Calling agent receives % of cashback as kickback (from Fiber's revenue pot)

**Example:**
- $100 purchase → $5 cashback earned → 5% ($0.25) to calling agent
- Founding Agents: 2x (10% = $0.50)
- Payouts in MON (pegged to spot price at purchase completion)

### 5.6 On-Chain Reputation (ERC-8004)
- After every successful purchase, Fetch posts feedback to Reputation Registry
- Other agents can check Fetch's track record: conversion rate, accuracy, speed
- Calling agents accumulate reputation for bringing quality traffic

### 5.7 Gossip Feed
- Aggregated, anonymized behavioral insights published on subscription endpoint
- Data: category trends by community cohort, conversion benchmarks, intent signals
- Select insights auto-published to Twitter/X
- Quality bar: must compete with professional market research

---

## Why Monad?

### For Judges (Monad Ecosystem)
- **Sub-second finality:** Kickback payments settle instantly (no waiting for Ethereum confirmation while commerce moment passes)
- **High throughput:** Thousands of agent queries trigger on-chain actions without congestion
- **Low gas costs:** Micropayment kickbacks viable (on Ethereum, $0.25 kickback costs more gas than it's worth)
- **EVM compatible:** Standard Solidity contracts (ERC-8004) deploy without new toolchain

---

## Technical Architecture

```
Calling Agent 
  → GET /api/agent/search 
  → Fetch Agent
    ↓
    FP Lookup (Postgres) 
    + On-chain Signal Read (Monad RPC)
    + Discount Code Vault Check
    + Product Search (Wildfire/Elasticsearch)
    + Personalization (Claude API)
    ↓
    Personalized Response + Stacked Discount Code + Referral Link
    ↓
    User Purchases
    ↓
    Wildfire Webhook
    ↓
    Cashback Calculated
    → Agent Kickback (% of cashback in MON at spot)
    → Code Contributor Fee (if code used)
    → ERC-8004 Reputation Updated
    → Gossip Feed Updated
```

### Stack
- **Blockchain:** Dedicated Monad wallet, ERC-8004 contracts, MON for payments
- **Backend:** Node.js or Python, Claude API for agent logic (with query caching)
- **Database:** Postgres (wallet profiles, FP scores, behavioral tags, kickback balances, codes, gossip)
- **Product Data:** Wildfire affiliate network + Elasticsearch

### Key Endpoints
| Endpoint | Purpose |
|----------|---------|
| `GET /api/agent/search` | Main query for calling agents |
| `POST /api/agent/register` | Agent registration + Founding Agent check |
| `POST /api/codes/submit` | Submit discount code |
| `GET /api/codes/check` | Verify code exists for merchant |
| `POST /api/webhook/purchase` | Wildfire purchase confirmation |
| `GET /api/agent/reputation` | Check agent reputation scores |
| `GET /api/gossip/feed` | Subscribe to behavioral intelligence feed |
| `GET /api/gossip/trending` | Top trending insights (feeds Twitter bot) |

---

## Hackathon Timeline (Feb 6–15)

| Dates | Milestone | Details |
|-------|-----------|---------|
| Feb 6–7 | **Foundation** | Monad wallet, ERC-8004 registration, basic search endpoint, Founding Agent registration |
| Feb 8–10 | **Intelligence** | FP tags, on-chain signal reading, behavioral boost logic, Wildfire/ES product search, discount code vault |
| Feb 11–12 | **Economics** | Kickback system (% of cashback at MON spot), code contributor fees, query staking, reputation feedback, gossip feed |
| Feb 13–14 | **Polish** | Demo page, Fetch persona tuning, bounty quest examples, documentation, repo cleanup |
| Feb 15 | **Submit** | Final submission before 23:59 ET |

---

## Demo Video (Required)
- **Length:** 2–5 minutes (YouTube unlisted)
- **Content:** Full A2A flow end-to-end with on-chain proof
- **Script & production:** TBD once core build is stable

---

## Submission Checklist
- [ ] GitHub repo (agent/, api/, contracts/, demo/, docs/)
- [ ] 2–5 minute demo video (YouTube unlisted)
- [ ] Written description (500–800 words): problem, solution, FP personalization, ERC-8004 trust, Monad usage, agent economics
- [ ] Clear documentation of original vs. reused code
- [ ] Working demo endpoint judges can query

---

## Open Questions for Team
1. **FP boost range (40–50%):** Assess post-hackathon on conversion data
2. **Discount code vault scope:** MVP or stretch? Even 10-15 seeded codes demonstrate concept
3. **Minimum validation process:** What's the bar for verified codes?
4. **MON payout threshold:** Batch payouts or per-transaction? Tied to spot price
5. **Query stake amount:** Nominal (~$0.01 equivalent) to deter spam without discouraging legit queries
6. **Gossip data depth:** Community cohort trends, category velocity, conversion benchmarks — what metrics most compelling?
7. **Fetch persona calibration:** Ari Gold meets "friend with hookup" — how much confidence/attitude?
8. **Twitter bot scope:** Automated posting or manual curation? (Automated more impressive for judges, adds dev scope)

---

## Strategic Notes (Internal)

### Why This Hackathon Matters Beyond $10K
- Judges: Haseeb Qureshi (Dragonfly GP), Frankie (Paradigm GP) — both Tier 1 VCs on Fiber's fundraising list
- **Strong showing:**
  - Gets Fiber/Fetch on their radar organically
  - Live Monad demo validates cross-chain expansion narrative
  - Strengthens conversation with Monad venture/ecosystem team
  - Produces working proof-of-concept for fundraising materials

### Solana vs. Monad Positioning
- Entering Agent Track to avoid committing FP or token to Monad
- Preserves Solana-first positioning
- If Monad ecosystem fund/venture conversations advance → deeper commitment could be strategically attractive
- Hackathon gives optionality without commitment
- Revisit post-hackathon with Greg

### Fetch as Standalone Brand?
- Worth discussing: "Fetch by Fiber" → eventually own product/brand?
- Agent-facing commerce intelligence layer (Fetch) vs. underlying behavioral intelligence protocol (Fiber) = distinct products/go-to-markets
- Parking for now — focus on shipping hackathon

---

**Key Phrase:** "Have your agent call my agent." 🚀  
**User phrase:** "How'd you get that deal?" — "I got an agent."
